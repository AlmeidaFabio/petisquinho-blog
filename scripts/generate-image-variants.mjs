/**
 * Gera as variantes de largura das capas, para o srcset dos templates.
 *
 * Por que existe:
 *   As capas são servidas em um único tamanho (1376 a 1600 px de largura) para
 *   qualquer tela. Em um viewport de 412 px isso é 4x mais imagem do que o
 *   necessário, e era o principal item pendente de LCP: o Lighthouse estimava
 *   556 KiB de desperdício só na home.
 *
 * O que faz:
 *   Para cada capa raster em public/images/posts, gera versões menores em
 *   public/images/variantes/, e um manifest.json que os templates leem para
 *   montar o srcset.
 *
 * Decisões:
 *   - SVG fica de fora: vetor escala sozinho e não precisa de variantes.
 *   - Nunca amplia: só gera larguras menores que a original.
 *   - A própria original entra no srcset, na largura real dela, em vez de ser
 *     reencodada como variante. Por isso o manifest guarda larguraOriginal.
 *   - Pula variante já gerada e mais nova que a capa, para o build não refazer
 *     trabalho a cada execução.
 *
 * Saída (build artifacts, no .gitignore):
 *   public/images/variantes/<nome>-<largura>.webp
 *   public/images/variantes/manifest.json
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const require = createRequire(path.join(projectRoot, 'package.json'));
const sharp = require('sharp');

const capasDir = path.join(projectRoot, 'public', 'images', 'posts');
const saidaDir = path.join(projectRoot, 'public', 'images', 'variantes');
const manifestPath = path.join(saidaDir, 'manifest.json');

const LARGURAS = [400, 800, 1200, 1600];
const QUALIDADE = 80;

await fs.mkdir(saidaDir, { recursive: true });

const arquivos = (await fs.readdir(capasDir, { withFileTypes: true }))
  .filter((entrada) => entrada.isFile() && /\.webp$/i.test(entrada.name))
  .map((entrada) => entrada.name)
  .sort();

const manifest = {};
let geradas = 0;
let puladas = 0;

for (const arquivo of arquivos) {
  const origem = path.join(capasDir, arquivo);
  const nome = path.basename(arquivo, '.webp');
  const infoOrigem = await fs.stat(origem);
  const meta = await sharp(origem).metadata();
  const larguraOriginal = meta.width;

  if (!larguraOriginal) {
    console.warn(`[variantes] ${arquivo}: sem largura legível, ignorado`);
    continue;
  }

  const variantes = [];

  for (const largura of LARGURAS) {
    // Só reduz. A original já cobre a própria largura no srcset.
    if (largura >= larguraOriginal) continue;

    const destino = path.join(saidaDir, `${nome}-${largura}.webp`);

    try {
      const infoDestino = await fs.stat(destino);
      if (infoDestino.mtimeMs >= infoOrigem.mtimeMs) {
        variantes.push(largura);
        puladas += 1;
        continue;
      }
    } catch {
      // ainda não existe: gera abaixo
    }

    await sharp(origem).resize({ width: largura }).webp({ quality: QUALIDADE }).toFile(destino);
    variantes.push(largura);
    geradas += 1;
  }

  manifest[`/images/posts/${arquivo}`] = { larguraOriginal, variantes };
}

await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

console.log(
  `[variantes] ${Object.keys(manifest).length} capa(s): ${geradas} variante(s) gerada(s), ${puladas} já atualizada(s)`
);
