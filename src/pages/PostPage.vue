<script setup lang="ts">
import { shallowRef, watch, nextTick, onBeforeUnmount, markRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { postModules, usePosts } from '@/composables/usePosts'
import type { PostFrontmatter } from '@/types'
import { formatDateLong } from '@/utils/format'
import { setDocumentTitle } from '@/router'
import TableOfContents from '@/components/TableOfContents.vue'

const route = useRoute()
const router = useRouter()
const { allPosts } = usePosts()

// Bumped after each post renders so the TOC re-scans the new headings
const scanKey = shallowRef(0)

// shallowRef throughout: these hold primitives or opaque objects replaced wholesale
const PostComponent = shallowRef<object | null>(null)
const frontmatter = shallowRef<PostFrontmatter | null>(null)
const loading = shallowRef(true)
const notFound = shallowRef(false)
const contentEl = shallowRef<HTMLElement | null>(null)

async function loadPost(slug: string) {
  const loader = postModules[`/posts/${slug}.md`]

  loading.value = true
  notFound.value = false
  PostComponent.value = null
  frontmatter.value = null

  if (!loader) {
    notFound.value = true
    loading.value = false
    return
  }

  try {
    const mod = await loader()
    PostComponent.value = markRaw(mod.default as object)
    /*
     * The post list is the authoritative frontmatter source — it parses the raw
     * markdown itself. The module's named exports are only a fallback for drafts,
     * which are filtered out of the list but still reachable by direct URL.
     * (There is no `mod.frontmatter`; reading one silently blanked this header.)
     */
    frontmatter.value = allPosts.find(p => p.slug === slug) ?? {
      title: mod.title ?? slug,
      date: mod.date ?? '',
      description: mod.description,
      tags: mod.tags,
    }
  }
  catch {
    notFound.value = true
  }
  finally {
    loading.value = false
  }
}

watch(() => route.params.slug as string, loadPost, { immediate: true })

watch([frontmatter, notFound], ([fm, missing]) => {
  if (missing) setDocumentTitle('文章不存在')
  else if (fm?.title) setDocumentTitle(fm.title)
})

const goBlog = () => router.push('/blog')
const goTag = (tag: string) => router.push({ path: '/blog', query: { tag } })

// ── Copy buttons ────────────────────────────────────────────
// Shiki's <pre> blocks live outside Vue's template control, so the buttons are
// appended by hand. Clicks are handled by one delegated listener on the content
// wrapper (see @click in the template) instead of one listener per block.
const COPY_IDLE = '复制'
let resetTimer: ReturnType<typeof setTimeout> | undefined
let pendingBtn: HTMLElement | null = null

function resetPendingBtn() {
  if (!pendingBtn) return
  pendingBtn.textContent = COPY_IDLE
  pendingBtn.classList.remove('copy-btn--copied')
  pendingBtn = null
}

watch(PostComponent, async (val) => {
  clearTimeout(resetTimer)
  pendingBtn = null
  if (!val) return

  scanKey.value++
  await nextTick()

  contentEl.value?.querySelectorAll('pre').forEach((pre) => {
    if (pre.querySelector('.copy-btn')) return
    const btn = document.createElement('button')
    btn.className = 'copy-btn'
    btn.type = 'button'
    btn.setAttribute('aria-label', '复制代码')
    btn.textContent = COPY_IDLE
    pre.appendChild(btn)
  })
})

async function onContentClick(e: MouseEvent) {
  const btn = (e.target as HTMLElement).closest?.('.copy-btn') as HTMLElement | null
  if (!btn) return

  clearTimeout(resetTimer)
  resetPendingBtn()

  try {
    await navigator.clipboard.writeText(btn.parentElement?.querySelector('code')?.textContent ?? '')
    btn.textContent = '已复制'
  }
  catch {
    // Clipboard is unavailable on insecure origins / denied permission
    btn.textContent = '复制失败'
  }
  btn.classList.add('copy-btn--copied')
  pendingBtn = btn
  resetTimer = setTimeout(resetPendingBtn, 2000)
}

onBeforeUnmount(() => clearTimeout(resetTimer))
</script>

<template>
  <div class="container">
    <!-- Loading: reserves height so the footer doesn't jump, without an animation -->
    <div v-if="loading" class="loading" aria-live="polite" aria-busy="true" />

    <!-- Not found -->
    <div v-else-if="notFound" class="not-found">
      <p class="not-found__msg">文章不存在。</p>
      <button class="text-btn" @click="goBlog">← 返回 Blog</button>
    </div>

    <!-- Post -->
    <article v-else class="post">
      <!-- Header -->
      <header class="post__header">
        <div class="post__meta">
          <button class="text-btn" @click="goBlog" aria-label="返回文章列表">
            ← Blog
          </button>
          <time v-if="frontmatter?.date" :datetime="frontmatter.date" class="post__date">
            {{ formatDateLong(frontmatter.date) }}
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
      <div ref="contentEl" class="prose post__content" @click="onContentClick">
        <component :is="PostComponent" />
      </div>

      <!-- Footer nav -->
      <div class="post__footer">
        <button class="text-btn" @click="goBlog">← 返回文章列表</button>
      </div>
    </article>

    <!-- Floating TOC + back-to-top -->
    <TableOfContents v-if="!loading && !notFound" :scan-key="scanKey" />
  </div>
</template>

<style scoped>
.loading {
  min-height: 60vh;
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
