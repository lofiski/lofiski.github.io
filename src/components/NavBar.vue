<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { siteConfig } from '@/config/site'

const route = useRoute()
const themeStore = useThemeStore()

const navLinks = [
  { to: '/', label: '首页' },
  { to: '/blog', label: '博客' },
  { to: '/projects', label: '项目' },
  { to: '/photos', label: '照片' },
  { to: '/guestbook', label: '留言板' },
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const isDark = computed(() => themeStore.theme === 'dark')
</script>

<template>
  <header class="navbar">
    <div class="navbar__inner container">
      <!-- Logo -->
      <RouterLink to="/" class="navbar__logo" aria-label="首页">
        <span class="navbar__logo-name">{{ siteConfig.name }}</span>
      </RouterLink>

      <!-- Nav Links -->
      <nav class="navbar__nav" aria-label="主导航">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="navbar__link"
          :class="{ 'navbar__link--active': isActive(link.to) }"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <!-- Right: Contact + Theme -->
      <div class="navbar__actions">
        <!-- Contact Icons -->
        <a
          :href="`https://github.com/${siteConfig.github}`"
          target="_blank"
          rel="noopener noreferrer"
          class="navbar__icon-btn"
          aria-label="GitHub"
          title="GitHub"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
          </svg>
        </a>

        <a
          :href="`https://x.com/${siteConfig.twitter}`"
          target="_blank"
          rel="noopener noreferrer"
          class="navbar__icon-btn"
          aria-label="X (Twitter)"
          title="X"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.258 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>

        <a
          :href="`mailto:${siteConfig.email}`"
          class="navbar__icon-btn"
          aria-label="Email"
          title="Email"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
        </a>

        <a
          href="/rss.xml"
          class="navbar__icon-btn"
          aria-label="RSS 订阅"
          title="RSS"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/>
          </svg>
        </a>

        <!-- Theme Toggle -->
        <button
          class="navbar__icon-btn navbar__theme-btn"
          :aria-label="isDark ? '切换到亮色模式' : '切换到暗色模式'"
          :title="isDark ? '切换到亮色' : '切换到暗色'"
          @click="themeStore.toggle()"
        >
          <!-- Sun -->
          <svg v-if="isDark" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
          </svg>
          <!-- Moon -->
          <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--nav-h);
  background: var(--bg);
  border-bottom: 1px solid var(--border-subtle);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.navbar__inner {
  height: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.navbar__logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-right: auto;
}

.navbar__logo-name {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  transition: color var(--transition);
}

.navbar__logo:hover .navbar__logo-name {
  color: var(--text-accent);
}

.navbar__nav {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.navbar__link {
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  letter-spacing: 0.05em;
  padding: var(--space-1) var(--space-3);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  transition: color var(--transition), background var(--transition);
}

.navbar__link:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.navbar__link--active {
  color: var(--text-accent) !important;
}

.navbar__actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-left: var(--space-2);
}

.navbar__icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  color: var(--text-tertiary);
  transition: color var(--transition), background var(--transition);
}

.navbar__icon-btn:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

@media (max-width: 600px) {
  .navbar__nav {
    display: none;
  }
}
</style>
