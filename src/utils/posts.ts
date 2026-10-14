import type { CollectionEntry } from 'astro:content';
import { siteConfig } from '../config/site';

export type Post = CollectionEntry<'posts'>;

/**
 * Régua de leitura: 200 palavras por minuto, que é a convenção do mercado e a
 * que o PRD pressupõe ao falar de textos de 2 a 4 minutos.
 */
const PALAVRAS_POR_MINUTO = 200;

/** Acima disso o Google costuma cortar o título na busca. */
const LIMITE_DO_TITULO = 60;

/**
 * Tempo de leitura calculado a partir do corpo do post.
 *
 * Antes o valor era digitado à mão no frontmatter e nunca recalculado. O
 * resultado: 24 dos 25 posts anunciavam o dobro do real, e a soma do site dava
 * 75 minutos para 33 minutos de texto. Num blog cuja proposta é respeitar o
 * tempo do leitor, esse era o único número errado — e o primeiro que ele lê.
 *
 * Calcular no build também resolve o caso de o texto ser editado depois.
 */
export function tempoDeLeitura(body?: string): string {
  const palavras = (body ?? '').split(/\s+/).filter(Boolean).length;
  const minutos = Math.max(1, Math.round(palavras / PALAVRAS_POR_MINUTO));

  return `${minutos} min de leitura`;
}

/**
 * Data do post para exibição, em pt-BR e no fuso UTC.
 *
 * O frontmatter traz só a data (`2026-10-14`), que o JavaScript interpreta como
 * meia-noite UTC. Formatando no fuso local, UTC-3, isso vira 21h do dia 13 — e
 * a página mostrava um dia a menos que a data declarada, que o `datePublished`
 * do JSON-LD e que o `pubDate` do RSS. Ou seja, o site se contradizia.
 *
 * O UTC aqui é o fuso da fonte do dado, não uma preferência: a data não tem
 * hora, então não deve ser deslocada.
 */
export function dataLegivel(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(data));
}

/**
 * Título para a tag `<title>`, com o sufixo da marca só quando ele couber.
 *
 * Com o sufixo fixo, 7 títulos de post passavam de 79 caracteres e apareciam
 * truncados na busca. Em título longo o sufixo sai: a marca continua no
 * `og:site_name`, no domínio e no favicon do resultado.
 */
export function tituloDaPagina(titulo: string, limite: number = LIMITE_DO_TITULO): string {
  const comMarca = `${titulo} - ${siteConfig.name}`;

  return comMarca.length <= limite ? comMarca : titulo;
}

/**
 * Posts relacionados, por relevância e sem sorteio.
 *
 * O template usava `Math.random()` para embaralhar todos os posts, então o
 * "Leia também" não tinha relação nenhuma com o que estava sendo lido e o HTML
 * gerado mudava a cada build — o que atrapalha cache e comparação de versões.
 *
 * A pontuação dá 3 para a mesma categoria e 1 por tag em comum. O desempate é
 * por data mais recente, o que mantém o resultado estável entre builds.
 */
export function relacionados(post: Post, todos: Post[], quantos = 3): Post[] {
  const tagsDoPost = new Set(post.data.tags);

  return todos
    .filter((entry: Post) => !entry.data.draft && entry.slug !== post.slug)
    .map((entry: Post) => ({
      entry,
      pontos:
        (entry.data.category === post.data.category ? 3 : 0) +
        entry.data.tags.filter((tag: string) => tagsDoPost.has(tag)).length
    }))
    .sort((a, b) => {
      if (b.pontos !== a.pontos) return b.pontos - a.pontos;
      return new Date(b.entry.data.date).valueOf() - new Date(a.entry.data.date).valueOf();
    })
    .slice(0, quantos)
    .map((item) => item.entry);
}
