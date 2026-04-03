---
title: 你好，世界！
date: 2026-03-24
description: 博客开张了，写一篇测试文章，顺便展示 Markdown 与代码高亮的效果。
tags:
  - CS碎碎念
---



<script setup>
import DemoCounter from '@/components/DemoCounter.vue'
</script>

博客终于搭起来了。

这个博客用 Vue 3 + Vite 构建，Markdown 文件通过 `unplugin-vue-markdown` 被转换为 Vue 组件，所以可以在 `.md` 文件里直接使用 Vue 组件。


## 在 Markdown 中使用 Vue 组件

下面是一个真实运行的交互式计数器，直接嵌入在 Markdown 里：

<DemoCounter />

代码也很简单，在 `.md` 顶部加一个 `<script setup>` 块即可：

```md
<script setup>
import DemoCounter from '@/components/DemoCounter.vue'
</script>

<DemoCounter />
```

## 代码高亮

得益于 Shiki，代码块有完整的语法高亮，支持亮暗主题切换：

```typescript
// src/composables/usePosts.ts
const modules = import.meta.glob<PostModule>('/posts/*.md', { eager: true })

export function usePosts() {
  const allPosts = computed(() =>
    Object.entries(modules)
      .map(([path, mod]) => ({
        slug: path.replace('/posts/', '').replace('.md', ''),
        ...mod.frontmatter,
      }))
      .filter(p => !p.draft)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  )
  return { allPosts }
}
```

```rust
// Rust 也支持
fn main() {
    let greeting = "Hello, World!";
    println!("{greeting}");
}
```

## 引用

> 万事开头难，先把架子搭好，内容慢慢填。


## 引用 photos
![描述](/photos/p-2023-12-11t07-45-57-000-1.jpg)

## 列表

- Rust
- Vue 3
- TypeScript
- 摄影

---

就这样，开始写吧。


