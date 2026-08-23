<script setup lang="ts">
import { projects } from '@/data/projects'
import type { Project } from '@/data/projects'
import Icon from '@/components/Icon.vue'

function projectUrl(project: Project) {
  return project.url ?? (project.github ? `https://github.com/${project.github}` : null)
}
</script>

<template>
  <div class="container">
    <header class="page-header">
      <p class="eyebrow">projects</p>
      <h1 class="page-title">项目</h1>
      <span class="page-sub">{{ projects.length }} 个 · 我做过的一些东西</span>
    </header>

    <div v-if="projects.length" class="projects-grid">
      <article
        v-for="(project, index) in projects"
        :key="project.name"
        class="project-card"
      >
        <!-- Image -->
        <div v-if="project.image" class="project-card__img-wrap">
          <img
            :src="project.image"
            :alt="project.name"
            class="project-card__img"
            loading="lazy"
          />
        </div>

        <!-- Body -->
        <div class="project-card__body">
          <div class="project-card__header">
            <!-- A display numeral indexes the card — the system's scale-contrast device -->
            <span class="project-card__index" aria-hidden="true">
              {{ String(index + 1).padStart(2, '0') }}
            </span>
            <h2 class="project-card__name">{{ project.name }}</h2>
            <span v-if="project.wip" class="tag">WIP</span>
          </div>

          <p class="project-card__desc">{{ project.description }}</p>

          <p v-if="project.longDescription" class="project-card__long-desc">
            {{ project.longDescription }}
          </p>

          <div class="project-card__tech">
            <span v-for="t in project.tech" :key="t" class="tag">{{ t }}</span>
          </div>
        </div>

        <!-- Links -->
        <footer class="project-card__footer">
          <a
            v-if="projectUrl(project)"
            :href="projectUrl(project)!"
            target="_blank"
            rel="noopener noreferrer"
            class="project-link project-link--primary"
          >
            访问
            <Icon name="external" :size="13" />
          </a>
          <a
            v-if="project.github"
            :href="`https://github.com/${project.github}`"
            target="_blank"
            rel="noopener noreferrer"
            class="project-link"
          >
            <Icon name="github" :size="13" />
            GitHub
          </a>
        </footer>
      </article>
    </div>

    <p v-else class="empty-hint">项目列表待更新，敬请期待。</p>
  </div>
</template>

<style scoped>
.projects-grid {
  display: grid;
  gap: var(--space-4);
}

/* Hairline card, flat by default. Elevation is a border first, shadow second. */
.project-card {
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: border-color var(--dur-fast) var(--ease-standard);
}

.project-card:hover {
  border-color: var(--border-strong);
}

.project-card__img-wrap {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--bg-sunken);
  border-bottom: 1px solid var(--border-subtle);
}

.project-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-card__body {
  padding: var(--space-5);
  flex: 1;
}

.project-card__header {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.project-card__index {
  font-family: var(--font-display);
  font-size: var(--size-body-lg);
  color: var(--text-faint);
  font-variant-numeric: lining-nums;
  flex-shrink: 0;
}

.project-card__name {
  font-family: var(--font-sans);
  font-size: var(--size-h3);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-tight);
  color: var(--text-strong);
  margin-right: auto;
}

.project-card__desc {
  font-family: var(--font-sans);
  font-size: var(--size-body);
  color: var(--text-body);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-3);
}

.project-card__long-desc {
  font-family: var(--font-sans);
  font-size: var(--size-body-sm);
  color: var(--text-muted);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-4);
}

.project-card__tech {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.project-card__footer {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-app);
}

.project-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: 32px;
  padding: 0 var(--space-4);
  font-family: var(--font-sans);
  font-size: var(--size-body-sm);
  font-weight: var(--weight-medium);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  color: var(--text-strong);
  transition: var(--motion-hover);
}

.project-link:hover {
  background: var(--bg-sunken);
  border-color: var(--stone);
}

/* Primary is an ink fill — the only "accent" the system has */
.project-link--primary {
  background: var(--action-primary-bg);
  border-color: var(--action-primary-bg);
  color: var(--action-primary-fg);
}

.project-link--primary:hover {
  background: var(--action-primary-hover);
  border-color: var(--action-primary-hover);
  color: var(--action-primary-fg);
}

@media (min-width: 640px) {
  .projects-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
