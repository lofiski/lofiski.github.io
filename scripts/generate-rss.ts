/**
 * generate-rss.ts
 *
 * Generates public/rss.xml from all markdown posts in /posts.
 * Uses gray-matter to parse frontmatter.
 *
 * Called as:
 *  - A Vite build plugin (closeBundle hook) — receives siteConfig as a parameter
 *  - Standalone: `npm run rss` — imports site config directly via tsx
 */

import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import fg from 'fast-glob'
import matter from 'gray-matter'
import { basename } from 'pathe'

interface RssConfig {
  name: string
  rssTitle: string
  rssDescription: string
  url: string
}

interface PostItem {
  slug: string
  title: string
  date: string
  description: string
  link: string
  pubDate: string
}

export async function buildRssXml(config: RssConfig): Promise<string> {
  const postsDir = fileURLToPath(new URL('../posts', import.meta.url))

  const mdFiles = await fg('**/*.md', { cwd: postsDir, absolute: true })
  const posts: PostItem[] = []

  for (const filepath of mdFiles) {
    const content = await fs.readFile(filepath, 'utf-8')
    const { data } = matter(content)

    if (data.draft) continue

    const slug = basename(filepath, '.md')
    const date = data.date ? new Date(data.date) : new Date()

    posts.push({
      slug,
      title: data.title ?? slug,
      date: date.toISOString(),
      description: data.description ?? '',
      link: `${config.url}/blog/${slug}`,
      pubDate: date.toUTCString(),
    })
  }

  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const rssItems = posts
    .map(
      p => `
    <item>
      <title><![CDATA[${escapeXml(p.title)}]]></title>
      <link>${p.link}</link>
      <guid isPermaLink="false">${p.link}</guid>
      <pubDate>${p.pubDate}</pubDate>
      ${p.description ? `<description><![CDATA[${escapeXml(p.description)}]]></description>` : ''}
    </item>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${config.rssTitle}]]></title>
    <link>${config.url}</link>
    <description><![CDATA[${config.rssDescription}]]></description>
    <language>zh-CN</language>
    <atom:link href="${config.url}/rss.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${rssItems}
  </channel>
</rss>`.trim()
}

// Standalone file writer (used by npm run rss and standalone invocation)
export async function generateRss(config: RssConfig): Promise<void> {
  const xml = await buildRssXml(config)
  const outputPath = fileURLToPath(new URL('../public/rss.xml', import.meta.url))
  await fs.mkdir(fileURLToPath(new URL('../public', import.meta.url)), { recursive: true })
  await fs.writeFile(outputPath, xml, 'utf-8')
  console.log(`RSS generated → public/rss.xml`)
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Allow running directly: tsx scripts/generate-rss.ts
// tsx resolves TypeScript imports natively
if (import.meta.url === `file://${process.argv[1]}`) {
  const { siteConfig } = await import('../src/config/site.ts')
  await generateRss(siteConfig)
}
