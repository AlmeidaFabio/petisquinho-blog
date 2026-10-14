import fs from 'node:fs';

/**
 * Variantes de largura das capas, para montar o atributo `srcset`.
 *
 * O manifest é gerado por scripts/generate-image-variants.mjs, que roda antes
 * do build e antes do servidor de desenvolvimento. Quando ele não existe — por
 * exemplo, se alguém rodar `astro build` direto, sem passar pelo npm script —
 * as funções aqui devolvem null e os templates caem no `src` simples, sem
 * quebrar.
 *
 * SVG não entra: vetor escala sozinho.
 */

const MANIFEST = 'public/images/variantes/manifest.json';

/**
 * Quanto a imagem ocupa na tela, por contexto. É o que permite ao navegador
 * escolher a variante certa em vez de baixar a maior sempre.
 *
 * Os valores saem do layout real: o container é `max-w-6xl` (1152 px), com
 * `gap-8` (32 px) entre colunas.
 */
export const SIZES = {
  /** Carrossel da home: coluna de 1.5fr no grid `lg:grid-cols-[1.5fr_0.8fr]`. */
  capaDoCarrossel: '(min-width: 1024px) 730px, 100vw',
  /** Capa do post: coluna de 1fr ao lado de uma lateral de 260 px. */
  capaDoPost: '(min-width: 1024px) 860px, 100vw',
  /** Cards em grade de duas colunas (home a partir de md, categorias). */
  cardDuasColunas: '(min-width: 768px) 50vw, 100vw',
  /** Cards em grade de três colunas (404, "Leia também"). */
  cardTresColunas: '(min-width: 1024px) 380px, (min-width: 768px) 45vw, 100vw',
  /** Cards da coluna lateral do post, que só aparece a partir de lg. */
  cardDaColunaLateral: '(min-width: 1024px) 260px, 100vw'
} as const;

type Entrada = { larguraOriginal: number; variantes: number[] };

let cache: Record<string, Entrada> | null = null;

function lerManifest(): Record<string, Entrada> {
  if (cache) return cache;

  try {
    cache = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) as Record<string, Entrada>;
  } catch {
    cache = {};
  }

  return cache;
}

/**
 * srcset da capa, ou null quando não há variantes.
 *
 * A própria original entra como maior candidato, na largura real dela: assim
 * não é preciso reencodar uma variante do mesmo tamanho do arquivo original.
 */
export function srcsetDe(imagem?: string): string | null {
  if (!imagem) return null;

  const entrada = lerManifest()[imagem];
  if (!entrada) return null;

  const nome = imagem.slice(imagem.lastIndexOf('/') + 1).replace(/\.webp$/, '');

  const candidatos = entrada.variantes.map(
    (largura) => `/images/variantes/${nome}-${largura}.webp ${largura}w`
  );
  candidatos.push(`${imagem} ${entrada.larguraOriginal}w`);

  return candidatos.join(', ');
}
