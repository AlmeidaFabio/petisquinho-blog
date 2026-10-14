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
  await client.uploadFromDir(distDir, remotePath);

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
