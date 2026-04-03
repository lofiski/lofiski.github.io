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

const allTags = computed(() => {
  const tagSet = new Set<string>()
  allPosts.value.forEach(p => p.tags?.forEach(t => tagSet.add(t)))
  return [...tagSet].sort()
})

const filteredPosts = computed(() => {
  let posts = allPosts.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    posts = posts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.tags?.some(t => t.toLowerCase().includes(q)) ||
      p.content?.toLowerCase().includes(q),
    )
  }
  if (selectedTag.value) {
    posts = posts.filter(p => p.tags?.includes(selectedTag.value!))
  }
  return posts
})

function toggleTag(tag: string) {
  const next = selectedTag.value === tag ? null : tag
  selectedTag.value = next
  router.replace({ query: next ? { tag: next } : {} })
}
</script>

<template>
  <div class="container">
    <div class="blog-header">
      <h1 class="page-title">博客</h1>
      <span class="blog-count">{{ allPosts.length }} 篇</span>
    </div>

    <!-- Filters -->
    <div class="filters">
      <input
        v-model="searchQuery"
        type="search"
        placeholder="搜索文章…"
        class="search-input"
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
.blog-header {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

.page-title {
  font-family: var(--font-ui);
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.blog-count {
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.filters {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.search-input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  transition: border-color var(--transition);
  outline: none;
  appearance: none;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-input:focus {
  border-color: var(--accent-border);
}

.tag-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.tag {
  cursor: pointer;
  transition: background var(--transition), border-color var(--transition), color var(--transition);
}

.tag--active {
  background: var(--accent-subtle);
  border-color: var(--accent);
  color: var(--text-accent);
}

.empty-hint {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  padding: var(--space-12) 0;
  text-align: center;
}
</style>
