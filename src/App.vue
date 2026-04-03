<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'

// Initialize theme store (applies theme to <html>)
useThemeStore()
</script>

<template>
  <div id="app-shell">
    <NavBar />
    <main id="main-content" class="main">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <Footer />
  </div>
</template>

<style scoped>
.main {
  min-height: calc(100dvh - var(--nav-h) - 80px);
  padding-top: var(--space-12);
  padding-bottom: var(--space-20);
}

.page-enter-active,
.page-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
