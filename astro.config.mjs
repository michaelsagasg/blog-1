import { defineConfig } from 'astro/config';

export default defineConfig({
  server: { host: '127.0.0.1', port: 4321 },
  // Currently served at https://<owner>.github.io/blog-1/ (a project-pages subpath), so every
  // internal link needs this prefix -- see withBase()/stripBase() in src/lib/site.ts, which is
  // the only thing that actually applies it (Astro does NOT rewrite hand-written "/..." hrefs).
  // Once a real custom domain is attached at the apex (it serves from "/"), remove this line.
  base: '/blog-1',
});
