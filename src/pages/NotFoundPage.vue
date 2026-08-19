<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="container not-found">
    <div class="not-found__num" aria-hidden="true">404</div>
    <h1 class="not-found__title">页面不存在</h1>
    <p class="not-found__desc">
      你访问的路径不在这里。<br>
      可能是链接失效，或者从未存在过。
    </p>
    <div class="not-found__actions">
      <button class="text-btn" @click="router.push('/')">← 返回首页</button>
      <button class="text-btn not-found__btn--secondary" @click="router.back()">↩ 上一页</button>
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
}

.not-found__num {
  font-family: var(--font-ui);
  font-size: clamp(6rem, 20vw, 12rem);
  font-weight: 600;
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 1px var(--border);
  letter-spacing: -0.05em;
  margin-bottom: var(--space-8);
  user-select: none;
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

.not-found__btn--secondary {
  opacity: 0.6;
}

.not-found__btn--secondary:hover {
  opacity: 1;
}
</style>
