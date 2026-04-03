<script setup lang="ts">
import { shallowRef, computed } from 'vue'
import photosData from '@/data/photos.json'
import type { PhotoMeta } from '@/types'

const photos = computed<PhotoMeta[]>(() => {
  return [...(photosData.photos as PhotoMeta[])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
})

// shallowRef: replaced wholesale on open/close, no need to track photo object internals
const selectedPhoto = shallowRef<PhotoMeta | null>(null)
// shallowRef: always replaced with a new Set (immutable-style update)
const imgErrors = shallowRef<Set<string>>(new Set())

// Derive current index once; used for prev/next button visibility in template
const currentPhotoIndex = computed(() => {
  if (!selectedPhoto.value) return -1
  return photos.value.findIndex(p => p.filename === selectedPhoto.value!.filename)
})

function photoUrl(filename: string) {
  return `/photos/${filename}`
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

function openPhoto(photo: PhotoMeta) {
  selectedPhoto.value = photo
}

function closePhoto() {
  selectedPhoto.value = null
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closePhoto()
  if (e.key === 'ArrowLeft') prevPhoto()
  if (e.key === 'ArrowRight') nextPhoto()
}

function prevPhoto() {
  if (!selectedPhoto.value) return
  const idx = photos.value.findIndex(p => p.filename === selectedPhoto.value!.filename)
  if (idx > 0) selectedPhoto.value = photos.value[idx - 1]
}

function nextPhoto() {
  if (!selectedPhoto.value) return
  const idx = photos.value.findIndex(p => p.filename === selectedPhoto.value!.filename)
  if (idx < photos.value.length - 1) selectedPhoto.value = photos.value[idx + 1]
}

function handleImgError(filename: string) {
  imgErrors.value = new Set([...imgErrors.value, filename])
}
</script>

<template>
  <div class="container container--wide" @keydown="onKeydown" tabindex="-1">
    <div class="photos-header">
      <h1 class="page-title">照片</h1>
      <span class="photos-count">{{ photos.length }} 张</span>
    </div>

    <!-- Grid -->
    <div v-if="photos.length" class="photos-grid">
      <button
        v-for="photo in photos"
        :key="photo.filename"
        class="photo-thumb"
        :aria-label="`查看照片${photo.title ? ': ' + photo.title : ''}`"
        @click="openPhoto(photo)"
        :style="{
          aspectRatio: photo.width && photo.height ? `${photo.width} / ${photo.height}` : '4/3',
        }"
      >
        <!-- Blurhash placeholder -->
        <canvas
          v-if="photo.blurhash && !imgErrors.has(photo.filename)"
          class="photo-thumb__blur"
          :data-blurhash="photo.blurhash"
          aria-hidden="true"
        />
        <img
          v-if="!imgErrors.has(photo.filename)"
          :src="photoUrl(photo.filename)"
          :alt="photo.title ?? ''"
          class="photo-thumb__img"
          loading="lazy"
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
            :src="photoUrl(selectedPhoto.filename)"
            :alt="selectedPhoto.title ?? ''"
            class="lightbox__img"
          />
          <div class="lightbox__info">
            <span v-if="selectedPhoto.title" class="lightbox__title">{{ selectedPhoto.title }}</span>
            <time class="lightbox__date">{{ formatDate(selectedPhoto.date) }}</time>
          </div>
        </div>

        <!-- Controls -->
        <button class="lightbox__close" @click="closePhoto" aria-label="关闭">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>

        <button
          v-if="currentPhotoIndex > 0"
          class="lightbox__nav lightbox__nav--prev"
          @click="prevPhoto"
          aria-label="上一张"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>

        <button
          v-if="currentPhotoIndex < photos.length - 1"
          class="lightbox__nav lightbox__nav--next"
          @click="nextPhoto"
          aria-label="下一张"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.photos-header {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  margin-bottom: var(--space-8);
}

.page-title {
  font-family: var(--font-ui);
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.photos-count {
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

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
  filter: blur(12px);
  transform: scale(1.05);
}

.photo-thumb__img {
  width: 100%;
  height: auto;
  display: block;
  position: relative;
  z-index: 1;
  transition: transform var(--transition-slow);
}

.photo-thumb:hover .photo-thumb__img {
  transform: scale(1.02);
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
  backdrop-filter: blur(4px);
  animation: fadeIn 150ms ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
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

.lightbox__date {
  color: rgba(228, 219, 208, 0.5);
}

.lightbox__close {
  position: fixed;
  top: var(--space-6);
  right: var(--space-6);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(228, 219, 208, 0.7);
  border-radius: var(--radius-sm);
  transition: color var(--transition), background var(--transition);
}

.lightbox__close:hover {
  color: #e4dbd0;
  background: rgba(255,255,255,0.1);
}

.lightbox__nav {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(228, 219, 208, 0.7);
  border-radius: var(--radius-sm);
  transition: color var(--transition), background var(--transition);
}

.lightbox__nav:hover {
  color: #e4dbd0;
  background: rgba(255,255,255,0.1);
}

.lightbox__nav--prev { left: var(--space-4); }
.lightbox__nav--next { right: var(--space-4); }

/* ── Empty ───────────────────────── */
.empty-hint {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  padding: var(--space-16) 0;
  text-align: center;
  line-height: 1.8;
}

.empty-hint code {
  font-family: var(--font-code);
  padding: 1px 5px;
  background: var(--code-bg);
  border: 1px solid var(--code-border);
  border-radius: var(--radius-sm);
  color: var(--text-accent);
}
</style>
