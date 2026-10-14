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
   * Blocos "Publicidade" reservados para o AdSense. Ficam ocultos enquanto
   * não houver anúncio real: caixa rotulada sem anúncio parece site inacabado
   * e, quando fica antes do primeiro parágrafo, atrapalha a leitura.
   * Trocar para true quando os blocos tiverem código de anúncio.
   */
  adsEnabled: false
} as const;
