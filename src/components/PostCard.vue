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
  grid-template-columns: 90px 1fr;
  gap: var(--space-4);
  align-items: start;
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--border-subtle);
  cursor: pointer;
}

.post-card:first-child {
  border-top: 1px solid var(--border-subtle);
}

/* Colour shift on the title is the whole hover affordance — no sliding arrow. */
.post-card:hover .post-card__title {
  color: var(--text-accent);
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

/* Compact variant (homepage) */
.post-card--compact {
  padding: var(--space-3) 0;
}

/* Narrow screens: the fixed 90px date column squeezes titles — stack instead */
@media (max-width: 520px) {
  .post-card {
    grid-template-columns: 1fr;
    gap: var(--space-1);
  }
}
</style>
