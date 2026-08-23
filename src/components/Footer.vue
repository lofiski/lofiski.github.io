<script setup lang="ts">
import { siteConfig } from '@/config/site'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="footer__inner container container--wide">
      <!-- Brand voice is lowercase and spare; the year is a number, so it's mono -->
      <span class="footer__mark">{{ siteConfig.name }}<span class="footer__dot" aria-hidden="true">.</span></span>
      <span class="footer__year">© {{ year }}</span>

      <nav class="footer__links" aria-label="页脚链接">
        <a href="/rss.xml" class="footer__link">RSS</a>
        <a
          :href="`https://github.com/${siteConfig.repo}`"
          target="_blank"
          rel="noopener noreferrer"
          class="footer__link"
        >Source</a>
      </nav>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--border-subtle);
  padding: var(--space-8) 0;
}

.footer__inner {
  display: flex;
  align-items: baseline;
  gap: var(--space-4);
}

.footer__mark {
  font-family: var(--font-display);
  font-size: var(--size-body-lg);
  color: var(--text-strong);
  letter-spacing: var(--tracking-tight);
}

.footer__dot {
  color: var(--text-faint);
}

.footer__year {
  font-family: var(--font-mono);
  font-size: var(--size-caption);
  color: var(--text-faint);
  font-variant-numeric: tabular-nums;
}

.footer__links {
  margin-left: auto;
  display: flex;
  gap: var(--space-5);
}

.footer__link {
  font-family: var(--font-sans);
  font-size: var(--size-caption);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
  color: var(--text-muted);
  transition: color var(--dur-fast) var(--ease-standard);
}

.footer__link:hover {
  color: var(--text-strong);
}
</style>
