#!/usr/bin/env node
/**
 * Post-build sitemap generator.
 * Scans dist/ for HTML files and creates sitemap.xml with lastmod from frontmatter.
 */
import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join, relative } from 'path';

const SITE = 'https://antonvetrov.ru';
const DIST = join(import.meta.dirname, '..', 'dist');

function walkDir(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...walkDir(full));
    } else if (entry === 'index.html') {
      results.push(full);
    }
  }
  return results;
}

function getLastmod(htmlPath) {
  // Try to find pubDate or dateModified in JSON-LD
  const html = readFileSync(htmlPath, 'utf-8');
  const match = html.match(/"dateModified"\s*:\s*"([^"]+)"/) || 
                html.match(/"datePublished"\s*:\s*"([^"]+)"/);
  if (match) {
    return match[1].slice(0, 10); // YYYY-MM-DD
  }
  // Fallback to file mtime
  return statSync(htmlPath).mtime.toISOString().slice(0, 10);
}

const files = walkDir(DIST);
const urls = files.map(f => {
  const rel = relative(DIST, f).replace(/index\.html$/, '').replace(/\\/g, '/');
  const loc = `${SITE}/${rel}`;
  const lastmod = getLastmod(f);
  return { loc, lastmod };
}).sort((a, b) => a.loc.localeCompare(b.loc));

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
  </url>`).join('\n')}
</urlset>`;

writeFileSync(join(DIST, 'sitemap.xml'), xml);
console.log(`Sitemap generated: ${urls.length} URLs`);
