<script setup lang="ts">
import { siteConfig } from '@/config/site'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="footer__inner container">
      <span class="footer__copy">© {{ year }} {{ siteConfig.name }}</span>
      <span class="footer__sep" aria-hidden="true">·</span>
      <a href="/rss.xml" class="footer__link">RSS</a>
      <span class="footer__sep" aria-hidden="true">·</span>
      <a
        :href="`https://github.com/${siteConfig.github}/lofiski.github.io`"
        target="_blank"
        rel="noopener noreferrer"
        class="footer__link"
      >Source</a>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--border-subtle);
  padding: var(--space-6) 0;
}

.footer__inner {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.footer__sep {
  color: var(--border);
}

.footer__link {
  color: var(--text-tertiary);
  transition: color var(--transition);
}

.footer__link:hover {
  color: var(--text-secondary);
}
</style>
