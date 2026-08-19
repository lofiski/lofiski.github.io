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
    <h1 class="page-title">项目</h1>
    <p class="page-sub">我做过的一些东西。</p>


    <div v-if="projects.length" class="projects-grid">
      <article
        v-for="project in projects"
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
            <Icon name="external" :size="12" />
            访问
          </a>
          <a
            v-if="project.github"
            :href="`https://github.com/${project.github}`"
            target="_blank"
            rel="noopener noreferrer"
            class="project-link"
          >
            <Icon name="github" :size="12" />
            GitHub
          </a>
        </footer>
      </article>
    </div>

    <p v-else class="empty-hint">项目列表待更新，敬请期待。</p>
  </div>
</template>

<style scoped>
.page-title {
  margin-bottom: var(--space-2);
}

.page-sub {
  display: block;
  margin-bottom: var(--space-10);
}

.projects-grid {
  display: grid;
  gap: var(--space-4);
}

.project-card {
  display: flex;
  flex-direction: column;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: border-color var(--transition);
}

.project-card:hover {
  border-color: var(--accent-border);
}

.project-card__img-wrap {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--bg);
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
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.project-card__name {
  font-family: var(--font-ui);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
}

.project-card__desc {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.65;
  margin-bottom: var(--space-3);
}

.project-card__long-desc {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.65;
  margin-bottom: var(--space-3);
  opacity: 0.8;
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
}

.project-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  transition: color var(--transition), border-color var(--transition), background var(--transition);
}

.project-link:hover {
  color: var(--text-primary);
  border-color: var(--accent-border);
  background: var(--accent-subtle);
}

.project-link--primary {
  background: var(--accent-subtle);
  border-color: var(--accent-border);
  color: var(--text-accent);
}

.project-link--primary:hover {
  background: var(--bg-hover);
}

@media (min-width: 640px) {
  .projects-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
