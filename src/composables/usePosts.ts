import { computed } from 'vue'
import type { PostMeta, PostFrontmatter } from '@/types'

interface PostModule {
  default: object
  frontmatter?: PostFrontmatter
}

// All .md files in /posts/ — loaded eagerly (component + optional frontmatter)
const modules = import.meta.glob<PostModule>('/posts/*.md', { eager: true })

// Raw markdown text — used for frontmatter parsing and full-text search
const rawModules = import.meta.glob<string>('/posts/*.md', { query: '?raw', import: 'default', eager: true })

/**
 * Minimal YAML-subset frontmatter parser.
 * Handles strings, booleans, and arrays of strings — covers all our frontmatter needs.
 * More reliable than depending on unplugin-vue-markdown's compiled exports.
 */
function parseFrontmatter(raw: string): PostFrontmatter {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return {} as PostFrontmatter
  const result: Record<string, unknown> = {}
  let arrKey = ''
  let arr: string[] | null = null
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z_]\w*):\s*(.*)/)
    const item = line.match(/^\s+-\s+(.+)/)
    if (item && arr) {
      arr.push(item[1].trim().replace(/^['"]|['"]$/g, ''))
    } else if (kv) {
      arrKey = kv[1]
      const val = kv[2].trim()
      arr = null
      if (!val) { arr = []; result[arrKey] = arr }
      else if (val === 'true') result[arrKey] = true
      else if (val === 'false') result[arrKey] = false
      else result[arrKey] = val.replace(/^['"]|['"]$/g, '')
    }
  }
  return result as PostFrontmatter
}

export function usePosts() {
  const allPosts = computed<PostMeta[]>(() => {
    return Object.entries(rawModules)
      .map(([path, raw]) => {
        const slug = path.replace('/posts/', '').replace('.md', '')
        const fm = parseFrontmatter(raw)
        return {
          slug,
          ...fm,
          title: fm.title ?? slug,
          date: fm.date ?? '',
          content: raw,
        }
      })
      .filter(p => !p.draft)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })

  return { allPosts }
}

// Lazy post module map for dynamic loading in PostPage
export const postModules = import.meta.glob<PostModule>('/posts/*.md')
