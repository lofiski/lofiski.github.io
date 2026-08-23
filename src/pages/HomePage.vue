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
</script>

<template>
  <div class="container">
    <!-- ── Hero ─────────────────────────────────────
         The one place the display face runs at full size. -->
    <section class="hero">
      <div class="hero__text">
        <p class="eyebrow hero__eyebrow">{{ siteConfig.title }}</p>
        <h1 class="hero__name">
          {{ siteConfig.name }}<span class="hero__dot" aria-hidden="true">.</span>
        </h1>
        <p class="hero__bio">{{ siteConfig.bio }}</p>
      </div>

      <div class="hero__avatar-wrap">
        <img
          v-if="siteConfig.avatar"
          :src="siteConfig.avatar"
          :alt="siteConfig.name"
          class="hero__avatar"
          width="96"
          height="96"
          loading="eager"
        />
        <div v-else class="hero__avatar hero__avatar--fallback" aria-hidden="true">
          {{ siteConfig.name[0] }}
        </div>
      </div>
    </section>

    <!-- ── About ───────────────────────────────────── -->
    <section class="about">
      <p v-for="line in siteConfig.about" :key="line" class="about__line">{{ line }}</p>

      <p class="about__line about__line--spaced">
        在 <RouterLink to="/blog" class="link">博客</RouterLink> 写文章，
        在 <RouterLink to="/projects" class="link">项目</RouterLink> 放开发的东西，
        在 <RouterLink to="/photos" class="link">照片</RouterLink> 记录拍过的画面。
      </p>

      <p class="about__line">
        如需联系，邮箱是 <a :href="`mailto:${siteConfig.email}`" class="link">{{ siteConfig.email }}</a>，
        要留言或查看其他人的留言 <RouterLink to="/guestbook" class="link">点这里</RouterLink>。
      </p>

      <div class="about__interests">
        <span v-for="item in siteConfig.interests" :key="item" class="tag">{{ item }}</span>
      </div>
    </section>

    <!-- ── Recent posts ────────────────────────────── -->
    <section>
      <h2 class="section-rule">
        <span class="section-rule__num">01</span>最近文章
      </h2>

      <div v-if="recentPosts.length">
        <PostCard
          v-for="post in recentPosts"
          :key="post.slug"
          :post="post"
          compact
        />
        <RouterLink v-if="allPosts.length > RECENT_LIMIT" to="/blog" class="text-btn view-all">
          全部文章
          <span class="view-all__count">{{ allPosts.length }}</span>
          <Icon name="arrowRight" :size="13" />
        </RouterLink>
      </div>

      <p v-else class="empty-hint">还没有文章，快去写一篇吧。</p>
    </section>

    <!-- ── Projects ────────────────────────────────── -->
    <section v-if="featuredProjects.length">
      <h2 class="section-rule">
        <span class="section-rule__num">02</span>项目
      </h2>

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
              <Icon name="external" :size="13" />
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
        <Icon name="arrowRight" :size="13" />
      </RouterLink>
    </section>
  </div>
</template>

<style scoped>
/* ── Hero ────────────────────────────────────────── */
.hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-8);
  padding-bottom: var(--space-10);
}

.hero__text {
  min-width: 0;
}

.hero__eyebrow {
  margin-bottom: var(--space-5);
}

.hero__name {
  font-family: var(--font-display);
  font-size: var(--size-display-xl);
  font-weight: var(--weight-medium);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--text-strong);
}

.hero__dot {
  color: var(--text-faint);
}

.hero__bio {
  margin-top: var(--space-5);
  font-family: var(--font-body);
  font-size: var(--size-body-lg);
  line-height: var(--leading-relaxed);
  color: var(--text-muted);
  max-width: 44ch;
}

.hero__avatar-wrap {
  flex-shrink: 0;
}

.hero__avatar {
  width: 96px;
  height: 96px;
  object-fit: cover;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
}

.hero__avatar--fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-sunken);
  font-family: var(--font-display);
  font-size: var(--size-display-md);
  color: var(--text-muted);
}

/* ── About ───────────────────────────────────────── */
.about {
  padding-bottom: var(--space-4);
  border-top: 1px solid var(--border-subtle);
  padding-top: var(--space-8);
}

.about__line {
  font-family: var(--font-body);
  font-size: var(--size-body-lg);
  line-height: var(--leading-relaxed);
  color: var(--text-body);
}

.about__line--spaced {
  margin-top: var(--space-5);
}

.about__interests {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-6);
}

/* ── View-all link ───────────────────────────────── */
.view-all {
  margin-top: var(--space-6);
}

.view-all__count {
  font-family: var(--font-mono);
  font-size: var(--size-caption);
  color: var(--text-faint);
  font-variant-numeric: tabular-nums;
}

/* ── Projects ────────────────────────────────────── */
.project-list {
  display: grid;
  gap: var(--space-3);
}

/* Hairline card, flat by default — elevation is a border, not a shadow */
.project-item {
  display: block;
  padding: var(--space-5);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  transition: var(--motion-hover);
}

.project-item:hover {
  background: var(--bg-sunken);
  border-color: var(--border-strong);
}

.project-item__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.project-item__name {
  font-family: var(--font-sans);
  font-size: var(--size-body-lg);
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-tight);
  color: var(--text-strong);
}

.project-item__links {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-faint);
}

.project-item__desc {
  font-family: var(--font-sans);
  font-size: var(--size-body-sm);
  color: var(--text-muted);
  line-height: var(--leading-normal);
  margin-bottom: var(--space-4);
}

.project-item__tech {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

/* ── Narrow screens ──────────────────────────────── */
@media (max-width: 560px) {
  .hero {
    flex-direction: column-reverse;
    align-items: flex-start;
    gap: var(--space-6);
  }

  .hero__avatar {
    width: 72px;
    height: 72px;
  }
}
</style>
