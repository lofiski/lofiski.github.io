<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'
</script>

<template>
  <div id="app-shell">
    <NavBar />
    <!--
      No page transition: `mode="out-in"` held the old view for its full exit
      duration before mounting the new one, so every navigation cost an extra
      frame budget of dead time. Swapping instantly is what actually feels fast.
    -->
    <main id="main-content" class="main">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>

<style scoped>
.main {
  min-height: calc(100dvh - var(--nav-h) - 80px);
  padding-top: var(--space-16);
  padding-bottom: var(--space-24);
}
</style>
