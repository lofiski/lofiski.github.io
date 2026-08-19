/// <reference types="vite/client" />

// Allow importing .md files as Vue components.
// unplugin-vue-markdown emits each frontmatter key as its own named export;
// there is no `frontmatter` object export.
declare module '*.md' {
  import type { ComponentOptions } from 'vue'
  const component: ComponentOptions
  export default component
  export const title: string
  export const date: string
  export const description: string | undefined
  export const tags: string[] | undefined
}

// Allow importing photos.json
declare module '@/data/photos.json' {
  import type { PhotoData } from '@/types'
  const data: PhotoData
  export default data
}
