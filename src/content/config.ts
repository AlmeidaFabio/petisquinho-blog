import { defineCollection, z } from 'astro:content';

const sourceSchema = z.object({
  label: z.string(),
  url: z.string().url()
});

export type PostSource = z.infer<typeof sourceSchema>;

const postsCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    section: z.string(),
    category: z.string(),
    date: z.coerce.date(),
    readingTime: z.string(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    sources: z.array(sourceSchema).default([]),
    draft: z.boolean().default(false)
  })
});

export const collections = {
  posts: postsCollection
};
