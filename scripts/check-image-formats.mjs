/**
 * Verificacoes de integridade das imagens de post.
 *
 * Roda antes do build (ver package.json) para impedir que dois problemas
 * cheguem em producao:
 *
 *   1. Imagem raster colocada direto em public/images/posts. Essa pasta e o
 *      destino do pipeline, nao a origem: prepare-deploy.mjs converte o que
 *      esta em docs/imgs para WebP (qualidade 80, largura maxima 1600 px) e
 *      grava o resultado aqui. Um .jpg/.png jogado direto nesta pasta pula a
 *      conversao e vai para o ar em tamanho original. Foi assim que
 *      ceu-azul.jpg (3,0 MB) e cheiro-de-terra-molhada.jpg (997 KB) chegaram
 *      a producao e responderam por 67% do payload do site.
 *
 *   2. Post que referencia uma imagem inexistente. O Astro nao valida o campo
 *      `image:` do frontmatter, entao um caminho errado so aparece como
 *      imagem quebrada para o leitor.
 *
 * Arquivos na pasta sem nenhuma referencia sao apenas relatados como aviso:
 * nao quebram nada, mas costumam indicar post renomeado ou imagem trocada.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const imagesDir = path.join(projectRoot, 'public', 'images', 'posts');
const postsDir = path.join(projectRoot, 'src', 'content', 'posts');

// Saida esperada do pipeline (webp) mais formatos que nao precisam de conversao.
const PERMITIDOS = new Set(['.webp', '.svg', '.avif']);

// Raster que deveria ter passado pelo prepare-deploy.mjs.
const DEVERIAM_SER_CONVERTIDAS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.tif', '.tiff', '.bmp']);

const problemas = [];
const avisos = [];

const arquivos = (await fs.readdir(imagesDir, { withFileTypes: true }))
  .filter((entrada) => entrada.isFile())
  .map((entrada) => entrada.name)
  .sort();

// 1. Raster que pulou o pipeline.
for (const nome of arquivos) {
  const extensao = path.extname(nome).toLowerCase();
  if (DEVERIAM_SER_CONVERTIDAS.has(extensao)) {
    const tamanho = (await fs.stat(path.join(imagesDir, nome))).size;
    problemas.push({ tipo: 'nao-convertida', nome, extensao, tamanho });
  }
}

// 2. Imagem referenciada no frontmatter que nao existe no disco.
const referenciadas = new Set();
const posts = (await fs.readdir(postsDir, { withFileTypes: true }))
  .filter((entrada) => entrada.isFile() && path.extname(entrada.name).toLowerCase() === '.md')
  .map((entrada) => entrada.name)
  .sort();

for (const post of posts) {
  const conteudo = await fs.readFile(path.join(postsDir, post), 'utf8');
  const correspondencia = conteudo.match(/^image:\s*(?:"([^"]+)"|'([^']+)'|([^\s#]+))\s*$/m);
  const url = (correspondencia?.[1] ?? correspondencia?.[2] ?? correspondencia?.[3] ?? '').trim();

  if (!url) continue;

  const nomeArquivo = path.posix.basename(url);
  referenciadas.add(nomeArquivo);

  try {
    await fs.access(path.join(imagesDir, nomeArquivo));
  } catch {
    problemas.push({ tipo: 'ausente', nome: nomeArquivo, post, url });
  }
}

// 3. Arquivo sem referencia (nao falha o build).
for (const nome of arquivos) {
  if (!referenciadas.has(nome)) avisos.push(nome);
}

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

if (problemas.length === 0) {
  console.log(
    `[imagens] ${arquivos.length} arquivo(s) em public/images/posts, ${referenciadas.size} referencia(s) no frontmatter. Tudo certo.`
  );
} else {
  console.error('\n[imagens] Build interrompido: problema(s) de integridade encontrado(s).\n');

  for (const p of problemas) {
    if (p.tipo === 'nao-convertida') {
      console.error(`  Imagem raster que pulou o pipeline: public/images/posts/${p.nome} (${kb(p.tamanho)})`);
    } else {
      console.error(`  Imagem referenciada que nao existe: ${p.url}`);
      console.error(`    referenciada por src/content/posts/${p.post}`);
      console.error(`    esperado em public/images/posts/${p.nome}`);
    }
  }

  const naoConvertidas = problemas.filter((p) => p.tipo === 'nao-convertida');
  if (naoConvertidas.length > 0) {
    console.error('\n  public/images/posts e o destino do pipeline, nao a origem.');
    console.error('  Formatos aceitos aqui: ' + [...PERMITIDOS].join(', '));
    console.error('\n  Para publicar estas imagens corretamente:');
    console.error('    1. mova o arquivo original para docs/imgs/');
    console.error('    2. rode: npm run prepare:deploy');
    console.error('    3. atualize o campo `image:` do post para o .webp gerado');
    console.error('\n  Converter um arquivo ja publicado, sem passar por docs/imgs:');
    console.error(
      "    node -e \"import('sharp').then(async({default:s})=>{await s('public/images/posts/ARQUIVO.jpg').resize({width:1600,withoutEnlargement:true}).webp({quality:80}).toFile('public/images/posts/ARQUIVO.webp')})\""
    );
  }

  const ausentes = problemas.filter((p) => p.tipo === 'ausente');
  if (ausentes.length > 0) {
    console.error('\n  Confira o caminho no frontmatter ou adicione o arquivo em public/images/posts/.');
  }

  console.error('');
  process.exit(1);
}

if (avisos.length > 0) {
  console.warn(`[imagens] Aviso: sem referencia no frontmatter: ${avisos.join(', ')}`);
  console.warn('[imagens] Nao impede o build. Costuma indicar post renomeado ou capa trocada.');
}
