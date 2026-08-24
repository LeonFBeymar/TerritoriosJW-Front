<script setup>
import footerJw from './components/footer-jw.vue';
import headerJw from './components/header-jw.vue';
import notificacionesJw from './components/notificaciones-jw.vue';
</script>

<template>
  <notificaciones-jw />
  <header-jw />
  <div class="main-content">
    <router-view />
  </div>
  <footer-jw />
</template>

<style scoped>

</style>
