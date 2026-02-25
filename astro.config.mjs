import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';


import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

export default defineConfig({
  site: 'https://antonvetrov.ru',
  base: '/',
  integrations: [mdx()],
  markdown: {
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }]
    ],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  }
});
