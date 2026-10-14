import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'basic-ftp';
import { isSupportedImageFile } from './image-formats.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const draftPostsDir = path.join(projectRoot, 'docs', 'posts');
const draftImagesDir = path.join(projectRoot, 'docs', 'imgs');

const host = process.env.HOSTGATOR_HOST;
const tlsServername = process.env.HOSTGATOR_TLS_SERVERNAME;
const port = Number(process.env.HOSTGATOR_PORT || 21);
const user = process.env.HOSTGATOR_USER;
const password = process.env.HOSTGATOR_PASSWORD;
const remotePath = process.env.HOSTGATOR_REMOTE_PATH || '/public_html';

if (!host || !user || !password) {
  console.error('Credenciais ausentes. Defina HOSTGATOR_HOST, HOSTGATOR_USER e HOSTGATOR_PASSWORD antes de rodar o deploy.');
  console.error('Opcional: HOSTGATOR_PORT (padrão 21) e HOSTGATOR_REMOTE_PATH (padrão /public_html)');
  process.exit(1);
}

if (!fs.existsSync(distDir)) {
  console.error('Pasta dist não encontrada. Rode primeiro: npm run build');
  process.exit(1);
}

const client = new Client();
client.ftp.verbose = false;

try {
  console.log(`Conectando ao HostGator em ${host}:${port}...`);
  await client.access({
    host,
    port,
    user,
    password,
    secure: true,
    ...(tlsServername ? { secureOptions: { servername: tlsServername } } : {})
  });

  console.log(`Entrando em ${remotePath}...`);
  await client.ensureDir(remotePath);

  const postEntries = await fsPromises.readdir(draftPostsDir, { withFileTypes: true });
  const originalPosts = postEntries.filter(
    (entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === '.md'
  );

  console.log(`Enviando a build do site para ${host}...`);

  // Os assets sobem ANTES do HTML, e não junto.
  //
  // O CSS e o JS carregam hash de conteúdo no nome, então o HTML novo aponta
  // para um arquivo que ainda não existe no servidor até o envio chegar nele.
  // Subindo tudo de uma vez, a ordem é a do sistema de arquivos, e o HTML pode
  // ir primeiro: nessa janela, um pedido do CSS recebe 404 e a Cloudflare
  // guarda esse 404 — a página fica sem estilo por horas, mesmo com o arquivo
  // já publicado. Foi o que aconteceu no deploy de 15/10/2026: o
  // busca.DaQYGQm0.css respondeu 404 com cf-cache-status HIT por 4 horas,
  // enquanto a mesma URL com um parâmetro qualquer devolvia 200 text/css.
  //
  // Com os assets primeiro, o HTML só aparece quando tudo que ele referencia já
  // está lá. Torna o deploy quase atômico do ponto de vista do leitor.
  const pastasDeAsset = ['_astro', 'images', 'og'];

  for (const pasta of pastasDeAsset) {
    const local = path.join(distDir, pasta);
    if (fs.existsSync(local)) {
      await client.uploadFromDir(local, path.posix.join(remotePath, pasta));
      console.log(`  assets: ${pasta}/ enviado`);
    }
  }

  const entradas = await fsPromises.readdir(distDir, { withFileTypes: true });
  for (const entrada of entradas) {
    if (pastasDeAsset.includes(entrada.name)) continue;

    const local = path.join(distDir, entrada.name);
    const remoto = path.posix.join(remotePath, entrada.name);

    if (entrada.isDirectory()) {
      await client.uploadFromDir(local, remoto);
    } else {
      await client.uploadFrom(local, remoto);
    }
  }

  console.log('  HTML, feeds e .htaccess enviados');

  for (const post of originalPosts) {
    await fsPromises.unlink(path.join(draftPostsDir, post.name));
  }

  if (originalPosts.length > 0) {
    console.log(`Removidos ${originalPosts.length} post(s) original(is) após o deploy.`);
  }

  const imageEntries = await fsPromises.readdir(draftImagesDir, { withFileTypes: true });
  const originalImages = imageEntries.filter(
    (entry) => entry.isFile() && isSupportedImageFile(entry.name)
  );

  for (const image of originalImages) {
    await fsPromises.unlink(path.join(draftImagesDir, image.name));
  }

  if (originalImages.length > 0) {
    console.log(`Removidas ${originalImages.length} imagem(ns) original(is) após o deploy.`);
  }

  console.log('Deploy concluído com sucesso.');
} catch (error) {
  console.error('Falha no processo de deploy para HostGator.');
  console.error(error);
  process.exit(1);
} finally {
  client.close();
}
