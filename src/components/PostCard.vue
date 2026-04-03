<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { PostMeta } from '@/types'

defineProps<{
  post: PostMeta
  compact?: boolean
}>()

const router = useRouter()

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
    .replace(/\//g, '-')
}

function goTag(e: MouseEvent, tag: string) {
  e.preventDefault()
  e.stopPropagation()
  router.push({ path: '/blog', query: { tag } })
}
</script>

<template>
  <RouterLink :to="`/blog/${post.slug}`" class="post-card" :class="{ 'post-card--compact': compact }">
    <time :datetime="post.date" class="post-card__date">{{ formatDate(post.date) }}</time>
    <div class="post-card__body">
      <h3 class="post-card__title">{{ post.title }}</h3>
      <p v-if="post.description && !compact" class="post-card__desc">{{ post.description }}</p>
      <div v-if="post.tags?.length && !compact" class="post-card__tags">
        <button
          v-for="tag in post.tags"
          :key="tag"
          class="tag"
          @click="goTag($event, tag)"
        >{{ tag }}</button>
      </div>
    </div>
    <svg class="post-card__arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  </RouterLink>
</template>

<style scoped>
.post-card {
  display: grid;
  grid-template-columns: 90px 1fr 20px;
  gap: var(--space-4);
  align-items: start;
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--border-subtle);
  cursor: pointer;
  transition: background var(--transition);
}

.post-card:first-child {
  border-top: 1px solid var(--border-subtle);
}

.post-card:hover .post-card__title {
  color: var(--text-accent);
}

.post-card:hover .post-card__arrow {
  opacity: 1;
  transform: translateX(2px);
}

.post-card__date {
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  padding-top: 3px;
  white-space: nowrap;
}

.post-card__body {
  min-width: 0;
}

.post-card__title {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
  transition: color var(--transition);
  margin-bottom: var(--space-1);
}

.post-card__desc {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.6;
  margin-top: var(--space-2);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.post-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-top: var(--space-3);
}

.post-card__arrow {
  opacity: 0;
  color: var(--text-accent);
  transition: opacity var(--transition), transform var(--transition);
  margin-top: 3px;
  flex-shrink: 0;
}

/* Compact variant (homepage) */
.post-card--compact {
  padding: var(--space-3) 0;
}
</style>
