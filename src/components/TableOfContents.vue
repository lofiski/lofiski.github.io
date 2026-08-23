<script setup lang="ts">
import { shallowRef, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps<{ scanKey: number }>()

interface Heading {
  id: string
  text: string
  level: number  // 2, 3, or 4
}

// shallowRef: the heading list is always replaced wholesale, never mutated in place
const headings = shallowRef<Heading[]>([])
const activeId = shallowRef('')
const collapsed = shallowRef(false)
const showTop = shallowRef(false)

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
  onScroll()  // deep-linking straight into a post should show the button immediately
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
      <span class="eyebrow toc__label">目录</span>
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
  <Transition name="fade">
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
  top: calc(var(--nav-h) + var(--space-6));
  right: var(--space-6);
  width: 220px;
  max-height: calc(100vh - var(--nav-h) - var(--space-16));
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
  overflow: hidden;
  z-index: 40;
}

/* Collapsed: shrink to just the header strip */
.toc--collapsed {
  width: 88px;
}

.toc__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3);
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

.toc__label {
  white-space: nowrap;
  overflow: hidden;
}

.toc__toggle {
  font-family: var(--font-sans);
  font-size: var(--size-body);
  line-height: 1;
  color: var(--text-faint);
  padding: 0 var(--space-1);
  flex-shrink: 0;
  transition: color var(--dur-fast) var(--ease-standard);
}

.toc__toggle:hover {
  color: var(--text-strong);
}

/* ── TOC nav ──────────────────────────────────── */
.toc__nav {
  overflow-y: auto;
  padding: var(--space-2) 0;
  scrollbar-width: thin;
  scrollbar-color: var(--border-strong) transparent;
}

.toc__list {
  list-style: none;
}

/* Active is marked by an ink hairline, not a colour — needle has no accent hue */
.toc__item {
  position: relative;
  border-left: 2px solid transparent;
  transition: border-color var(--dur-fast) var(--ease-standard);
}

.toc__item--active {
  border-left-color: var(--ink);
}

.toc__link {
  display: block;
  padding: var(--space-1) var(--space-3);
  font-family: var(--font-sans);
  font-size: var(--size-body-sm);
  line-height: var(--leading-normal);
  color: var(--text-faint);
  transition: color var(--dur-fast) var(--ease-standard);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toc__link:hover,
.toc__item--active .toc__link {
  color: var(--text-strong);
}

/* ── Back to top ──────────────────────────────── */
.back-top {
  position: fixed;
  bottom: var(--space-8);
  right: var(--space-6);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
  font-family: var(--font-sans);
  font-size: var(--size-body);
  color: var(--text-muted);
  z-index: 41;
  transition: var(--motion-hover);
}

.back-top:hover {
  color: var(--text-strong);
  background: var(--bg-sunken);
  border-color: var(--border-strong);
}

/* ── Transition ───────────────────────────────── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--dur-base) var(--ease-standard);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ── Responsive: hide TOC on narrow screens ───── */
@media (max-width: 1199px) {
  .toc {
    display: none;
  }
}
</style>
