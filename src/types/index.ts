export interface PostFrontmatter {
  title: string
  date: string
  description?: string
  tags?: string[]
  draft?: boolean
  [key: string]: unknown
}

export interface PostMeta extends PostFrontmatter {
  slug: string
  content?: string
}

export interface PhotoMeta {
  filename: string
  date: string
  blurhash?: string
  width?: number
  height?: number
  title?: string
}

export interface PhotoData {
  photos: PhotoMeta[]
}
