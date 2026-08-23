<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { PostMeta } from '@/types'
import { formatDateShort } from '@/utils/format'

defineProps<{
  post: PostMeta
  compact?: boolean
}>()

const router = useRouter()

function goTag(e: MouseEvent, tag: string) {
  e.preventDefault()
  e.stopPropagation()
  router.push({ path: '/blog', query: { tag } })
}
</script>

<template>
  <RouterLink :to="`/blog/${post.slug}`" class="post-card" :class="{ 'post-card--compact': compact }">
    <!-- Dates are numbers, and needle sets numbers in mono -->
    <time :datetime="post.date" class="post-card__date">{{ formatDateShort(post.date) }}</time>
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
  </RouterLink>
</template>

<style scoped>
.post-card {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: var(--space-5);
  align-items: start;
  padding: var(--space-4);
  /* Pull the hover fill out past the text so the row reads as one target */
  margin: 0 calc(var(--space-4) * -1);
  border-radius: var(--radius-md);
  border-bottom: 1px solid var(--border-subtle);
  transition: var(--motion-hover);
}

.post-card:hover {
  background: var(--bg-sunken);
  border-bottom-color: transparent;
}

.post-card:hover .post-card__title,
.post-card:hover .post-card__date {
  color: var(--text-strong);
}

.post-card__date {
  font-family: var(--font-mono);
  font-size: var(--size-caption);
  letter-spacing: var(--tracking-wide);
  color: var(--text-faint);
  font-variant-numeric: tabular-nums;
  padding-top: 4px;
  white-space: nowrap;
  transition: color var(--dur-fast) var(--ease-standard);
}

.post-card__body {
  min-width: 0;
}

.post-card__title {
  font-family: var(--font-sans);
  font-size: var(--size-body-lg);
  font-weight: var(--weight-medium);
  color: var(--text-body);
  line-height: var(--leading-snug);
  letter-spacing: var(--tracking-tight);
  transition: color var(--dur-fast) var(--ease-standard);
}

.post-card__desc {
  font-family: var(--font-sans);
  font-size: var(--size-body-sm);
  color: var(--text-muted);
  line-height: var(--leading-normal);
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

/* Compact variant (homepage) */
.post-card--compact {
  padding-top: var(--space-3);
  padding-bottom: var(--space-3);
}

/* Narrow screens: the fixed date column squeezes titles — stack instead */
@media (max-width: 520px) {
  .post-card {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }

  .post-card__date {
    padding-top: 0;
  }
}
</style>
