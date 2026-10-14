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
    // Opcional: preencher só quando o post for de fato revisado depois de
    // publicado. É o que alimenta o dateModified do JSON-LD.
    updated: z.coerce.date().optional(),
    // Sem `readingTime` de propósito: o valor era digitado à mão e 24 dos 25
    // posts anunciavam o dobro do real. Agora é calculado do corpo no build,
    // por tempoDeLeitura() em src/utils/posts.ts.
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
