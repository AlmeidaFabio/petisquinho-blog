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
    // Palavra-chave primária do post, definida antes de escrever (ver
    // docs/direcao-editorial.md). Opcional porque os 26 posts anteriores à
    // revisão de 16/10/2026 não a têm e não é preciso retroagir. Ainda não é
    // consumida pelo build: serve para o autor fixar o termo e para uma
    // checagem automática futura.
    keyword: z.string().optional(),
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
    draft: z.boolean().default(false),
    // Marca texto de opinião, crônica ou reflexão, que não faz afirmação
    // factual. O PRD pede "checagem em pelo menos duas fontes para fatos e
    // ciência"; onde não há fato, exigir fonte produziria citação decorativa,
    // que é justamente o que a direção editorial veta. O verificador
    // (npm run checar-fontes) continua mostrando esses posts, mas como
    // informação, não como problema.
    opiniao: z.boolean().default(false)
  })
});

export const collections = {
  posts: postsCollection
};
