/**
 * Configuração central do site: um lugar só para os dados que aparecem em
 * vários templates. Antes disso o nome do autor, a URL base e o caminho da
 * imagem social estavam repetidos em cada arquivo.
 */
export const siteConfig = {
  url: 'https://petisquinho.com',
  name: 'Petisquinho',
  locale: 'pt_BR',

  /**
   * Autor do conteúdo. O nome aparece no byline dos posts e no JSON-LD
   * (author.name), que o Google usa como sinal de credibilidade em conteúdo
   * de ciência e saúde. `url` aponta para a seção de autor na página Sobre.
   */
  author: {
    name: 'Fabio Almeida',
    role: 'Editor',
    url: '/sobre#autor'
  },

  /** Card padrão para home, categorias e páginas institucionais. */
  defaultOgImage: '/og/default.jpg',
  ogImageWidth: 1200,
  ogImageHeight: 630,

  /**
   * Categorias do blog: fonte única. O menu, as páginas de categoria, os
   * atalhos da home e a página 404 leem daqui, para o rótulo visível e o
   * endereço nunca divergirem.
   *
   * `slug` é o valor técnico gravado no frontmatter (campo `category`) e
   * também o endereço da página. `label` é o nome exibido e `shortLabel` a
   * versão curta dos atalhos da home.
   *
   * O slug de "Papo de Boteco" é `curiosidades-de-boteco` de propósito:
   * "curiosidades" é o termo de busca real, e trocar o slug quebraria as URLs
   * publicadas. Ver docs/direcao-editorial.md.
   */
  categories: [
    { slug: 'curiosidades-de-boteco', label: 'Papo de Boteco', shortLabel: 'Boteco' },
    { slug: 'petisco-cultural', label: 'Petisco Cultural', shortLabel: 'Cultura' },
    { slug: 'mix-de-variedades', label: 'Mix de Variedades', shortLabel: 'Variedades' },
    { slug: 'a-saideira', label: 'A Saideira', shortLabel: 'Saideira' }
  ],

  /**
   * Blocos "Publicidade" reservados para o AdSense. Ficam ocultos enquanto
   * não houver anúncio real: caixa rotulada sem anúncio parece site inacabado
   * e, quando fica antes do primeiro parágrafo, atrapalha a leitura.
   * Trocar para true quando os blocos tiverem código de anúncio.
   */
  adsEnabled: false
} as const;
