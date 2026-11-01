/**
 * ConfiguraÃ§Ã£o central do site: um lugar sÃ³ para os dados que aparecem em
 * vÃ¡rios templates. Antes disso o nome do autor, a URL base e o caminho da
 * imagem social estavam repetidos em cada arquivo.
 */
export const siteConfig = {
  url: 'https://petisquinho.com',
  name: 'Petisquinho',
  locale: 'pt_BR',

  /**
   * Autor do conteÃºdo. O nome aparece no byline dos posts e no JSON-LD
   * (author.name), que o Google usa como sinal de credibilidade em conteÃºdo
   * de ciÃªncia e saÃºde. `url` aponta para a seÃ§Ã£o de autor na pÃ¡gina Sobre.
   */
  author: {
    name: 'Fabio Almeida',
    role: 'Editor',
    url: '/sobre#autor'
  },

  /** Card padrÃ£o para home, categorias e pÃ¡ginas institucionais. */
  defaultOgImage: '/og/default.jpg',
  ogImageWidth: 1200,
  ogImageHeight: 630,

  /**
   * Categorias do blog: fonte Ãºnica. O menu, as pÃ¡ginas de categoria, os
   * atalhos da home e a pÃ¡gina 404 leem daqui, para o rÃ³tulo visÃ­vel e o
   * endereÃ§o nunca divergirem.
   *
   * `slug` Ã© o valor tÃ©cnico gravado no frontmatter (campo `category`) e
   * tambÃ©m o endereÃ§o da pÃ¡gina. `label` Ã© o nome exibido e `shortLabel` a
   * versÃ£o curta dos atalhos da home.
   *
   * O slug de "Papo de Boteco" Ã© `curiosidades-de-boteco` de propÃ³sito:
   * "curiosidades" Ã© o termo de busca real, e trocar o slug quebraria as URLs
   * publicadas. Ver docs/direcao-editorial.md.
   */
  categories: [
    { slug: 'curiosidades-de-boteco', label: 'Papo de Boteco', shortLabel: 'Boteco' },
    { slug: 'petisco-cultural', label: 'Petisco Cultural', shortLabel: 'Cultura' },
    { slug: 'mix-de-variedades', label: 'Mix de Variedades', shortLabel: 'Variedades' },
    { slug: 'a-saideira', label: 'A Saideira', shortLabel: 'Saideira' }
  ],

  /**
   * ID de mediÃ§Ã£o do Google Analytics 4, no formato G-XXXXXXX.
   *
   * Vazio desliga tudo: sem ID nenhum script de terceiro Ã© baixado e o banner
   * de consentimento nem aparece. Com ID, o banner aparece e o gtag sÃ³ Ã©
   * carregado depois do aceite â€” nada Ã© enviado antes disso, nem de forma
   * anÃ´nima.
   *
   * O ID chega ao script como atributo de dado no HTML, e nÃ£o interpolado
   * dentro do JavaScript: o valor vem da configuraÃ§Ã£o do projeto, mas manter a
   * montagem no atributo evita uma superfÃ­cie de injeÃ§Ã£o se um dia ele vier de
   * outro lugar.
   */
  googleAnalyticsId: 'G-B5MR3FDE05',

  /**
   * Blocos "Publicidade" reservados para o AdSense. Ficam ocultos enquanto
   * nÃ£o houver anÃºncio real: caixa rotulada sem anÃºncio parece site inacabado
   * e, quando fica antes do primeiro parÃ¡grafo, atrapalha a leitura.
   * Trocar para true quando os blocos tiverem cÃ³digo de anÃºncio.
   */
  adsEnabled: false
} as const;


