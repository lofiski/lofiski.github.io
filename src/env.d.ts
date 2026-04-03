/// <reference types="vite/client" />

// Allow importing .md files as Vue components
declare module '*.md' {
  import type { ComponentOptions } from 'vue'
  import type { PostFrontmatter } from '@/types'
  const component: ComponentOptions
  export default component
  export const frontmatter: PostFrontmatter
}

// Allow importing photos.json
declare module '@/data/photos.json' {
  import type { PhotoData } from '@/types'
  const data: PhotoData
  export default data
}
