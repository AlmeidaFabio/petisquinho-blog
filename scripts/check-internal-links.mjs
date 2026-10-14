/**
 * Confere os links internos do site antes do build.
 *
 * Por que existe:
 *   A direção editorial pede de dois a três links internos contextuais por
 *   post. O primeiro post escrito sob essa regra saiu com três links no
 *   formato perfeito — contextuais, com barra final, texto descritivo — e
 *   DOIS deles apontando para slugs que não existem. O leitor clicava e caía
 *   na 404. Escrever a regra no documento não bastou: faltava a trava.
 *
 * O que ele acusa:
 *   1. link para post que não existe
 *   2. link para categoria que não existe
 *   3. link interno sem barra no fim (custa um redirecionamento, ver P1-4)
 *   4. link para página de categoria além da última que existe
 *   5. link interno para caminho desconhecido
 *
 * Roda no build: é verificação de sistema de arquivos, sem rede, então não
 * tem o risco que fez o checador de fontes ficar fora dele.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const postsDir = path.join(projectRoot, 'src', 'content', 'posts');
const pagesDir = path.join(projectRoot, 'src', 'pages');

// A fonte das categorias é siteConfig; lida por leitura do arquivo porque este
// script é .mjs e não importa .ts. Se o formato de lá mudar, o script avisa em
// vez de passar em silêncio.
const siteConfigTexto = fs.readFileSync(path.join(projectRoot, 'src', 'config', 'site.ts'), 'utf8');
const categorias = [...siteConfigTexto.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]);
if (categorias.length === 0) {
  console.error('[links] nao consegui ler as categorias de src/config/site.ts — abortando');
  process.exit(1);
}

// Posts por página, lidos de src/utils/categorias.ts, para validar /pagina/N/.
const categoriasTexto = fs.readFileSync(path.join(projectRoot, 'src', 'utils', 'categorias.ts'), 'utf8');
const porPagina = Number((categoriasTexto.match(/POSTS_POR_PAGINA\s*=\s*(\d+)/) || [])[1] || 0);

/** Rotas estáticas que existem como página, sem parâmetro. */
const ROTAS_FIXAS = new Set([
  '/',
  '/busca/',
  '/sobre/',
  '/contato/',
  '/privacidade/',
  '/termos-de-uso/',
  '/404.html'
]);

const arquivos = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'));
const slugs = new Set(arquivos.map((f) => f.replace(/\.md$/, '')));

/** Quantos posts cada categoria tem, para saber quantas páginas ela gera. */
const postsPorCategoria = new Map();
for (const arquivo of arquivos) {
  const texto = fs.readFileSync(path.join(postsDir, arquivo), 'utf8');
  const categoria = (texto.match(/^category:\s*"([^"]+)"/m) || [])[1];
  if (categoria) postsPorCategoria.set(categoria, (postsPorCategoria.get(categoria) || 0) + 1);
}

/** Devolve o problema encontrado, ou null quando o link está certo. */
function avaliarLink(link) {
  if (!link.startsWith('/')) return null; // externo ou âncora
  if (link.startsWith('//')) return null; // protocolo-relativo
  if (/\.(xml|txt|png|svg|webp|jpg|jpeg|ico|css|js|pdf)$/i.test(link)) return null;

  const semBarra = !link.endsWith('/');
  const limpo = semBarra ? link : link.slice(0, -1);

  const post = limpo.match(/^\/posts\/([^/]+)$/);
  if (post) {
    if (!slugs.has(post[1])) return `aponta para um post que nao existe: ${link}`;
    if (semBarra) return `sem barra no fim, custa um redirecionamento: ${link}`;
    return null;
  }

  const pagina = limpo.match(/^\/categoria\/([^/]+)\/pagina\/(\d+)$/);
  if (pagina) {
    if (!categorias.includes(pagina[1])) return `categoria inexistente: ${link}`;
    if (semBarra) return `sem barra no fim, custa um redirecionamento: ${link}`;
    const total = Math.max(1, Math.ceil((postsPorCategoria.get(pagina[1]) || 0) / porPagina));
    if (Number(pagina[2]) > total) return `pagina ${pagina[2]} de uma categoria que so tem ${total}: ${link}`;
    if (Number(pagina[2]) < 2) return `pagina 1 nao existe como endereco proprio (use a raiz da categoria): ${link}`;
    return null;
  }

  const categoria = limpo.match(/^\/categoria\/([^/]+)$/);
  if (categoria) {
    if (!categorias.includes(categoria[1])) return `categoria inexistente: ${link}`;
    if (semBarra) return `sem barra no fim, custa um redirecionamento: ${link}`;
    return null;
  }

  if (ROTAS_FIXAS.has(link)) return null;
  return `link interno para caminho desconhecido: ${link}`;
}

const problemas = [];
let conferidos = 0;

/** 1) Links nos corpos dos posts. */
for (const arquivo of arquivos) {
  const texto = fs.readFileSync(path.join(postsDir, arquivo), 'utf8');
  const corpo = texto.replace(/^---[\s\S]*?---/, '');
  const links = [...corpo.matchAll(/\]\((\/[^)\s]+)\)/g)].map((m) => m[1]);

  for (const link of links) {
    conferidos += 1;
    const problema = avaliarLink(link);
    if (problema) problemas.push(`${arquivo.replace(/\.md$/, '')}: ${problema}`);
  }
}

/** 2) Links escritos à mão nos templates (os dinâmicos vêm da coleção). */
function varrerTemplates(diretorio) {
  for (const entrada of fs.readdirSync(diretorio, { withFileTypes: true })) {
    const caminho = path.join(diretorio, entrada.name);
    if (entrada.isDirectory()) {
      varrerTemplates(caminho);
      continue;
    }
    if (!entrada.name.endsWith('.astro')) continue;

    const texto = fs.readFileSync(caminho, 'utf8');
    const relativo = path.relative(projectRoot, caminho);
    for (const m of texto.matchAll(/href="(\/[^"{}]+)"/g)) {
      conferidos += 1;
      const problema = avaliarLink(m[1]);
      if (problema) problemas.push(`${relativo}: ${problema}`);
    }
  }
}
varrerTemplates(pagesDir);

if (problemas.length) {
  console.error(`[links] ${problemas.length} problema(s) em ${conferidos} links internos:`);
  for (const p of problemas) console.error(`  - ${p}`);
  process.exit(1);
}

console.log(`[links] ${conferidos} links internos conferidos: nenhum problema`);
