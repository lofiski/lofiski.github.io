<script setup lang="ts">
import { shallowRef, computed, watch, onBeforeUnmount } from 'vue'
import photosData from '@/data/photos.json'
import type { PhotoMeta } from '@/types'
import { formatDateLong } from '@/utils/format'
import Icon from '@/components/Icon.vue'
import BlurhashCanvas from '@/components/BlurhashCanvas.vue'

// Sorted once at module scope — the source JSON never changes at runtime
const photos: PhotoMeta[] = [...(photosData.photos as PhotoMeta[])].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
)

// -1 when the lightbox is closed
const currentIndex = shallowRef(-1)
const selectedPhoto = computed(() => photos[currentIndex.value] ?? null)

// shallowRef + whole-Set replacement: mutating a Set in place is not reactive
const imgErrors = shallowRef<Set<string>>(new Set())

const photoUrl = (filename: string) => `/photos/${filename}`

const openPhoto = (index: number) => { currentIndex.value = index }
const closePhoto = () => { currentIndex.value = -1 }

function step(delta: number) {
  const next = currentIndex.value + delta
  if (next >= 0 && next < photos.length) currentIndex.value = next
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closePhoto()
  else if (e.key === 'ArrowLeft') step(-1)
  else if (e.key === 'ArrowRight') step(1)
  else return
  e.preventDefault()
}

/*
 * The lightbox is teleported to <body>, so key handling has to live on window —
 * it previously sat on a tabindex="-1" wrapper that never received focus.
 * Also lock page scroll so the grid doesn't slide around behind the overlay.
 */
watch(selectedPhoto, (photo) => {
  const open = photo !== null
  document.documentElement.classList.toggle('is-locked', open)
  if (open) window.addEventListener('keydown', onKeydown)
  else window.removeEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.documentElement.classList.remove('is-locked')
  window.removeEventListener('keydown', onKeydown)
})

function handleImgError(filename: string) {
  imgErrors.value = new Set([...imgErrors.value, filename])
}
</script>

<template>
  <div class="container container--wide">
    <div class="page-header">
      <h1 class="page-title">照片</h1>
      <span class="page-count">{{ photos.length }} 张</span>
    </div>

    <!-- Grid -->
    <div v-if="photos.length" class="photos-grid">
      <button
        v-for="(photo, index) in photos"
        :key="photo.filename"
        class="photo-thumb"
        :aria-label="`查看照片${photo.title ? ': ' + photo.title : ''}`"
        @click="openPhoto(index)"
        :style="{
          aspectRatio: photo.width && photo.height ? `${photo.width} / ${photo.height}` : '4/3',
        }"
      >
        <BlurhashCanvas
          v-if="photo.blurhash && !imgErrors.has(photo.filename)"
          :hash="photo.blurhash"
          class="photo-thumb__blur"
        />
        <img
          v-if="!imgErrors.has(photo.filename)"
          :src="photoUrl(photo.filename)"
          :alt="photo.title ?? ''"
          class="photo-thumb__img"
          loading="lazy"
          decoding="async"
          :width="photo.width"
          :height="photo.height"
          @error="handleImgError(photo.filename)"
        />
        <div v-if="photo.title" class="photo-thumb__overlay">
          <span class="photo-thumb__title">{{ photo.title }}</span>
        </div>
      </button>
    </div>

    <p v-else class="empty-hint">暂无照片。将处理过的照片放入 <code>photos/</code> 目录，运行 <code>npm run photos</code> 即可。</p>

    <!-- Lightbox -->
    <Teleport to="body">
      <div
        v-if="selectedPhoto"
        class="lightbox"
        role="dialog"
        aria-modal="true"
        :aria-label="selectedPhoto.title ?? '照片预览'"
        @click.self="closePhoto"
      >
        <div class="lightbox__content">
          <img
            :key="selectedPhoto.filename"
            :src="photoUrl(selectedPhoto.filename)"
            :alt="selectedPhoto.title ?? ''"
            class="lightbox__img"
          />
          <div class="lightbox__info">
            <span v-if="selectedPhoto.title" class="lightbox__title">{{ selectedPhoto.title }}</span>
            <time class="lightbox__date">{{ formatDateLong(selectedPhoto.date) }}</time>
            <span class="lightbox__counter">{{ currentIndex + 1 }} / {{ photos.length }}</span>
          </div>
        </div>

        <!-- Controls -->
        <button class="lightbox__btn lightbox__close" @click="closePhoto" aria-label="关闭">
          <Icon name="close" :size="18" />
        </button>

        <button
          v-if="currentIndex > 0"
          class="lightbox__btn lightbox__nav lightbox__nav--prev"
          @click="step(-1)"
          aria-label="上一张"
        >
          <Icon name="chevronLeft" :size="18" />
        </button>

        <button
          v-if="currentIndex < photos.length - 1"
          class="lightbox__btn lightbox__nav lightbox__nav--next"
          @click="step(1)"
          aria-label="下一张"
        >
          <Icon name="chevronRight" :size="18" />
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* ── Grid ─────────────────────────── */
.photos-grid {
  columns: 3 220px;
  gap: var(--space-2);
}

.photo-thumb {
  display: block;
  position: relative;
  width: 100%;
  overflow: hidden;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  margin-bottom: var(--space-2);
  break-inside: avoid;
  transition: border-color var(--transition);
}

.photo-thumb:hover {
  border-color: var(--accent-border);
}

.photo-thumb__blur {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  /*
    No `filter: blur()` here: it promoted every thumbnail to its own composited
    layer for the life of the page. The 32×32 buffer is upscaled by the browser,
    and its default smoothing already produces the blur.
  */
}

.photo-thumb__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  position: relative;
  z-index: 1;
  /*
    No load-in fade. Tracking a per-photo "loaded" flag re-rendered the whole
    grid once per image; an undecoded <img> paints nothing anyway, so the
    blurhash below simply shows through until the photo is ready.
  */
}

.photo-thumb__overlay {
  position: absolute;
  inset: auto 0 0;
  padding: var(--space-3) var(--space-3);
  background: linear-gradient(transparent, rgba(0,0,0,0.6));
  opacity: 0;
  transition: opacity var(--transition);
  z-index: 2;
}

.photo-thumb:hover .photo-thumb__overlay {
  opacity: 1;
}

.photo-thumb__title {
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  color: #e8ddd0;
}

/* ── Lightbox ──────────────────────── */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  animation: fade-in var(--transition);
}

@keyframes fade-in {
  from { opacity: 0; }
}

.lightbox__content {
  max-width: min(90vw, 1200px);
  max-height: 90dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.lightbox__img {
  max-width: 100%;
  max-height: calc(90dvh - 60px);
  object-fit: contain;
  border-radius: var(--radius-sm);
}

.lightbox__info {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  font-family: var(--font-ui);
  font-size: var(--text-xs);
}

.lightbox__title {
  color: #e4dbd0;
}

.lightbox__date,
.lightbox__counter {
  color: rgba(228, 219, 208, 0.5);
}

.lightbox__counter {
  margin-left: auto;
  font-variant-numeric: tabular-nums;
}

/* Shared chrome for close / prev / next */
.lightbox__btn {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  color: rgba(228, 219, 208, 0.7);
  border-radius: var(--radius-sm);
  transition: color var(--transition), background var(--transition);
}

.lightbox__btn:hover {
  color: #e4dbd0;
  background: rgba(255, 255, 255, 0.12);
}

.lightbox__close {
  top: var(--space-4);
  right: var(--space-4);
}

.lightbox__nav {
  top: 50%;
  transform: translateY(-50%);
}

.lightbox__nav--prev { left: var(--space-4); }
.lightbox__nav--next { right: var(--space-4); }

/* ── Empty ───────────────────────── */
.empty-hint code {
  font-family: var(--font-code);
  padding: 1px 5px;
  background: var(--code-bg);
  border: 1px solid var(--code-border);
  border-radius: var(--radius-sm);
  color: var(--text-accent);
}

/* Narrow screens: give the image the full width, drop the side arrows to the bottom */
@media (max-width: 640px) {
  .lightbox {
    padding: var(--space-4);
  }

  .lightbox__nav {
    top: auto;
    bottom: var(--space-4);
    transform: none;
  }

  .lightbox__nav--prev { left: var(--space-6); }
  .lightbox__nav--next { right: var(--space-6); }

  .lightbox__info {
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-2) var(--space-3);
  }

  .lightbox__counter {
    margin-left: 0;
  }
}
</style>
