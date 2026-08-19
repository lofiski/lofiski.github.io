import type { PostMeta, PostFrontmatter } from '@/types'

/**
 * unplugin-vue-markdown exposes frontmatter as *individual named exports*
 * (`title`, `date`, …) — there is no `frontmatter` export. Reading one is the
 * fallback path; `usePosts()` parses the raw text itself and is authoritative.
 */
interface PostModule {
  default: object
  title?: string
  date?: string
  description?: string
  tags?: string[]
}

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

// The post set is fixed at build time, so parse and sort once at module scope
// rather than re-deriving it inside a computed on every consumer.
const posts: PostMeta[] = Object.entries(rawModules)
  .map(([path, raw]) => {
    const slug = path.slice('/posts/'.length, -'.md'.length)
    const fm = parseFrontmatter(raw)
    return { slug, ...fm, title: fm.title ?? slug, date: fm.date ?? '', content: raw }
  })
  .filter(p => !p.draft)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

/**
 * The list is a build-time constant, so it is handed out as a plain array —
 * wrapping it in a `computed` only added a reactive layer that could never change.
 */
export function usePosts() {
  return { allPosts: posts }
}

// Lazy post module map for dynamic loading in PostPage
export const postModules = import.meta.glob<PostModule>('/posts/*.md')
