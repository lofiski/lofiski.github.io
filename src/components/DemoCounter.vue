<script setup lang="ts">
import { shallowRef } from 'vue'

const count = shallowRef(0)
</script>

<template>
  <div class="demo-counter">
    <span class="demo-label">计数器 Demo</span>
    <div class="demo-controls">
      <button class="demo-btn" @click="count--">−</button>
      <span class="demo-count">{{ count }}</span>
      <button class="demo-btn" @click="count++">+</button>
    </div>
    <button class="demo-reset" @click="count = 0">重置</button>
  </div>
</template>

<style scoped>
.demo-counter {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-8);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  font-family: var(--font-sans);
  margin: var(--space-8) 0;
}

.demo-label {
  font-family: var(--font-sans);
  font-size: var(--size-caption);
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
  color: var(--text-faint);
}

.demo-controls {
  display: flex;
  align-items: center;
  gap: var(--space-5);
}

.demo-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-strong);
  font-size: var(--size-body-lg);
  transition: var(--motion-hover);
}

.demo-btn:hover {
  border-color: var(--stone);
  background: var(--bg-sunken);
}

/* The count is a number, so it takes the display face at a contrasting size */
.demo-count {
  font-family: var(--font-display);
  font-size: var(--size-h1);
  font-weight: var(--weight-medium);
  color: var(--text-strong);
  font-variant-numeric: tabular-nums lining-nums;
  min-width: 3ch;
  text-align: center;
  line-height: 1;
}

.demo-reset {
  font-family: var(--font-sans);
  font-size: var(--size-body-sm);
  color: var(--text-muted);
  transition: color var(--dur-fast) var(--ease-standard);
}

.demo-reset:hover {
  color: var(--text-strong);
}
</style>
