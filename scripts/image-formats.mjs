import path from 'node:path';

const supportedImageExtensions = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.avif',
  '.tif',
  '.tiff',
  '.svg'
]);

export function isSupportedImageFile(fileName) {
  return supportedImageExtensions.has(path.extname(fileName).toLowerCase());
}
