import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://petisquinho.com',
  output: 'static',
  integrations: [tailwind()],
});
