/**
 * Confere a saúde das fontes citadas pelos posts.
 *
 * Por que existe:
 *   O PRD promete "fontes citadas no final, com checagem em pelo menos duas
 *   fontes para fatos e ciência", e a direção editorial veta "usar apenas o
 *   nome de uma instituição como decoração". Nada disso era verificável: só
 *   descobri que duas fontes não abriam porque fui testar uma a uma na mão.
 *   Este script faz isso sozinho, e pode ser rodado a cada tantos posts.
 *
 * O que ele acusa:
 *   1. post com menos de duas fontes (regra do PRD)
 *   2. fonte que aponta para homepage em vez de página específica
 *   3. fonte que não abre
 *
 * Como classifica o que "não abre":
 *   - 401 e falhas de rede, DNS, TLS, 404 e 5xx são PROBLEMA: o leitor não
 *     chega ao conteúdo. Um certificado TLS inválido, por exemplo, mostra
 *     aviso de segurança no navegador.
 *   - 403 é tratado como AVISO, não como problema: na maioria dos casos é
 *     bloqueio de robô, e a página abre normalmente no navegador de uma
 *     pessoa. Acusar 403 como quebrado daria falso positivo em cdc.gov,
 *     loc.gov e unesco.org, que são fontes legítimas.
 *
 * Uso:
 *   npm run checar-fontes
 *
 * Não entra no build de propósito: depende de rede, e um site de terceiro
 * fora do ar não pode derrubar uma publicação.
 */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const postsDir = path.join(projectRoot, 'src', 'content', 'posts');

const MINIMO_DE_FONTES = 2;

/**
 * 45 s, e não 25 s: medido, a página do NIST 800-63B responde 200 mas demora
 * mais que 25 s a partir daqui. Com o limite curto ela era acusada de "não
 * abre" — falso positivo contra uma fonte primária legítima.
 */
const TIMEOUT = 45000;

/**
 * Uma nova tentativa antes de acusar.
 *
 * Reset de conexão e timeout são intermitentes: o Record respondeu 429 e, na
 * tentativa seguinte, 200. Acusar na primeira falha produziria trabalho falso
 * para o autor, que é pior que não checar.
 */
const TENTATIVAS = 2;

/**
 * Uma tentativa de busca. `rejeitar()` é chamado quando a falha é do tipo que
 * vale repetir (rede, timeout, 5xx, 429).
 */
function umaTentativa(url) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.request(
      url,
      {
        method: 'GET',
        timeout: TIMEOUT,
        // Alguns servidores acadêmicos têm cadeia de certificado incompleta. A
        // intenção aqui é medir se o conteúdo existe, não validar a cadeia —
        // isso é medido à parte, porque quebra a experiência do leitor.
        rejectUnauthorized: false,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,*/*',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
        }
      },
      (res) => {
        res.resume();
        res.on('end', () => {
          const s = res.statusCode;
          const repetivel = s >= 500 || s === 429;
          resolve({ status: s, repetivel });
        });
      }
    );
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', (e) => resolve({ erro: e.code || e.message, repetivel: true }));
    req.end();
  });
}

async function buscar(url) {
  let ultimo;
  for (let tentativa = 1; tentativa <= TENTATIVAS; tentativa += 1) {
    ultimo = await umaTentativa(url);
    if (!ultimo.repetivel) return ultimo;
  }
  return ultimo;
}

/**
 * Códigos que significam mesmo "o navegador vai mostrar aviso de segurança".
 *
 * ECONNRESET e timeout NÃO entram aqui: são falhas de conexão, não de
 * certificado, e costumam ser intermitentes. Tratá-los como certificado
 * inválido deu falso positivo em dialnet.unirioja.es e num blog da
 * Universidade de Reading, que respondem 200 normalmente.
 */
const ERROS_DE_CERTIFICADO = new Set([
  'SELF_SIGNED_CERT_IN_CHAIN',
  'DEPTH_ZERO_SELF_SIGNED_CERT',
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
  'CERT_HAS_EXPIRED',
  'ERR_TLS_CERT_ALTNAME_INVALID',
  'UNABLE_TO_GET_ISSUER_CERT_LOCALLY'
]);

/** Mede se a cadeia TLS do site é válida, separadamente do status HTTP. */
function problemaDeCertificado(url) {
  return new Promise((resolve) => {
    if (!url.startsWith('https')) return resolve(null);

    const req = https.request(url, { method: 'GET', timeout: TIMEOUT, rejectUnauthorized: true }, (res) => {
      res.resume();
      res.on('end', () => resolve(null));
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', (e) => resolve(ERROS_DE_CERTIFICADO.has(e.code) ? e.code : null));
    req.end();
  });
}

const ehHomepage = (url) => {
  try {
    const { pathname } = new URL(url);
    return pathname === '/' || pathname === '';
  } catch {
    return false;
  }
};

// ---------------------------------------------------------------- execução

const arquivos = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md')).sort();
const posts = [];

for (const arquivo of arquivos) {
  const texto = fs.readFileSync(path.join(postsDir, arquivo), 'utf8');
  const frontmatter = (texto.match(/^---\r?\n([\s\S]*?)\r?\n---/) || [])[1] || '';

  // O bloco `sources` é o último do frontmatter e usa linhas indentadas.
  const bloco = frontmatter.match(/^sources:[ \t]*\r?\n((?:[ \t]+.*(?:\r?\n|$))*)/m);
  const fontes = bloco
    ? [...bloco[1].matchAll(/-\s*label:\s*"([^"]+)"\s*\r?\n\s*url:\s*"([^"]+)"/g)].map((m) => ({
        label: m[1],
        url: m[2]
      }))
    : [];

  posts.push({ slug: arquivo.replace(/\.md$/, ''), fontes });
}

const urlsUnicas = [...new Set(posts.flatMap((p) => p.fontes.map((f) => f.url)))];
const resultados = new Map();

console.log(`Conferindo ${urlsUnicas.length} URLs de ${posts.length} posts...\n`);

for (const url of urlsUnicas) {
  const resposta = await buscar(url);
  const certificado = await problemaDeCertificado(url);
  resultados.set(url, { ...resposta, certificado });
}

/**
 * Um veredito por fonte, do problema mais bloqueante para o menos.
 *
 * O certificado vem primeiro porque ele impede a conexão antes de qualquer
 * resposta HTTP: sem ele, o leitor nem chega a ver um 404.
 */
function avaliarFonte(url) {
  const r = resultados.get(url) || {};

  if (r.certificado) {
    return { nivel: 'problema', texto: `certificado TLS invalido (${r.certificado}), o navegador mostra aviso` };
  }
  if (r.erro) {
    return { nivel: 'problema', texto: `nao abre (${r.erro})` };
  }
  if (r.status === 401) {
    return { nivel: 'problema', texto: 'exige autenticacao (401), o leitor comum nao acessa' };
  }
  if (r.status >= 400 && r.status !== 403 && r.status !== 429) {
    return { nivel: 'problema', texto: `responde ${r.status}` };
  }
  // 403 e 429 são artefatos da medição, não defeitos da fonte: o primeiro é
  // bloqueio de robô e o segundo, limite de requisições. Nos dois casos a
  // página abre normalmente no navegador de uma pessoa.
  if (r.status === 403) {
    return { nivel: 'aviso', texto: 'responde 403, provavel bloqueio de robo (abre no navegador)' };
  }
  if (r.status === 429) {
    return { nivel: 'aviso', texto: 'responde 429, limite de requisicoes (abre no navegador)' };
  }
  return null;
}

const problemas = [];
const avisos = [];

for (const post of posts) {
  if (post.fontes.length < MINIMO_DE_FONTES) {
    problemas.push(
      `${post.slug}: ${post.fontes.length} fonte(s), o PRD pede pelo menos ${MINIMO_DE_FONTES}`
    );
  }

  for (const fonte of post.fontes) {
    if (ehHomepage(fonte.url)) {
      problemas.push(`${post.slug}: fonte aponta para homepage — ${fonte.url}`);
    }

    const veredito = avaliarFonte(fonte.url);
    if (!veredito) continue;

    const linha = `${post.slug}: ${veredito.texto} — ${fonte.url}`;
    if (veredito.nivel === 'problema') problemas.push(linha);
    else avisos.push(linha);
  }
}

// ---------------------------------------------------------------- relatório

const semFonte = posts.filter((p) => p.fontes.length === 0);
const comUma = posts.filter((p) => p.fontes.length === 1);

console.log('RESUMO');
console.log(`  posts: ${posts.length}`);
console.log(`  posts sem nenhuma fonte: ${semFonte.length}`);
console.log(`  posts com uma fonte so:  ${comUma.length}`);
console.log(`  fontes declaradas: ${posts.reduce((a, p) => a + p.fontes.length, 0)}`);
console.log(`  URLs distintas: ${urlsUnicas.length}`);

const quebradas = [...resultados.entries()].filter(([url]) => {
  const v = avaliarFonte(url);
  return v && v.nivel === 'problema';
});
console.log(`  fontes com problema real: ${quebradas.length}`);
console.log(`  fontes com aviso (403): ${[...resultados.values()].filter((r) => r.status === 403).length}`);

if (problemas.length) {
  console.log(`\nPROBLEMAS (${problemas.length})`);
  for (const p of problemas) console.log(`  - ${p}`);
}

if (avisos.length) {
  console.log(`\nAVISOS (${avisos.length})`);
  for (const a of avisos) console.log(`  - ${a}`);
}

if (!problemas.length) {
  console.log('\nNenhum problema. Todos os posts com pelo menos duas fontes, todas especificas e abrindo.');
}

process.exitCode = problemas.length ? 1 : 0;
