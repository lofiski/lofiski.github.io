# Design: Floating Table of Contents + Back to Top

Date: 2026-03-24

## Overview

Add a floating TOC sidebar to the post reading page (`PostPage.vue`), implemented as a standalone `TableOfContents.vue` component. Also add a back-to-top button in the bottom-right corner.

## Requirements

- Display H2–H4 headings extracted from the rendered post content (H1 excluded, see Edge Cases)
- TOC floats fixed on the right side of the viewport on wide screens (≥ 1200px), hidden on narrower screens
- Collapsible: a toggle button allows hiding/showing the TOC panel
- Active heading highlighted as the user scrolls (IntersectionObserver with rootMargin)
- Back-to-top button in the bottom-right corner, visible after scrolling 300px down
- Style follows existing design tokens (CSS custom properties from `main.css`)

## Architecture

### New file: `src/components/TableOfContents.vue`

Single-responsibility component that:
1. Receives `scanKey: number` prop; `watch`es it to re-scan headings after each post load
2. After `nextTick`, scans `.post__content h2, h3, h4` to build heading list `{ id, text, level }[]`
3. Renders as a fixed right-side panel with collapse toggle
4. Uses `IntersectionObserver` (with `rootMargin: "-10% 0px -80% 0px"`) to track active heading
5. Renders the back-to-top button (logically grouped: both are fixed-position UI elements)
6. Registers a `window` scroll listener on `onMounted` to control back-to-top visibility
7. Cleans up both the observer and scroll listener in `onBeforeUnmount`

### Modified file: `src/pages/PostPage.vue`

- Import `TableOfContents` and place it **outside** `<article>`, as a sibling within `.container`
- Add a `scanKey` ref (type `number`, initialized to `0`); increment it each time `PostComponent` becomes non-null (i.e., after a successful post load)
- Pass `:scan-key="scanKey"` to `<TableOfContents />`

```ts
// PostPage.vue addition
const scanKey = ref(0)

watch(PostComponent, (val) => {
  if (val) scanKey.value++
})
```

### Data flow

```
PostPage: watchEffect loads post
  → PostComponent changes to non-null
  → watch(PostComponent) increments scanKey
  → TableOfContents watch(scanKey) triggers
  → nextTick() → scan .post__content h2~h4
  → build headings[], reset activeId
  → connect IntersectionObserver to each heading el
```

Using an incrementing counter (`scanKey: number`) guarantees a new value on every post load, avoiding the unreliable boolean-toggle pitfall.

## Component API

```ts
// Props
interface Props {
  scanKey: number  // incremented by parent each time post content is ready
}
```

No emits needed.

## UI Details

### TOC Panel placement & layout
- `position: fixed` on `<aside>` — not affected by `overflow` on `.container`, but **will** be affected if any ancestor has `transform`, `will-change: transform`, or `filter`. The existing layout uses none of these, so fixed positioning is safe.
- Position: `top: calc(var(--nav-h) + 1.5rem)` (stays below the 56px navbar), `right: 1.5rem`
- At `--max-w-content: 720px` centered in a 1200px viewport, `(1200 - 720) / 2 ≈ 240px` of space on each side — the 220px TOC fits comfortably at `right: 1.5rem`
- Width: ~220px when expanded; collapses to a 32px-wide strip (just the toggle button)
- `display: none` at `max-width: 1199px` (hidden on mobile/tablet)

### TOC items
- Heading indentation: `(level - 2) × 0.75rem` left padding (H2 = 0px, H3 = 0.75px, H4 = 1.5rem)
- Active item: `--text-accent` color + 2px left border in `--accent`
- Non-active: `--text-tertiary`, hover `--text-secondary`
- Font: `--font-ui`, `--text-xs`, `line-height: 1.5`
- Panel: `background: var(--bg-elevated)`, `border: 1px solid var(--border)`, `border-radius: var(--radius-md)`, subtle box-shadow
- Max-height with `overflow-y: auto` to handle very long TOC lists

### IntersectionObserver settings
```ts
new IntersectionObserver(callback, {
  rootMargin: '-10% 0px -80% 0px',  // activates headings in top ~10–20% of viewport
  threshold: 0
})
```
When multiple headings are intersecting, the last one in DOM order wins (`activeId` is updated for each intersecting entry; observer fires in DOM order).

### Collapse toggle
- Button at top of panel: `≡` (expanded) / `›` (collapsed)
- Collapsed state: hide heading list, keep button visible
- Collapse state is local (`ref<boolean>`) and resets to expanded on each new post load

### Back-to-Top Button
- `position: fixed; bottom: 2rem; right: 1.5rem`
- Shown when `window.scrollY > 300` (tracked via `window` scroll listener registered in `onMounted`)
- Click: `window.scrollTo({ top: 0, behavior: 'smooth' })`
- `v-show` with CSS `opacity` + `transform: translateY` transition for smooth appear/disappear
- Style: 36×36px square, `--bg-elevated` bg, `--border` border, `--text-tertiary` color, hover `--text-accent`
- Positioned so it sits below the TOC panel (both at `right: 1.5rem`, back-to-top at `bottom: 2rem`)

## Error / Edge Cases

- **H1 excluded from scan**: PostPage already renders `<h1 class="post__title">` in the `<header>` outside `.post__content`. If a post's markdown includes `# Title` (h1), it would duplicate the page title in the TOC. To avoid confusion, scan only `h2, h3, h4`. Authors should start markdown headings at `##`.
- **Posts with no headings**: `v-if="headings.length > 0"` hides the TOC panel body; the collapse button is also hidden. Back-to-top still works independently.
- **Heading elements without `id`**: `markdown-it-anchor` (used by `unplugin-vue-markdown`) adds ids automatically. If an id is somehow missing, skip that heading (`if (!el.id) return`).
- **nextTick timing**: Single `nextTick` is sufficient because `.post__content` headings are static HTML rendered synchronously by the Vue SFC. Code highlighting (Shiki) and images do not affect heading element availability.
- **Navigation to new post**: observer is disconnected in cleanup, `headings` array and `activeId` are reset, collapse state resets to expanded, then re-scan fires via `scanKey` increment.
- **Scroll listener leak**: listener is registered once in `onMounted`, removed in `onBeforeUnmount`. The `watch(scanKey)` callback does NOT re-register it.

## Testing Notes

- Manually verify with a long multi-heading post (h2/h3/h4 mix)
- Check active highlight updates correctly while scrolling
- Check collapse/expand toggle
- Verify TOC hides and back-to-top still appears on mobile (< 1200px)
- Verify back-to-top disappears at page top
- Navigate between two posts; confirm TOC re-scans and active state resets
