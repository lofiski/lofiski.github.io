import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Markdown from 'unplugin-vue-markdown/vite'
import { createHighlighter } from 'shiki'
import { fromHighlighter } from '@shikijs/markdown-it/core'
import Anchor from 'markdown-it-anchor'
import type { Plugin } from 'vite'
import { buildRssXml } from './scripts/generate-rss'
import { buildSitemapXml } from './scripts/generate-sitemap'
import { siteConfig } from './src/config/site'

export default defineConfig(async () => {
  const highlighter = await createHighlighter({
    themes: ['github-dark-dimmed', 'github-light'],
    langs: [
      'javascript', 'typescript', 'vue', 'html', 'css', 'scss',
      'json', 'bash', 'shell', 'python', 'rust', 'go', 'markdown',
      'yaml', 'toml', 'sql', 'diff', 'tsx', 'jsx',
    ],
  })

  // Fix: Windows registry maps .ts → video/mp2t (MPEG transport stream).
  // Browsers reject module scripts with that MIME type, so intercept and correct it.
  const fixTsMimePlugin: Plugin = {
    name: 'fix-ts-mime-type',
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        const orig = res.setHeader.bind(res)
        res.setHeader = (name: string, value: string | number | readonly string[]) => {
          if (
            name.toLowerCase() === 'content-type'
            && typeof value === 'string'
            && value.startsWith('video/mp2t')
          ) {
            value = 'application/javascript; charset=utf-8'
          }
          return orig(name, value)
        }
        next()
      })
    },
  }

  const rssPlugin: Plugin = {
    name: 'rss-generator',
    apply: 'build',
    async generateBundle() {
      const xml = await buildRssXml(siteConfig)
      this.emitFile({
        type: 'asset',
        fileName: 'rss.xml',
        source: xml,
      })
    },
  }

  const sitemapPlugin: Plugin = {
    name: 'sitemap-generator',
    apply: 'build',
    async generateBundle() {
      const xml = await buildSitemapXml(siteConfig)
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: xml,
      })
    },
  }

  return {
    plugins: [
      fixTsMimePlugin,
      Markdown({
        markdownItOptions: {
          html: true,
          linkify: true,
          typographer: true,
        },
        markdownItSetup(md) {
          md.use(fromHighlighter(highlighter, {
            themes: {
              dark: 'github-dark-dimmed',
              light: 'github-light',
            },
            defaultColor: false,
          }))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(md as any).use(Anchor)
        },
      }),
      vue({
        include: [/\.vue$/, /\.md$/],
      }),
      rssPlugin,
      sitemapPlugin,
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      target: 'es2022',
    },
  }
})
