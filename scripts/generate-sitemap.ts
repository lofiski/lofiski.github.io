/**
 * generate-sitemap.ts
 *
 * Generates sitemap.xml from static routes + all markdown posts.
 * Called as a Vite build plugin (closeBundle hook).
 */

import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import fg from 'fast-glob'
import matter from 'gray-matter'
import { basename } from 'pathe'

interface SitemapConfig {
  url: string
}

const STATIC_ROUTES = ['/', '/blog', '/projects', '/photos']

export async function buildSitemapXml(config: SitemapConfig): Promise<string> {
  const postsDir = fileURLToPath(new URL('../posts', import.meta.url))
  const mdFiles = await fg('**/*.md', { cwd: postsDir, absolute: true })

  const urls: { loc: string; lastmod?: string }[] = STATIC_ROUTES.map(route => ({
    loc: `${config.url}${route}`,
  }))

  for (const filepath of mdFiles) {
    const content = await fs.readFile(filepath, 'utf-8')
    const { data } = matter(content)
    if (data.draft) continue
    const slug = basename(filepath, '.md')
    const date = data.date ? new Date(data.date).toISOString().split('T')[0] : undefined
    urls.push({ loc: `${config.url}/#/blog/${slug}`, lastmod: date })
  }

  const urlEntries = urls
    .map(u => `  <url>\n    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}\n  </url>`)
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`.trim()
}
