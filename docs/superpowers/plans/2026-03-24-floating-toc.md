# Floating TOC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a collapsible floating right-side table-of-contents sidebar and a back-to-top button to the blog post reading page.

**Architecture:** A new `TableOfContents.vue` component is placed alongside `<article>` in `PostPage.vue`. It receives a `scanKey: number` prop (incremented on each post load) to trigger DOM re-scanning. It uses `IntersectionObserver` to highlight the active heading and a `window` scroll listener to show/hide the back-to-top button.

**Tech Stack:** Vue 3 Composition API (`<script setup lang="ts">`), CSS custom properties from `src/styles/main.css`, no additional dependencies.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/components/TableOfContents.vue` | TOC panel + back-to-top button, all fixed-position UI |
| Modify | `src/pages/PostPage.vue` | Add `scanKey` ref, import + place `<TableOfContents>` |

---

## Task 1: Create `TableOfContents.vue` — skeleton + props

**Files:**
- Create: `src/components/TableOfContents.vue`

- [ ] **Step 1: Create the component file with props and empty template**

```vue
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
</script>

<template>
  <div class="toc-root">
    <!-- placeholder -->
  </div>
</template>

<style scoped>
/* placeholder */
</style>
```

- [ ] **Step 2: Verify the file exists and is valid TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors related to `TableOfContents.vue`

- [ ] **Step 3: Commit skeleton**

```bash
git add src/components/TableOfContents.vue
git commit -m "feat: add TableOfContents.vue skeleton"
```

---

## Task 2: Implement heading scan logic

**Files:**
- Modify: `src/components/TableOfContents.vue`

- [ ] **Step 1: Add the `scanHeadings` function and `watch(scanKey)`**

Inside `<script setup>`, after the `ref` declarations, add:

```ts
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
```

- [ ] **Step 2: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit scan logic**

```bash
git add src/components/TableOfContents.vue
git commit -m "feat: implement heading scan logic in TableOfContents"
```

---

## Task 3: Implement IntersectionObserver for active heading

**Files:**
- Modify: `src/components/TableOfContents.vue`

- [ ] **Step 1: Add observer setup and cleanup**

After the `watch(() => props.scanKey, ...)` block, add:

```ts
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

onBeforeUnmount(() => {
  observer?.disconnect()
})
```

- [ ] **Step 2: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit observer logic**

```bash
git add src/components/TableOfContents.vue
git commit -m "feat: add IntersectionObserver for active heading tracking"
```

---

## Task 4: Implement back-to-top scroll listener

**Files:**
- Modify: `src/components/TableOfContents.vue`

- [ ] **Step 1: Add scroll handler and onMounted registration**

After the `watch(headings, setupObserver)` line, add:

```ts
function onScroll() {
  showTop.value = window.scrollY > 300
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})
```

- [ ] **Step 2: Replace the onBeforeUnmount from Task 3 with a merged version**

Find the `onBeforeUnmount` block added in Task 3 and replace it entirely with:

```ts
onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('scroll', onScroll)
})
```

- [ ] **Step 3: Add scrollToTop function**

```ts
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
```

- [ ] **Step 3: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit scroll logic**

```bash
git add src/components/TableOfContents.vue
git commit -m "feat: add scroll listener and back-to-top logic"
```

---

## Task 5: Build the TOC template

**Files:**
- Modify: `src/components/TableOfContents.vue`

- [ ] **Step 1: Replace the placeholder `<template>` with the full markup**

```vue
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
          <a :href="`#${h.id}`" class="toc__link" @click.prevent="scrollTo(h.id)">
            {{ h.text }}
          </a>
        </li>
      </ul>
    </nav>
  </aside>

  <!-- Back to top -->
  <Transition name="fade-up">
    <button
      v-show="showTop"
      class="back-top"
      aria-label="回到顶部"
      @click="scrollToTop"
    >↑</button>
  </Transition>
</template>
```

- [ ] **Step 2: Add the `scrollTo` helper function in `<script setup>`**

```ts
function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
```

- [ ] **Step 3: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit template**

```bash
git add src/components/TableOfContents.vue
git commit -m "feat: add TOC and back-to-top template markup"
```

---

## Task 6: Style the TOC panel and back-to-top button

**Files:**
- Modify: `src/components/TableOfContents.vue`

- [ ] **Step 1: Replace the `<style scoped>` placeholder with full styles**

```css
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
```

- [ ] **Step 2: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit styles**

```bash
git add src/components/TableOfContents.vue
git commit -m "feat: add TOC and back-to-top styles"
```

---

## Task 7: Wire `TableOfContents` into `PostPage.vue`

**Files:**
- Modify: `src/pages/PostPage.vue`

- [ ] **Step 1: Add `scanKey` ref and `watch` to `PostPage.vue`**

First, open `src/pages/PostPage.vue` and check which Vue imports are already on line 2. The existing import is:
```ts
import { shallowRef, watchEffect, watch, nextTick, onBeforeUnmount, markRaw } from 'vue'
```
Add `ref` to that existing import line (do not duplicate the import). Then add the component import and new reactive state below:

```ts
// Extend existing import — add ref:
import { shallowRef, watchEffect, watch, nextTick, onBeforeUnmount, markRaw, ref } from 'vue'

// Add after existing imports:
import TableOfContents from '@/components/TableOfContents.vue'

// Add after existing shallowRef declarations:
const scanKey = ref(0)

// Add this watch (separate from the copy-button watch):
watch(PostComponent, (val) => {
  if (val) scanKey.value++
})
```

- [ ] **Step 2: Place `<TableOfContents>` in the template**

In the template, find the `<article v-else class="post">` block. Place `<TableOfContents>` as a sibling **after** the closing `</article>` tag, still inside `<div class="container">`:

```vue
<div class="container">
  <!-- Loading -->
  ...
  <!-- Not found -->
  ...
  <!-- Post -->
  <article v-else class="post">
    ...
  </article>

  <!-- Floating TOC + back-to-top (outside article, inside container) -->
  <TableOfContents v-if="!loading && !notFound" :scan-key="scanKey" />
</div>
```

- [ ] **Step 3: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit integration**

```bash
git add src/pages/PostPage.vue
git commit -m "feat: integrate TableOfContents into PostPage"
```

---

## Task 8: Manual verification

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Open: `http://localhost:5173`

- [ ] **Step 2: Navigate to a post with multiple headings**

Confirm:
- TOC panel appears on the right side (test on viewport width ≥ 1200px)
- Headings H2/H3/H4 are listed with correct indentation
- Collapse button (`‹`) hides the heading list; `›` re-expands it

- [ ] **Step 3: Scroll through the post**

Confirm:
- Active heading in TOC highlights (gold color + left border) as you scroll
- Back-to-top button appears after scrolling ~300px down
- Clicking a TOC link smoothly scrolls to the heading

- [ ] **Step 4: Click back-to-top**

Confirm: page smoothly returns to top, button disappears

- [ ] **Step 5: Navigate to another post (or a post with no headings)**

Confirm:
- TOC re-scans: new headings shown, active state reset, panel re-expanded
- On a post with no headings: TOC panel is hidden entirely

- [ ] **Step 6: Test on a narrow viewport (< 1200px)**

Confirm: TOC panel is hidden; back-to-top button still appears and works

- [ ] **Step 7: Test light/dark theme switch**

Confirm: TOC panel and back-to-top button colors adapt to the theme

- [ ] **Step 8: Final commit (if any tweaks made)**

```bash
git add -p
git commit -m "fix: toc visual tweaks after manual testing"
```

---

## Task 9: Production build check

- [ ] **Step 1: Build**

Run: `npm run build`
Expected: build completes with no errors or type errors

- [ ] **Step 2: Preview the build**

Run: `npm run preview`
Verify TOC works in the production build at `http://localhost:4173`

- [ ] **Step 3: Final commit if any issues fixed**

```bash
git add -p
git commit -m "fix: resolve build issues"
```
