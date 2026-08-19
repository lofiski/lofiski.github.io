<script setup lang="ts">
import { siteConfig } from '@/config/site'
import { usePosts } from '@/composables/usePosts'
import { projects } from '@/data/projects'
import PostCard from '@/components/PostCard.vue'
import Icon from '@/components/Icon.vue'

const RECENT_LIMIT = 5

// Both lists come from build-time constants — derive them once, no reactivity needed
const { allPosts } = usePosts()
const recentPosts = allPosts.slice(0, RECENT_LIMIT)
const featuredProjects = projects.filter(p => p.featured).slice(0, 3)

const isMainDomain = typeof window !== 'undefined' && window.location.hostname === '125815.xyz'
</script>

<template>
  <div class="container">
    <!-- ── Profile ─────────────────────────────── -->
    <section class="profile">
      <div class="profile__avatar-wrap">
        <img
          v-if="siteConfig.avatar"
          :src="siteConfig.avatar"
          :alt="siteConfig.name"
          class="profile__avatar"
          width="72"
          height="72"
          loading="eager"
        />
        <div v-else class="profile__avatar-fallback" aria-hidden="true">
          {{ siteConfig.name[0].toUpperCase() }}
        </div>
      </div>

      <div class="profile__content">
        <h1 class="profile__name">{{ siteConfig.name }}</h1>
        <p class="profile__bio">{{ siteConfig.bio }}</p>
        <p v-for="line in siteConfig.about" :key="line" class="profile__about">{{ line }}</p>
        
        <!-- ── 自定义内容：直接在这里写 ────────────── -->
        <p class="profile__custom">
          在 <RouterLink to="/blog" class="link">博客</RouterLink> 写文章，
          在 <RouterLink to="/projects" class="link">项目</RouterLink> 放开发的东西，
          在 <RouterLink to="/photos" class="link">照片</RouterLink> 记录拍过的画面。
        </p>

        <p class="profile__custom">
          如需联系，邮箱是 <a :href="`mailto:${siteConfig.email}`" class="link">{{ siteConfig.email }}</a>，
          要留言或查看其他人的留言 <RouterLink to="/guestbook" class="link">点这里</RouterLink>。
        </p>

        <p class="profile__custom">
          <a
            :href="isMainDomain ? 'https://blog.125815.xyz/' : 'https://125815.xyz/'"
            class="link"
          >{{ isMainDomain ? '中国大陆网络访问该网站如卡顿可点击这里！' : '点击这里回到主域名！' }}</a>
        </p>

        <div class="profile__interests">
          <span v-for="item in siteConfig.interests" :key="item" class="tag">{{ item }}</span>
        </div>
      </div>
    </section>

    <!-- ── Recent Posts ──────────────────────────── -->
    <section>
      <h2 class="section-rule">最近文章</h2>

      <div v-if="recentPosts.length">
        <PostCard
          v-for="post in recentPosts"
          :key="post.slug"
          :post="post"
          compact
        />
        <RouterLink v-if="allPosts.length > RECENT_LIMIT" to="/blog" class="text-btn view-all">
          全部文章 ({{ allPosts.length }})
          <Icon name="arrowRight" :size="12" />
        </RouterLink>
      </div>

      <p v-else class="empty-hint">还没有文章，快去写一篇吧。</p>
    </section>

    <!-- ── Projects ──────────────────────────────── -->
    <section v-if="featuredProjects.length">
      <h2 class="section-rule">项目</h2>
      <div class="project-list">
        <a
          v-for="project in featuredProjects"
          :key="project.name"
          :href="project.url ?? `https://github.com/${project.github}`"
          target="_blank"
          rel="noopener noreferrer"
          class="project-item"
        >
          <div class="project-item__header">
            <span class="project-item__name">{{ project.name }}</span>
            <div class="project-item__links">
              <span v-if="project.wip" class="tag">WIP</span>
              <Icon name="external" :size="12" />
            </div>
          </div>
          <p class="project-item__desc">{{ project.description }}</p>
          <div class="project-item__tech">
            <span v-for="t in project.tech" :key="t" class="tag">{{ t }}</span>
          </div>
        </a>
      </div>
      <RouterLink to="/projects" class="text-btn view-all">
        所有项目
        <Icon name="arrowRight" :size="12" />
      </RouterLink>
    </section>
  </div>
</template>

<style scoped>
/* ── Profile ─────────────────────── */
.profile {
  display: flex;
  gap: var(--space-6);
  align-items: flex-start;
  padding-bottom: var(--space-10);
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: var(--space-2);
}

.profile__avatar-wrap {
  flex-shrink: 0;
}

.profile__avatar {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-md);
  object-fit: cover;
  border: 1px solid var(--border);
}

.profile__avatar-fallback {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-ui);
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--text-tertiary);
  background: var(--bg-elevated);
}

.profile__content {
  flex: 1;
  min-width: 0;
}

.profile__name {
  font-family: var(--font-ui);
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  margin-bottom: var(--space-2);
}

.profile__bio {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin-bottom: var(--space-3);
  line-height: 1.6;
}

.profile__about {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: var(--space-1);
}

.profile__interests {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

.profile__custom {
  margin-top: var(--space-5);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.7;
}

.view-all {
  margin-top: var(--space-4);
}

/* ── Projects ──────────────────────── */
.project-list {
  display: grid;
  gap: var(--space-3);
}

.project-item {
  display: block;
  padding: var(--space-4) var(--space-5);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  transition: border-color var(--transition), background var(--transition);
}

.project-item:hover {
  border-color: var(--accent-border);
  background: var(--bg-hover);
}

.project-item__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.project-item__name {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.project-item:hover .project-item__name {
  color: var(--text-accent);
}

.project-item__links {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-tertiary);
}

.project-item__desc {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--space-3);
}

.project-item__tech {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

/* ── Mobile ──────────────────────── */
@media (max-width: 520px) {
  .profile {
    flex-direction: column;
    gap: var(--space-4);
  }
}
</style>
