import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { isSupportedImageFile } from './image-formats.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const docsDir = path.join(projectRoot, 'docs');
const draftsDir = path.join(docsDir, 'posts');
const draftImagesDir = path.join(docsDir, 'imgs');
const publishedPostsDir = path.join(projectRoot, 'src', 'content', 'posts');
const publishedImagesDir = path.join(projectRoot, 'public', 'images', 'posts');

const imageEntries = await fs.readdir(draftImagesDir, { withFileTypes: true });
const imageFiles = imageEntries
  .filter((entry) => entry.isFile() && isSupportedImageFile(entry.name))
  .sort((a, b) => a.name.localeCompare(b.name));

await fs.mkdir(publishedImagesDir, { recursive: true });

for (const file of imageFiles) {
  const inputPath = path.join(draftImagesDir, file.name);
  const outputName = `${path.parse(file.name).name}.webp`;
  const outputPath = path.join(publishedImagesDir, outputName);
  const inputSize = (await fs.stat(inputPath)).size;

  await sharp(inputPath)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath);

  const outputSize = (await fs.stat(outputPath)).size;
  const reduction = Math.round((1 - outputSize / inputSize) * 100);
  console.log(`${file.name} -> public/images/posts/${outputName} (${reduction}% menor)`);
}

const postEntries = await fs.readdir(draftsDir, { withFileTypes: true });
const draftPosts = postEntries
  .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === '.md')
  .sort((a, b) => a.name.localeCompare(b.name));

await fs.mkdir(publishedPostsDir, { recursive: true });

for (const file of draftPosts) {
  const sourcePath = path.join(draftsDir, file.name);
  const outputPath = path.join(publishedPostsDir, file.name);
  let content = await fs.readFile(sourcePath, 'utf8');
  const imageMatch = content.match(/^image:\s*(?:"([^"]+)"|'([^']+)'|([^\s#]+))\s*$/m);
  const imageUrl = imageMatch?.[1] ?? imageMatch?.[2] ?? imageMatch?.[3];

  if (imageUrl?.startsWith('/images/posts/')) {
    const imageName = path.posix.basename(imageUrl);
    const extension = path.posix.extname(imageName);
    const webpName = `${path.posix.basename(imageName, extension)}.webp`;

    if (isSupportedImageFile(imageName)) {
      const updatedImageUrl = `/images/posts/${webpName}`;
      content = content.replace(imageUrl, updatedImageUrl);

      const publishedImagePath = path.join(publishedImagesDir, webpName);

      try {
        await fs.access(publishedImagePath);
      } catch {
        throw new Error(
          `Imagem referenciada por ${file.name} não encontrada: ${publishedImagePath}`
        );
      }
    }
  }

  try {
    const existingContent = await fs.readFile(outputPath, 'utf8');
    if (existingContent !== content) {
      throw new Error(
        `O post ${file.name} já existe em src/content/posts e está diferente. ` +
        'Resolva a divergência antes de publicar para evitar sobrescrever conteúdo.'
      );
    }
    console.log(`${file.name} já está publicado em src/content/posts.`);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
    await fs.writeFile(outputPath, content, 'utf8');
    console.log(`${file.name} -> src/content/posts/${file.name}`);
  }
}

if (imageFiles.length === 0) {
  console.log(`Nenhuma imagem compatível encontrada em ${draftImagesDir}.`);
}

if (draftPosts.length === 0) {
  console.log(`Nenhum post Markdown encontrado em ${draftsDir}.`);
}
