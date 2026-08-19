<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { siteConfig } from '@/config/site'
import Icon from '@/components/Icon.vue'

const route = useRoute()
const { theme, toggle } = useTheme()

const navLinks = [
  { to: '/', label: '首页' },
  { to: '/blog', label: '博客' },
  { to: '/projects', label: '项目' },
  { to: '/photos', label: '照片' },
  { to: '/guestbook', label: '留言板' },
]

// siteConfig is a build-time constant — no reason to recompute this
const social = [
  { href: `https://github.com/${siteConfig.github}`, icon: 'github', label: 'GitHub', external: true },
  { href: `https://x.com/${siteConfig.twitter}`, icon: 'x', label: 'X (Twitter)', external: true },
  { href: `mailto:${siteConfig.email}`, icon: 'mail', label: 'Email', external: false },
  { href: '/rss.xml', icon: 'rss', label: 'RSS 订阅', external: false },
] as const

function isActive(path: string) {
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
}

const isDark = computed(() => theme.value === 'dark')
</script>

<template>
  <header class="navbar">
    <div class="navbar__inner container">
      <RouterLink to="/" class="navbar__logo">
        {{ siteConfig.name }}
      </RouterLink>

      <nav class="navbar__nav" aria-label="主导航">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="navbar__link"
          :class="{ 'navbar__link--active': isActive(link.to) }"
          :aria-current="isActive(link.to) ? 'page' : undefined"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="navbar__actions">
        <a
          v-for="item in social"
          :key="item.label"
          :href="item.href"
          :target="item.external ? '_blank' : undefined"
          :rel="item.external ? 'noopener noreferrer' : undefined"
          class="navbar__icon-btn"
          :aria-label="item.label"
          :title="item.label"
        >
          <Icon :name="item.icon" :size="15" />
        </a>

        <button
          class="navbar__icon-btn"
          :aria-label="isDark ? '切换到亮色模式' : '切换到暗色模式'"
          @click="toggle"
        >
          <Icon :name="isDark ? 'sun' : 'moon'" :size="15" />
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
  /*
    Opaque, not a blurred translucent bar: backdrop-filter forces the browser to
    re-blur everything underneath the header on every scroll frame, which was the
    single biggest source of scroll stutter here.
  */
  background: var(--bg);
  border-bottom: 1px solid var(--border-subtle);
}

.navbar__inner {
  min-height: var(--nav-h);
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.navbar__logo {
  margin-right: auto;
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  white-space: nowrap;
  transition: color var(--transition);
}

.navbar__logo:hover {
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
  white-space: nowrap;
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
  color: var(--text-accent);
}

.navbar__actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
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

/*
  Narrow screens: wrap the links onto their own row instead of hiding them —
  the nav used to be display:none here, leaving the site unnavigable on phones.
*/
@media (max-width: 640px) {
  .navbar__inner {
    flex-wrap: wrap;
    padding-top: var(--space-2);
    padding-bottom: var(--space-2);
    gap: var(--space-2) var(--space-3);
  }

  .navbar__nav {
    order: 3;
    width: 100%;
    justify-content: space-between;
    gap: 0;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .navbar__nav::-webkit-scrollbar {
    display: none;
  }

  .navbar__link {
    padding: var(--space-1) var(--space-2);
  }
}
</style>
