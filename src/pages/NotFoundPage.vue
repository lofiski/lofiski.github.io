<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="container not-found">
    <div class="not-found__glitch" aria-hidden="true">404</div>
    <h1 class="not-found__title">页面不存在</h1>
    <p class="not-found__desc">
      你访问的路径不在这里。<br>
      可能是链接失效，或者从未存在过。
    </p>
    <div class="not-found__actions">
      <button class="not-found__btn" @click="router.push('/')">← 返回首页</button>
      <button class="not-found__btn not-found__btn--secondary" @click="router.back()">↩ 上一页</button>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-top: var(--space-20);
  padding-bottom: var(--space-20);
  position: relative;
}

.not-found__glitch {
  font-family: var(--font-ui);
  font-size: clamp(6rem, 20vw, 12rem);
  font-weight: 600;
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 1px var(--border);
  letter-spacing: -0.05em;
  margin-bottom: var(--space-8);
  position: relative;
  user-select: none;
}

.not-found__glitch::before {
  content: '404';
  position: absolute;
  inset: 0;
  color: var(--text-accent);
  opacity: 0.08;
  transform: translate(-2px, 2px);
}

.not-found__title {
  font-family: var(--font-ui);
  font-size: var(--text-lg);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--space-4);
  letter-spacing: -0.01em;
}

.not-found__desc {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: var(--space-8);
}

.not-found__actions {
  display: flex;
  gap: var(--space-4);
  align-items: center;
}

.not-found__btn {
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: color var(--transition);
  padding: var(--space-2) 0;
}

.not-found__btn:hover {
  color: var(--text-accent);
}

.not-found__btn--secondary {
  color: var(--text-tertiary);
  opacity: 0.6;
}

.not-found__btn--secondary:hover {
  color: var(--text-secondary);
  opacity: 1;
}
</style>
