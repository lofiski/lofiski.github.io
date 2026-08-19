<script setup lang="ts">
import { shallowRef, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePosts } from '@/composables/usePosts'
import PostCard from '@/components/PostCard.vue'

const route = useRoute()
const router = useRouter()
const { allPosts } = usePosts()

const searchQuery = shallowRef('')
const selectedTag = shallowRef<string | null>((route.query.tag as string) || null)

// Keep selectedTag in sync when navigating here from a tag link
watch(() => route.query.tag, (t) => {
  selectedTag.value = (t as string) || null
})

// The post list is a build-time constant, so the tag set and the search haystack
// are derived once on mount rather than re-evaluated as the query changes.
const allTags = [...new Set(allPosts.flatMap(p => p.tags ?? []))].sort()

const searchIndex = allPosts.map(p =>
  [p.title, p.description, p.tags?.join(' '), p.content]
    .filter(Boolean).join('\n').toLowerCase(),
)

const filteredPosts = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const tag = selectedTag.value
  if (!q && !tag) return allPosts
  return allPosts.filter((p, i) =>
    (!q || searchIndex[i].includes(q))
    && (!tag || !!p.tags?.includes(tag)),
  )
})

function toggleTag(tag: string) {
  const next = selectedTag.value === tag ? null : tag
  selectedTag.value = next
  router.replace({ query: next ? { tag: next } : {} })
}
</script>

<template>
  <div class="container">
    <div class="page-header">
      <h1 class="page-title">博客</h1>
      <span class="page-count">{{ allPosts.length }} 篇</span>
    </div>

    <!-- Filters -->
    <div class="filters">
      <input
        v-model="searchQuery"
        type="search"
        placeholder="搜索文章…"
        class="input"
        aria-label="搜索文章"
      />
      <div v-if="allTags.length" class="tag-filters" role="group" aria-label="按标签筛选">
        <button
          v-for="tag in allTags"
          :key="tag"
          class="tag"
          :class="{ 'tag--active': selectedTag === tag }"
          @click="toggleTag(tag)"
          :aria-pressed="selectedTag === tag"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <!-- Post list -->
    <div v-if="filteredPosts.length" role="list">
      <PostCard
        v-for="post in filteredPosts"
        :key="post.slug"
        :post="post"
      />
    </div>

    <p v-else class="empty-hint">没有找到匹配的文章。</p>
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.tag-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.tag--active {
  background: var(--accent-subtle);
  border-color: var(--accent);
  color: var(--text-accent);
}
</style>
