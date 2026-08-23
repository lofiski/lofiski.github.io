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
    <div class="navbar__inner container container--wide">
      <!--
        No supplied logo, and needle's rule is that the wordmark IS the mark:
        the name set in the display face, lowercase, with a trailing period.
      -->
      <RouterLink to="/" class="navbar__wordmark">
        {{ siteConfig.name }}<span class="navbar__dot" aria-hidden="true">.</span>
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
          <Icon :name="item.icon" :size="16" />
        </a>

        <button
          class="navbar__icon-btn"
          :aria-label="isDark ? '切换到纸色模式' : '切换到墨色模式'"
          @click="toggle"
        >
          <Icon :name="isDark ? 'sun' : 'moon'" :size="16" />
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
    needle specifies rgba(paper, 0.82) + backdrop-filter for sticky chrome, but
    that is the one rule this site can't take: backdrop-filter forces a re-blur
    of everything under the header on every scroll frame, and it was the single
    biggest source of scroll stutter here. Opaque paper, hairline below.
  */
  background: var(--bg-app);
  border-bottom: 1px solid var(--border-subtle);
}

.navbar__inner {
  min-height: var(--nav-h);
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.navbar__wordmark {
  margin-right: auto;
  font-family: var(--font-display);
  font-size: var(--size-h3);
  font-weight: var(--weight-medium);
  line-height: 1;
  letter-spacing: var(--tracking-tight);
  color: var(--text-strong);
  white-space: nowrap;
  transition: opacity var(--dur-fast) var(--ease-standard);
}

.navbar__wordmark:hover {
  opacity: 0.7;
}

/* The trailing period is part of the mark, but it shouldn't shout */
.navbar__dot {
  color: var(--text-faint);
}

.navbar__nav {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.navbar__link {
  position: relative;
  font-family: var(--font-sans);
  font-size: var(--size-body-sm);
  letter-spacing: var(--tracking-wide);
  white-space: nowrap;
  padding: var(--space-2) var(--space-3);
  color: var(--text-muted);
  border-radius: var(--radius-md);
  transition: var(--motion-hover);
}

.navbar__link:hover {
  color: var(--text-strong);
  background: var(--bg-sunken);
}

/* Active is ink plus a hairline underline — no accent hue exists in needle */
.navbar__link--active {
  color: var(--text-strong);
}

.navbar__link--active::after {
  content: "";
  position: absolute;
  left: var(--space-3);
  right: var(--space-3);
  bottom: 2px;
  height: 1px;
  background: var(--ink);
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
  border-radius: var(--radius-md);
  color: var(--text-muted);
  transition: var(--motion-hover);
}

.navbar__icon-btn:hover {
  color: var(--text-strong);
  background: var(--bg-sunken);
}

/*
  Narrow screens: wrap the links onto their own row instead of hiding them —
  the nav used to be display:none here, leaving the site unnavigable on phones.
*/
@media (max-width: 720px) {
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

  .navbar__link--active::after {
    left: var(--space-2);
    right: var(--space-2);
    bottom: 0;
  }
}
</style>
