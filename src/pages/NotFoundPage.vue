<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="container not-found">
    <p class="not-found__code">404</p>
    <p class="not-found__msg">页面不存在。</p>
    <button class="not-found__btn" @click="router.push('/')">← 返回首页</button>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-top: var(--space-16);
}

.not-found__code {
  font-family: var(--font-ui);
  font-size: 5rem;
  font-weight: 600;
  color: var(--text-tertiary);
  letter-spacing: -0.04em;
  line-height: 1;
  margin-bottom: var(--space-4);
}

.not-found__msg {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
}

.not-found__btn {
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: color var(--transition);
}

.not-found__btn:hover {
  color: var(--text-accent);
}
</style>
