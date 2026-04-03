<script setup lang="ts">
import { shallowRef, watchEffect, watch, nextTick, onBeforeUnmount, markRaw, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { postModules } from '@/composables/usePosts'
import type { PostFrontmatter } from '@/types'
import TableOfContents from '@/components/TableOfContents.vue'

const route = useRoute()
const router = useRouter()

const scanKey = ref(0)

// shallowRef: PostComponent is opaque (Vue component object) replaced wholesale
const PostComponent = shallowRef<object | null>(null)
// shallowRef: frontmatter object is replaced entirely on each navigation, no deep tracking needed
const frontmatter = shallowRef<PostFrontmatter | null>(null)
// shallowRef: primitives
const loading = shallowRef(true)
const notFound = shallowRef(false)

watchEffect(async () => {
  const slug = route.params.slug as string
  const key = `/posts/${slug}.md`
  const loader = postModules[key]

  loading.value = true
  notFound.value = false
  PostComponent.value = null

  if (!loader) {
    notFound.value = true
    loading.value = false
    return
  }

  try {
    const mod = await loader()
    PostComponent.value = markRaw(mod.default as object)
    frontmatter.value = mod.frontmatter ?? null
  }
  catch {
    notFound.value = true
  }
  finally {
    loading.value = false
  }
})

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

function goTag(tag: string) {
  router.push({ path: '/blog', query: { tag } })
}

// ── Copy buttons ────────────────────────────────────────────
let cleanupCopy: (() => void) | null = null

watch(PostComponent, async (val) => {
  cleanupCopy?.()
  cleanupCopy = null
  if (!val) return
  await nextTick()

  const pres = document.querySelectorAll<HTMLElement>('.post__content pre')
  const offs: (() => void)[] = []

  pres.forEach(pre => {
    if (pre.querySelector('.copy-btn')) return

    const btn = document.createElement('button')
    btn.className = 'copy-btn'
    btn.setAttribute('aria-label', '复制代码')
    btn.textContent = '复制'
    pre.appendChild(btn)

    async function handler() {
      const text = pre.querySelector('code')?.textContent ?? ''
      await navigator.clipboard.writeText(text)
      btn.textContent = '已复制'
      btn.classList.add('copy-btn--copied')
      setTimeout(() => {
        btn.textContent = '复制'
        btn.classList.remove('copy-btn--copied')
      }, 2000)
    }

    btn.addEventListener('click', handler)
    offs.push(() => btn.removeEventListener('click', handler))
  })

  cleanupCopy = () => offs.forEach(fn => fn())
})

onBeforeUnmount(() => { cleanupCopy?.(); cleanupCopy = null })

watch(PostComponent, (val) => {
  if (val) scanKey.value++
})
</script>

<template>
  <div class="container">
    <!-- Loading -->
    <div v-if="loading" class="loading" aria-live="polite" aria-busy="true">
      <span class="loading__dot" />
    </div>

    <!-- Not found -->
    <div v-else-if="notFound" class="not-found">
      <p class="not-found__msg">文章不存在。</p>
      <button class="back-btn" @click="router.push('/blog')">← 返回 Blog</button>
    </div>

    <!-- Post -->
    <article v-else class="post">
      <!-- Header -->
      <header class="post__header">
        <div class="post__meta">
          <button class="back-btn" @click="router.push('/blog')" aria-label="返回文章列表">
            ← Blog
          </button>
          <time v-if="frontmatter?.date" :datetime="frontmatter.date" class="post__date">
            {{ formatDate(frontmatter.date) }}
          </time>
        </div>
        <h1 class="post__title">{{ frontmatter?.title }}</h1>
        <p v-if="frontmatter?.description" class="post__description">
          {{ frontmatter.description }}
        </p>
        <div v-if="frontmatter?.tags?.length" class="post__tags">
          <button
            v-for="tag in frontmatter.tags"
            :key="tag"
            class="tag"
            @click="goTag(tag)"
          >{{ tag }}</button>
        </div>
      </header>

      <hr class="post__divider" />

      <!-- Content (rendered .md as Vue component) -->
      <div class="prose post__content">
        <component :is="PostComponent" />
      </div>

      <!-- Footer nav -->
      <div class="post__footer">
        <button class="back-btn" @click="router.push('/blog')">← 返回文章列表</button>
      </div>
    </article>

    <!-- Floating TOC + back-to-top -->
    <TableOfContents v-if="!loading && !notFound" :scan-key="scanKey" />
  </div>
</template>

<style scoped>
.loading {
  display: flex;
  justify-content: center;
  padding: var(--space-20) 0;
}

.loading__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-tertiary);
  animation: pulse 1.2s ease infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.not-found {
  padding: var(--space-16) 0;
  text-align: center;
}

.not-found__msg {
  font-family: var(--font-ui);
  color: var(--text-tertiary);
  margin-bottom: var(--space-4);
}

.back-btn {
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  letter-spacing: 0.04em;
  padding: var(--space-1) 0;
  transition: color var(--transition);
  cursor: pointer;
}

.back-btn:hover {
  color: var(--text-accent);
}

/* ── Post Header ─────────────────── */
.post__header {
  margin-bottom: var(--space-8);
}

.post__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
}

.post__date {
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.post__title {
  font-family: var(--font-ui);
  font-size: var(--text-3xl);
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  line-height: 1.25;
  margin-bottom: var(--space-4);
}

.post__description {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  line-height: 1.65;
  margin-bottom: var(--space-4);
}

.post__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.post__divider {
  border: none;
  border-top: 1px solid var(--border);
  margin: var(--space-8) 0;
}

/* ── Post Content ────────────────── */
.post__content {
  margin-bottom: var(--space-16);
}

/* ── Post Footer ─────────────────── */
.post__footer {
  padding-top: var(--space-8);
  border-top: 1px solid var(--border-subtle);
}

/* Mobile */
@media (max-width: 520px) {
  .post__title {
    font-size: var(--text-2xl);
  }
}
</style>
