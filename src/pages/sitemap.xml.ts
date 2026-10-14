import { getCollection, type CollectionEntry } from 'astro:content';
import { siteConfig } from '../config/site';
import { POSTS_POR_PAGINA, urlDaPagina } from '../utils/categorias';

/** Data mais recente entre uma lista de posts, ou null se a lista estiver vazia. */
function dataMaisRecente(posts: CollectionEntry<'posts'>[]): Date | null {
  if (posts.length === 0) return null;
  return posts.reduce(
    (maisNova: Date, post: CollectionEntry<'posts'>) => {
      const data = new Date(post.data.date);
      return data > maisNova ? data : maisNova;
    },
    new Date(posts[0].data.date)
  );
}

export async function GET(context: { site: string | URL }) {
  const site = context.site ?? 'https://petisquinho.com';
  const allPosts: CollectionEntry<'posts'>[] = await getCollection('posts');
  const posts = allPosts.filter((post: CollectionEntry<'posts'>) => !post.data.draft);

  // Data do build: usada apenas nas páginas institucionais, cujo texto não tem
  // data própria e muda quando o template muda.
  const dataDoBuild = new Date();

  const entradas: { caminho: string; lastmod: Date }[] = [];

  // Home e categorias mudam quando um post novo entra, então a data relevante
  // é a do conteúdo mais recente que elas listam — não a do build.
  const ultimoPost = dataMaisRecente(posts);
  entradas.push({ caminho: '', lastmod: ultimoPost ?? dataDoBuild });

  // Categorias e as páginas de paginação de cada uma. A lista vem de
  // siteConfig, que é a fonte única: antes havia uma cópia dos quatro
  // endereços aqui, que podia sair de sincronia com o site.
  //
  // Todas as páginas entram no sitemap, não só a primeira: são endereços
  // canônicos e indexáveis, e é por eles que o rastreador chega aos posts mais
  // antigos de uma categoria grande.
  for (const categoria of siteConfig.categories) {
    const daCategoria = posts.filter((post: CollectionEntry<'posts'>) => post.data.category === categoria.slug);
    const lastmod = dataMaisRecente(daCategoria) ?? dataDoBuild;
    const totalPaginas = Math.max(1, Math.ceil(daCategoria.length / POSTS_POR_PAGINA));

    for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {
      // urlDaPagina devolve com barra final; é o mapa abaixo que a acrescenta.
      entradas.push({ caminho: urlDaPagina(categoria.slug, pagina).replace(/\/$/, ''), lastmod });
    }
  }

  for (const caminho of ['/sobre', '/contato', '/privacidade', '/termos-de-uso', '/busca']) {
    entradas.push({ caminho, lastmod: dataDoBuild });
  }

  // Posts usam a data declarada no frontmatter: sinal estável, que não muda a
  // cada deploy.
  for (const post of posts) {
    entradas.push({ caminho: `/posts/${post.slug}`, lastmod: new Date(post.data.date) });
  }

  const urls = entradas
    .map(({ caminho, lastmod }) => {
      const canonicalPath = caminho === '' ? '/' : `${caminho}/`;
      const loc = new URL(canonicalPath, site).toString();
      return `<url><loc>${loc}</loc><lastmod>${lastmod.toISOString()}</lastmod></url>`;
    })
    .join('');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { 'Content-Type': 'application/xml' }
  });
}
