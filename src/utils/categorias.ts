import { getCollection, type CollectionEntry } from 'astro:content';
import { siteConfig } from '../config/site';

/**
 * Quantos posts por página nas listagens de categoria.
 *
 * O PRD pede, no RF3, "quatro páginas de categoria com paginação", sem definir
 * o tamanho. Seis é o tamanho de uma grade de duas colunas fechar em linhas
 * completas.
 *
 * Cheguei a usar oito, que também é um tamanho comum, mas com os 9 posts que a
 * maior categoria tem hoje a página 2 ficaria com um único card — o que parece
 * defeito para quem clica. Com seis, as duas maiores dividem em 6 + 3 e a
 * segunda página parece intencional. É um número só, e a escolha muda em uma
 * linha quando o blog crescer.
 */
export const POSTS_POR_PAGINA = 6;

export type Categoria = (typeof siteConfig.categories)[number];
export type Post = CollectionEntry<'posts'>;

export type PaginaDeCategoria = {
  categoria: Categoria;
  posts: Post[];
  pagina: number;
  totalPaginas: number;
  totalPosts: number;
};

/** Todos os posts publicados, mais recentes primeiro. */
export async function postsPublicados(): Promise<Post[]> {
  const todos = await getCollection('posts');

  return todos
    .filter((post: Post) => !post.data.draft)
    .sort((a: Post, b: Post) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf());
}

/** Posts publicados de uma categoria, mais recentes primeiro. */
export function postsDaCategoria(todos: Post[], slug: string): Post[] {
  return todos
    .filter((post: Post) => !post.data.draft)
    .filter((post: Post) => post.data.category === slug)
    .sort((a: Post, b: Post) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf());
}

/**
 * Divide os posts de uma categoria em páginas.
 *
 * Sempre devolve ao menos uma página, mesmo com a categoria vazia: assim a
 * página da categoria continua existindo, apenas sem cards, em vez de virar
 * 404 quando o último post dela sair do ar.
 */
export function paginarDaCategoria(posts: Post[], categoria: Categoria): PaginaDeCategoria[] {
  const totalPaginas = Math.max(1, Math.ceil(posts.length / POSTS_POR_PAGINA));

  return Array.from({ length: totalPaginas }, (_, indice) => ({
    categoria,
    posts: posts.slice(indice * POSTS_POR_PAGINA, (indice + 1) * POSTS_POR_PAGINA),
    pagina: indice + 1,
    totalPaginas,
    totalPosts: posts.length
  }));
}

/**
 * Endereço de uma página da categoria, com barra final.
 *
 * A primeira página fica na raiz da categoria — /categoria/slug/ — e não em
 * /categoria/slug/pagina/1/, para não criar duas URLs para o mesmo conteúdo.
 * As demais seguem em /categoria/slug/pagina/N/.
 */
export function urlDaPagina(slug: string, pagina: number): string {
  return pagina === 1 ? `/categoria/${slug}/` : `/categoria/${slug}/pagina/${pagina}/`;
}

/**
 * Quais números de página mostrar na navegação.
 *
 * Até 7 páginas cabem todas. Acima disso vira uma faixa ilegível, então o
 * centro é uma janela em volta da atual e as pontas ficam sempre visíveis, com
 * "..." marcando o que foi omitido.
 */
export function paginasVisiveis(pagina: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const janela = new Set([1, total, pagina - 1, pagina, pagina + 1]);
  const lista: (number | '...')[] = [];
  let anterior = 0;

  for (let numero = 1; numero <= total; numero += 1) {
    if (!janela.has(numero)) continue;

    if (anterior && numero - anterior > 1) lista.push('...');
    lista.push(numero);
    anterior = numero;
  }

  return lista;
}
