<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps<{ scanKey: number }>()

interface Heading {
  id: string
  text: string
  level: number  // 2, 3, or 4
}

const headings = ref<Heading[]>([])
const activeId = ref('')
const collapsed = ref(false)
const showTop = ref(false)

function scanHeadings() {
  const content = document.querySelector('.post__content')
  if (!content) {
    headings.value = []
    return
  }
  const els = content.querySelectorAll<HTMLElement>('h2, h3, h4')
  headings.value = Array.from(els)
    .filter(el => el.id)
    .map(el => ({
      id: el.id,
      text: el.textContent?.trim() ?? '',
      level: Number(el.tagName[1]),  // '2', '3', or '4'
    }))
  activeId.value = ''
  collapsed.value = false
}

watch(() => props.scanKey, async () => {
  await nextTick()
  scanHeadings()
}, { immediate: true })

let observer: IntersectionObserver | null = null

function setupObserver() {
  observer?.disconnect()
  observer = null
  if (headings.value.length === 0) return

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id
        }
      }
    },
    { rootMargin: '-10% 0px -80% 0px', threshold: 0 }
  )

  headings.value.forEach(({ id }) => {
    const el = document.getElementById(id)
    if (el) observer!.observe(el)
  })
}

// Re-run observer setup whenever headings change
watch(headings, setupObserver)

function onScroll() {
  showTop.value = window.scrollY > 300
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function scrollToHeading(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <!-- TOC panel (hidden on narrow screens via CSS) -->
  <aside v-if="headings.length > 0" class="toc" :class="{ 'toc--collapsed': collapsed }">
    <div class="toc__header">
      <span class="toc__label">目录</span>
      <button
        class="toc__toggle"
        :aria-label="collapsed ? '展开目录' : '折叠目录'"
        @click="collapsed = !collapsed"
      >{{ collapsed ? '›' : '‹' }}</button>
    </div>

    <nav v-show="!collapsed" class="toc__nav" aria-label="文章目录">
      <ul class="toc__list">
        <li
          v-for="h in headings"
          :key="h.id"
          class="toc__item"
          :class="{ 'toc__item--active': activeId === h.id }"
          :style="{ paddingLeft: `${(h.level - 2) * 0.75}rem` }"
        >
          <a :href="`#${h.id}`" class="toc__link" @click.prevent="scrollToHeading(h.id)">
            {{ h.text }}
          </a>
        </li>
      </ul>
    </nav>
  </aside>

  <!-- Back to top -->
  <Transition name="fade-up">
    <button
      v-if="showTop"
      class="back-top"
      aria-label="回到顶部"
      @click="scrollToTop"
    >↑</button>
  </Transition>
</template>

<style scoped>
/* ── TOC panel ────────────────────────────────── */
.toc {
  position: fixed;
  top: calc(var(--nav-h) + 1.5rem);
  right: 1.5rem;
  width: 220px;
  max-height: calc(100vh - var(--nav-h) - 4rem);
  display: flex;
  flex-direction: column;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  z-index: 40;
  transition: width var(--transition);
}

/* Collapsed: shrink to just the header strip */
.toc--collapsed {
  width: 80px;
}

.toc__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

.toc__label {
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  letter-spacing: 0.06em;
  white-space: nowrap;
  overflow: hidden;
}

.toc__toggle {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 0 var(--space-1);
  flex-shrink: 0;
  transition: color var(--transition);
}

.toc__toggle:hover {
  color: var(--text-accent);
}

/* ── TOC nav ──────────────────────────────────── */
.toc__nav {
  overflow-y: auto;
  padding: var(--space-2) 0;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.toc__list {
  list-style: none;
}

.toc__item {
  position: relative;
  border-left: 2px solid transparent;
  transition: border-color var(--transition);
}

.toc__item--active {
  border-left-color: var(--accent);
}

.toc__link {
  display: block;
  padding: var(--space-1) var(--space-3);
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  line-height: 1.5;
  color: var(--text-tertiary);
  text-decoration: none;
  transition: color var(--transition);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toc__link:hover,
.toc__item--active .toc__link {
  color: var(--text-accent);
}

/* ── Back to top ──────────────────────────────── */
.back-top {
  position: fixed;
  bottom: 2rem;
  right: 1.5rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  cursor: pointer;
  z-index: 41;
  transition: color var(--transition), border-color var(--transition);
}

.back-top:hover {
  color: var(--text-accent);
  border-color: var(--accent-border);
}

/* ── Transition ───────────────────────────────── */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: opacity var(--transition), transform var(--transition);
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* ── Responsive: hide TOC on narrow screens ───── */
@media (max-width: 1199px) {
  .toc {
    display: none;
  }
}
</style>
