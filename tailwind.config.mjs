/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        terracotta: '#C8553D',
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
