/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // O tom cheio fica para fundos, bordas, ícones e gráficos. Para TEXTO
        // existe `terracotta-dark`, porque o tom original reprova no WCAG AA:
        // 4,35:1 sobre branco e 4,01:1 sobre o creme, abaixo do mínimo de 4,5:1
        // para texto normal.
        //
        // #A8432F passa nos quatro fundos em uso: branco 5,98, creme 5,51,
        // pílula terracotta/10 5,27 e o verde do bloco lateral 4,84. O
        // candidato mais claro (#B4472F) chegava a 4,37 no verde e reprovava.
        terracotta: {
          DEFAULT: '#C8553D',
          dark: '#A8432F'
        },
        marine: '#1F2A44',
        mustard: '#E9B44C',
        cream: '#FAF5EC',
        graphite: '#2B2B2B'
      },
      boxShadow: {
        soft: '0 12px 30px rgba(31, 42, 68, 0.08)'
      }
    }
  },
  plugins: []
};
