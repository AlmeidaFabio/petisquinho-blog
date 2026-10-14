import { siteConfig } from '../config/site';
import type { Post } from './posts';

/**
 * Blocos de JSON-LD que faltavam nas páginas que não são de post.
 *
 * Só a página de post tinha dados estruturados. Home, categorias e
 * institucionais não tinham nenhum, o que deixava de fora três coisas que o
 * Google usa: a caixa de pesquisa do site no resultado, a ligação da marca com
 * uma entidade e a trilha hierárquica.
 */

/** `WebSite` com `SearchAction`: habilita a caixa de busca do site no Google. */
export function schemaWebSite(siteUrl: string | URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: new URL('/', siteUrl).toString(),
    inLanguage: siteConfig.locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        // O parâmetro q é o mesmo que a página /busca/ lê da URL.
        urlTemplate: new URL('/busca/?q={search_term_string}', siteUrl).toString()
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

/** `Organization`: liga a marca a uma entidade no painel de conhecimento. */
export function schemaOrganizacao(siteUrl: string | URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: new URL('/', siteUrl).toString(),
    logo: {
      '@type': 'ImageObject',
      url: new URL('/favicon.png', siteUrl).toString()
    }
  };
}

/** `BreadcrumbList`: mostra a trilha hierárquica no lugar da URL crua. */
export function schemaTrilha(itens: { nome: string; caminho: string }[], siteUrl: string | URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: itens.map((item, indice) => ({
      '@type': 'ListItem',
      position: indice + 1,
      name: item.nome,
      item: new URL(item.caminho, siteUrl).toString()
    }))
  };
}

/** `ItemList`: diz ao Google que a página é uma lista ordenada de matérias. */
export function schemaItemList(
  posts: Post[],
  montarCaminho: (post: Post) => string,
  siteUrl: string | URL
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: posts.map((post, indice) => ({
      '@type': 'ListItem',
      position: indice + 1,
      url: new URL(montarCaminho(post), siteUrl).toString(),
      name: post.data.title
    }))
  };
}
