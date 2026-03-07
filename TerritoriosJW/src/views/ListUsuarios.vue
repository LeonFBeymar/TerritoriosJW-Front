<script setup>
import { onMounted, ref } from 'vue';
import { useUsuarioStore } from '../store/storeUsuarios';
import { useRouter } from 'vue-router';
const store = useUsuarioStore();
const router = useRouter();
const crear = () => {
    router.push('/crear-usuario');
};
onMounted(async () => {
    await store.fetchUsuarios();
    console.log('Usuarios:', store.usuarios);
});

</script>
<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Conductores</h1>
      <button type="button" class="btn btn-primary" @click="crear">Crear Conductor</button>
    </div>
    <div v-if="store.usuarioLoading && !store.error" class="alert alert-info">
      Cargando conductores...
    </div>
    <div v-if="!store.usuarioLoading && store.usuarios.length === 0 && !store.error" class="alert alert-info">
      No hay conductores registrados.
    </div>
    <ul class="list-group list-group-flush border-top">
      <li v-for="conductor in store.usuarios" :key="conductor.id" class="list-group-item py-3">
        <div class="row align-items-center">
          <div class="col">
            <div class="fw-bold">Nombre: {{ conductor.nombre }} {{ conductor.apellido }}</div>
          </div>
          
        </div>
      </li>
    </ul>
    <div v-if="store.error" class="alert alert-danger">
      {{ store.error }}
    </div>
  </div>
</template>