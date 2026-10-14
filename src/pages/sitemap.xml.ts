import { getCollection, type CollectionEntry } from 'astro:content';

const CATEGORIAS = [
  '/categoria/curiosidades-de-boteco',
  '/categoria/petisco-cultural',
  '/categoria/mix-de-variedades',
  '/categoria/a-saideira'
];

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

  for (const categoria of CATEGORIAS) {
    const slug = categoria.split('/').pop();
    const daCategoria = posts.filter((post: CollectionEntry<'posts'>) => post.data.category === slug);
    entradas.push({ caminho: categoria, lastmod: dataMaisRecente(daCategoria) ?? dataDoBuild });
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
