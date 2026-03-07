<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const salidas = () => {
    router.push('/salidas');
};
const usuarios = () => {
    router.push('/usuarios');
};
const territorios = () => {
    router.push('/territorios');
};
</script>
<template>
  <nav class="navbar navbar-expand-lg navbar-dark shadow-sm py-3" style="background-color: #4d087a;">
    <div class="container">
      <a class="navbar-brand d-flex align-items-center fw-bold" href="#" @click.prevent="territorios">
        <i class="bi bi-geo-alt-fill me-2"></i>
        <span>Territorios JW Retiro</span>
      </a>

      <button 
        class="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <div class="navbar-nav ms-auto gap-2">
          <button 
            class="btn btn-outline-light border-0 px-3 fw-medium transition-all" 
            @click="territorios"
          >
            <i class="bi bi-map me-1"></i> Territorios
          </button>
          
          <button 
            class="btn btn-outline-light border-0 px-3 fw-medium transition-all" 
            @click="salidas"
          >
            <i class="bi bi-door-open me-1"></i> Salidas
          </button>
          
          <button 
            class="btn btn-outline-light border-0 px-3 fw-medium transition-all" 
            @click="usuarios"
          >
            <i class="bi bi-people me-1"></i> Conductores
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Efecto de elevación suave al pasar el mouse */
.transition-all {
  transition: all 0.3s ease;
}
.transition-all:hover {
  background-color: #4d087a;
  transform: translateY(-1px);
}
.navbar-brand:hover {
  opacity: 0.9;
}
</style>