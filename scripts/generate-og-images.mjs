/**
 * Gera as imagens de pre-visualizacao (Open Graph) em JPG 1200x630.
 *
 * Por que existe:
 *   - og:image precisa de uma imagem dedicada. A home usava o favicon.png
 *     (256x256), que aparece como um icone minusculo no WhatsApp e no
 *     Instagram.
 *   - As capas dos posts sao WebP. Alguns rastreadores de pre-visualizacao
 *     ainda falham com WebP, entao o og:image de cada post e publicado em JPG.
 *
 * Saida (build artifacts, ignorados pelo git):
 *   public/og/default.jpg   -> home, categorias e paginas institucionais
 *   public/og/<slug>.jpg    -> um card por post, com a capa e o titulo
 *
 * Roda a cada build (ver package.json), entao um post novo ja ganha o card
 * sem nenhum passo manual. Os cards usam a fonte do sistema (Segoe UI no
 * Windows); como o resultado e commitado apenas no dist, isso nao afeta o
 * visitante.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const require = createRequire(path.join(projectRoot, 'package.json'));
const sharp = require('sharp');

const postsDir = path.join(projectRoot, 'src', 'content', 'posts');
const imagesDir = path.join(projectRoot, 'public', 'images', 'posts');
const outDir = path.join(projectRoot, 'public', 'og');

const LARGURA = 1200;
const ALTURA = 630;

const COR = {
  terracotta: '#C8553D',
  marine: '#1F2A44',
  mustard: '#E9B44C',
  cream: '#FAF5EC',
  graphite: '#2B2B2B'
};

const FONTE = 'Segoe UI, Arial, Helvetica, sans-serif';

const escapar = (texto) =>
  texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

// Quebra o titulo em linhas. Largura media de caractere em Segoe UI Bold
// gira em torno de 0.52 do tamanho da fonte.
function quebrarTitulo(titulo, tamanhoFonte, larguraMaxima) {
  const larguraCaractere = tamanhoFonte * 0.52;
  const maxCaracteres = Math.max(12, Math.floor(larguraMaxima / larguraCaractere));

  const palavras = titulo.split(/\s+/);
  const linhas = [];
  let atual = '';

  for (const palavra of palavras) {
    const candidata = atual ? `${atual} ${palavra}` : palavra;
    if (candidata.length <= maxCaracteres) {
      atual = candidata;
    } else {
      if (atual) linhas.push(atual);
      atual = palavra;
    }
  }
  if (atual) linhas.push(atual);

  // No maximo 3 linhas: se passar, corta a ultima com reticencias.
  if (linhas.length > 3) {
    const cortadas = linhas.slice(0, 3);
    cortadas[2] = `${cortadas[2].slice(0, Math.max(0, maxCaracteres - 1)).trimEnd()}…`;
    return cortadas;
  }
  return linhas;
}

function cardDePost(titulo) {
  const margem = 72;
  const larguraTexto = LARGURA - margem * 2;

  let tamanho = 58;
  let linhas = quebrarTitulo(titulo, tamanho, larguraTexto);
  if (linhas.length >= 3) {
    tamanho = 48;
    linhas = quebrarTitulo(titulo, tamanho, larguraTexto);
  }
  if (linhas.length <= 1) tamanho = 62;

  const alturaLinha = tamanho * 1.24;
  const baseUltima = ALTURA - 74;
  const basePrimeira = baseUltima - (linhas.length - 1) * alturaLinha;

  const texto = linhas
    .map(
      (linha, i) =>
        `<text x="${margem}" y="${(basePrimeira + i * alturaLinha).toFixed(0)}" font-family="${FONTE}" font-size="${tamanho}" font-weight="700" fill="#FFFFFF">${escapar(linha)}</text>`
    )
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${LARGURA}" height="${ALTURA}" viewBox="0 0 ${LARGURA} ${ALTURA}">
  <defs>
    <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${COR.marine}" stop-opacity="0"/>
      <stop offset="45%" stop-color="${COR.marine}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${COR.marine}" stop-opacity="0.94"/>
    </linearGradient>
  </defs>
  <rect width="${LARGURA}" height="${ALTURA}" fill="url(#scrim)"/>
  <rect x="${margem}" y="58" width="18" height="18" rx="4" fill="${COR.terracotta}"/>
  <text x="${margem + 30}" y="73" font-family="${FONTE}" font-size="26" font-weight="800" fill="#FFFFFF">petisquinho</text>
  ${texto}
</svg>`;
}

function cardPadrao() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${LARGURA}" height="${ALTURA}" viewBox="0 0 ${LARGURA} ${ALTURA}">
  <rect width="${LARGURA}" height="${ALTURA}" fill="${COR.cream}"/>
  <rect x="0" y="0" width="${LARGURA}" height="16" fill="${COR.terracotta}"/>
  <rect x="0" y="16" width="${LARGURA}" height="6" fill="${COR.mustard}"/>
  <circle cx="1058" cy="452" r="86" fill="${COR.mustard}" opacity="0.9"/>
  <circle cx="1058" cy="452" r="118" fill="none" stroke="${COR.terracotta}" stroke-width="6" opacity="0.35"/>
  <text x="84" y="300" font-family="${FONTE}" font-size="130" font-weight="800" fill="${COR.terracotta}" letter-spacing="-3">petisquinho</text>
  <text x="88" y="376" font-family="${FONTE}" font-size="38" font-weight="600" fill="${COR.marine}">Uma por&#231;&#227;o de curiosidade por dia.</text>
  <rect x="88" y="424" width="150" height="5" fill="${COR.terracotta}"/>
  <text x="88" y="486" font-family="${FONTE}" font-size="27" fill="${COR.graphite}">Cultura, curiosidades e variedades em poucos minutos.</text>
  <text x="88" y="556" font-family="${FONTE}" font-size="24" font-weight="700" fill="${COR.terracotta}">petisquinho.com</text>
</svg>`;
}

// ---------------------------------------------------------------- execucao

await fs.mkdir(outDir, { recursive: true });

const arquivos = (await fs.readdir(postsDir))
  .filter((f) => path.extname(f).toLowerCase() === '.md')
  .sort();

let gerados = 0;
const problemas = [];

for (const arquivo of arquivos) {
  const conteudo = await fs.readFile(path.join(postsDir, arquivo), 'utf8');
  const titulo = (conteudo.match(/^title:\s*"([^"]+)"/m) || [])[1];
  const imagem = (conteudo.match(/^image:\s*"([^"]+)"/m) || [])[1];
  const slug = path.basename(arquivo, '.md');

  if (!titulo) {
    problemas.push(`${arquivo}: sem campo title`);
    continue;
  }

  let fundo;
  if (imagem) {
    const nomeCapa = path.posix.basename(imagem);
    try {
      fundo = await sharp(path.join(imagesDir, nomeCapa))
        .resize(LARGURA, ALTURA, { fit: 'cover', position: 'centre' })
        .toBuffer();
    } catch (erro) {
      fundo = null;
      problemas.push(`${arquivo}: capa ilegivel (${nomeCapa}) — ${erro.message}`);
    }
  } else {
    fundo = null;
    problemas.push(`${arquivo}: sem campo image`);
  }

  // Sem capa utilizavel, o card cai no fundo padrao para nao quebrar o post.
  const base = fundo
    ? sharp(fundo)
    : sharp({
        create: { width: LARGURA, height: ALTURA, channels: 3, background: COR.cream }
      });

  await base
    .composite([{ input: Buffer.from(cardDePost(titulo)), top: 0, left: 0 }])
    .jpeg({ quality: 84, chromaSubsampling: '4:4:4' })
    .toFile(path.join(outDir, `${slug}.jpg`));

  gerados += 1;
}

await sharp(Buffer.from(cardPadrao()))
  .jpeg({ quality: 88, chromaSubsampling: '4:4:4' })
  .toFile(path.join(outDir, 'default.jpg'));

if (problemas.length > 0) {
  console.warn('[og] Avisos:');
  for (const p of problemas) console.warn(`  ${p}`);
}

console.log(`[og] ${gerados} card(s) de post + default.jpg gerados em public/og/`);
