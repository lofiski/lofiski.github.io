<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="container not-found">
    <!-- Scale contrast is a core device: a huge display numeral over small mono copy -->
    <div class="not-found__num" aria-hidden="true">404</div>
    <p class="eyebrow">page not found</p>
    <h1 class="not-found__title">页面不存在</h1>
    <p class="not-found__desc">
      你访问的路径不在这里。<br>
      可能是链接失效，或者从未存在过。
    </p>
    <div class="not-found__actions">
      <button class="btn" @click="router.push('/')">返回首页</button>
      <button class="btn btn--secondary" @click="router.back()">上一页</button>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-top: var(--space-16);
  padding-bottom: var(--space-24);
}

.not-found__num {
  font-family: var(--font-display);
  font-size: clamp(6rem, 22vw, 14rem);
  font-weight: var(--weight-medium);
  line-height: 0.9;
  letter-spacing: var(--tracking-tight);
  color: var(--sand-deep);
  font-variant-numeric: lining-nums;
  margin-bottom: var(--space-10);
  user-select: none;
}

.not-found__title {
  font-family: var(--font-display);
  font-size: var(--size-h1);
  font-weight: var(--weight-medium);
  color: var(--text-strong);
  letter-spacing: var(--tracking-tight);
  margin-top: var(--space-4);
  margin-bottom: var(--space-4);
}

.not-found__desc {
  font-family: var(--font-body);
  font-size: var(--size-body-lg);
  color: var(--text-muted);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-8);
}

.not-found__actions {
  display: flex;
  gap: var(--space-3);
  align-items: center;
}
</style>
