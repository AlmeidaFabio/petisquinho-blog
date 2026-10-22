import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const docsDir = path.join(projectRoot, 'docs');

// Caixas de entrada.
//
// `docs/posts` é a fila do que sai NESTE deploy: o autor move para lá o post
// que está pronto. São poucos de cada vez, de propósito — um dia, um post.
//
// `docs/editing` é a sala de espera, onde os posts ficam até a vez, e serve como
// origem das capas: a imagem pode continuar ao lado do rascunho, porque o
// script procura o arquivo pelo nome declarado no campo `image`.
//
// `docs/imgs` é a pasta de imagens do fluxo antigo e continua valendo.
const postInboxes = [path.join(docsDir, 'posts')];
const imageInboxes = [path.join(docsDir, 'editing'), path.join(docsDir, 'imgs'), path.join(docsDir, 'posts')];

const publishedPostsDir = path.join(projectRoot, 'src', 'content', 'posts');
const publishedImagesDir = path.join(projectRoot, 'public', 'images', 'posts');

// O que foi consumido da caixa de entrada. O envio apaga estes arquivos só
// depois que o upload termina com sucesso. Fica fora do git.
const manifestPath = path.join(projectRoot, '.deploy-pendentes.json');

const EXTENSOES_DE_IMAGEM = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'tif', 'tiff', 'bmp'];

// Data de publicação: o dia do deploy, no fuso de quem roda.
//
// O autor não precisa acertar isso no rascunho. Um post que espera duas semanas
// em `docs/editing` sai com a data em que foi publicado, não com a data em que
// foi escrito — e como o carrossel da home usa a data para escolher a matéria
// mais recente de cada seção, data errada aparecia como destaque atrasado.
const agora = new Date();
const hoje = [
  agora.getFullYear(),
  String(agora.getMonth() + 1).padStart(2, '0'),
  String(agora.getDate()).padStart(2, '0')
].join('-');

async function existe(caminho) {
  return fs.access(caminho).then(() => true, () => false);
}

function relativo(caminho) {
  return path.relative(projectRoot, caminho);
}

// ---------------------------------------------------------------------------
// 1. Reúne os posts em espera
// ---------------------------------------------------------------------------
const rascunhos = [];

for (const caixa of postInboxes) {
  let entradas;
  try {
    entradas = await fs.readdir(caixa, { withFileTypes: true });
  } catch {
    continue;
  }
  for (const entrada of entradas) {
    if (entrada.isFile() && path.extname(entrada.name).toLowerCase() === '.md') {
      rascunhos.push({ caixa, arquivo: entrada.name });
    }
  }
}

rascunhos.sort((a, b) => a.arquivo.localeCompare(b.arquivo));

await fs.mkdir(publishedPostsDir, { recursive: true });
await fs.mkdir(publishedImagesDir, { recursive: true });

if (rascunhos.length === 0) {
  console.log(
    `Nenhum post em espera em ${postInboxes.map(relativo).join(' ou ')}.`
  );
}

// ---------------------------------------------------------------------------
// 2. Publica cada um
// ---------------------------------------------------------------------------
const consumidos = [];

for (const { caixa, arquivo } of rascunhos) {
  const origemPost = path.join(caixa, arquivo);
  let conteudo = await fs.readFile(origemPost, 'utf8');

  // 2a. a data passa a ser a de hoje
  const dataAnterior = conteudo.match(/^date:\s*(.+)$/m)?.[1]?.trim();
  if (!dataAnterior) {
    throw new Error(`${arquivo} não tem campo "date" no frontmatter.`);
  }
  conteudo = conteudo.replace(/^date:\s*.+$/m, `date: ${hoje}`);

  // 2b. a capa: encontra o original e converte para WebP
  const imagemDeclarada = conteudo.match(/^image:\s*(?:"([^"]+)"|'([^']+)'|([^\s#]+))\s*$/m);
  const urlDaImagem = imagemDeclarada?.[1] ?? imagemDeclarada?.[2] ?? imagemDeclarada?.[3];

  if (urlDaImagem?.startsWith('/images/posts/')) {
    const nomeDeclarado = path.posix.basename(urlDaImagem);
    const base = path.posix.basename(nomeDeclarado, path.posix.extname(nomeDeclarado));
    const destino = path.join(publishedImagesDir, `${base}.webp`);

    if (await existe(destino)) {
      console.log(`  capa: ${base}.webp já existe em public/images/posts, mantida`);
    } else {
      let origemImagem = null;

      for (const pasta of imageInboxes) {
        for (const extensao of EXTENSOES_DE_IMAGEM) {
          const candidato = path.join(pasta, `${base}.${extensao}`);
          if (await existe(candidato)) {
            origemImagem = candidato;
            break;
          }
        }
        if (origemImagem) break;
      }

      if (!origemImagem) {
        throw new Error(
          `Capa de ${arquivo} não encontrada. Procurei ${base}.(${EXTENSOES_DE_IMAGEM.join('|')}) em ` +
          `${imageInboxes.map(relativo).join(' e ')}.`
        );
      }

      const tamanhoEntrada = (await fs.stat(origemImagem)).size;
      await sharp(origemImagem)
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(destino);
      const tamanhoSaida = (await fs.stat(destino)).size;
      const reducao = Math.round((1 - tamanhoSaida / tamanhoEntrada) * 100);

      console.log(`  capa: ${path.basename(origemImagem)} -> ${base}.webp (${reducao}% menor)`);
      consumidos.push(origemImagem);
    }

    conteudo = conteudo.replace(urlDaImagem, `/images/posts/${base}.webp`);
  }

  // 2c. copia o post, sem sobrescrever conteúdo divergente
  const destinoPost = path.join(publishedPostsDir, arquivo);

  if (await existe(destinoPost)) {
    const atual = await fs.readFile(destinoPost, 'utf8');
    if (atual !== conteudo) {
      throw new Error(
        `O post ${arquivo} já existe em src/content/posts e está diferente. ` +
        'Resolva a divergência antes de publicar para evitar sobrescrever conteúdo.'
      );
    }
    console.log(`  ${arquivo}: já publicado com este conteúdo, nada a fazer`);
  } else {
    await fs.writeFile(destinoPost, conteudo, 'utf8');
    const de = dataAnterior.replace(/["']/g, '');
    console.log(`  ${arquivo} -> src/content/posts/  (data: ${de} -> ${hoje})`);
  }

  consumidos.push(origemPost);
}

// ---------------------------------------------------------------------------
// 3. Manifesto do que o envio pode apagar depois do upload
// ---------------------------------------------------------------------------
if (consumidos.length > 0) {
  await fs.writeFile(manifestPath, JSON.stringify(consumidos, null, 2), 'utf8');
  console.log(
    `\n${consumidos.length} arquivo(s) saem da caixa de entrada só depois que o upload der certo.`
  );
} else {
  await fs.rm(manifestPath, { force: true });
}
