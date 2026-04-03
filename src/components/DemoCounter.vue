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
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-elevated);
  font-family: var(--font-ui);
  margin: var(--space-6) 0;
}

.demo-label {
  font-size: var(--text-xs);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.demo-controls {
  display: flex;
  align-items: center;
  gap: var(--space-5);
}

.demo-btn {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg);
  color: var(--text-primary);
  font-size: var(--text-lg);
  cursor: pointer;
  transition: border-color var(--transition), background var(--transition);
}

.demo-btn:hover {
  border-color: var(--accent-border);
  background: var(--bg-hover);
}

.demo-count {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-accent);
  min-width: 3ch;
  text-align: center;
}

.demo-reset {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  cursor: pointer;
  background: none;
  border: none;
  font-family: var(--font-ui);
  transition: color var(--transition);
}

.demo-reset:hover {
  color: var(--text-secondary);
}
</style>
