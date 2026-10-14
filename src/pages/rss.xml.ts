import rss from '@astrojs/rss';
import { getCollection, type CollectionEntry } from 'astro:content';

export async function GET(context: { site: string | URL }) {
  const allPosts: CollectionEntry<'posts'>[] = await getCollection('posts');
  const posts = allPosts
    .filter((post: CollectionEntry<'posts'>) => !post.data.draft)
    .sort((a: CollectionEntry<'posts'>, b: CollectionEntry<'posts'>) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf());

  return rss({
    title: 'Petisquinho',
    description: 'Uma porção de curiosidade por dia, sem compromisso.',
    site: context.site ?? 'https://petisquinho.com',
    items: posts.map((post: CollectionEntry<'posts'>) => ({
      title: post.data.title,
      pubDate: new Date(post.data.date),
      description: post.data.excerpt,
      link: `/posts/${post.slug}`
    })),
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: '<language>pt-BR</language>'
  });
}
