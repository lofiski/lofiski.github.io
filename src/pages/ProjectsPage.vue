<script setup lang="ts">
import { projects } from '@/data/projects'
import type { Project } from '@/data/projects'

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
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>
            </svg>
            访问
          </a>
          <a
            v-if="project.github"
            :href="`https://github.com/${project.github}`"
            target="_blank"
            rel="noopener noreferrer"
            class="project-link"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
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
  font-family: var(--font-ui);
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  margin-bottom: var(--space-2);
}

.page-sub {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  font-family: var(--font-ui);
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
  transition: transform var(--transition-slow);
}

.project-card:hover .project-card__img {
  transform: scale(1.02);
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

.empty-hint {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  padding: var(--space-16) 0;
  text-align: center;
}

@media (min-width: 640px) {
  .projects-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
