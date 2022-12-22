<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import Index from '../README.md'
</script>

<template>
  <Index />
  <div class="mt-3 text-center">
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo vite" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
    <a href="https://counter.dev/" target="_blank">
      <img src="/counter_alt.svg" class="logo counter" alt="Counter Analytics logo" />
    </a>
    <h1>Vite + Vue + Counter Analytics</h1>

    <p class="read-the-docs">Click on the Vite, Vue and Counter Analytics logos to learn more</p>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}

.logo.vite:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.logo.counter:hover {
  filter: drop-shadow(0 0 2em #147efbaa);
}

.read-the-docs {
  color: #888;
}
</style>
