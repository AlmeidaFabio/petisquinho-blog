import { getCollection, type CollectionEntry } from 'astro:content';

export async function GET(context: { site: string | URL }) {
  const site = context.site ?? 'https://petisquinho.com';
  const allPosts: CollectionEntry<'posts'>[] = await getCollection('posts');
  const posts = allPosts.filter((post: CollectionEntry<'posts'>) => !post.data.draft);

  const urls = [
    '',
    '/sobre',
    '/contato',
    '/privacidade',
    '/termos-de-uso',
    '/busca',
    '/categoria/curiosidades-de-boteco',
    '/categoria/petisco-cultural',
    '/categoria/mix-de-variedades',
    '/categoria/a-saideira'
  ]
    .concat(posts.map((post: CollectionEntry<'posts'>) => `/posts/${post.slug}`))
    .map((path) => {
      const canonicalPath = path === '' ? '/' : `${path}/`;
      return `<url><loc>${new URL(canonicalPath, site).toString()}</loc></url>`;
    })
    .join('');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { 'Content-Type': 'application/xml' }
  });
}
