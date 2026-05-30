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
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
      <h1 class="mb-0 d-flex align-items-center"><i class="bi bi-people me-2"></i>Conductores</h1>
      <button type="button" class="btn btn-primary" @click="crear">Crear Conductor</button>
    </div>

    <div class="usuarios-shell">
    <div v-if="store.usuarioLoading && !store.error" class="alert alert-info">
      Cargando conductores...
    </div>
    <div v-if="!store.usuarioLoading && store.usuarios.length === 0 && !store.error" class="alert alert-info">
      No hay conductores registrados.
    </div>
    <ul class="list-group list-group-flush border-top">
      <li v-for="conductor in store.usuarios" :key="conductor.id" class="list-group-item py-3 usuario-item">
        <div class="row align-items-center">
          <div class="col">
            <div class="text-uppercase small text-muted fw-semibold">Conductor</div>
            <div class="fw-bold">{{ conductor.nombre }} {{ conductor.apellido }}</div>
          </div>
          
        </div>
      </li>
    </ul>
    <div v-if="store.error" class="alert alert-danger">
      {{ store.error }}
    </div>
    </div>
  </div>
</template>
<style scoped>
.usuarios-shell {
  background: linear-gradient(180deg, #ffffff 0%, #faf8ff 100%);
  border: 1px solid #eadff7;
  border-radius: 14px;
  padding: 0.75rem;
  box-shadow: 0 0.35rem 0.8rem rgba(51, 21, 84, 0.08);
}

.usuario-item {
  border-radius: 10px;
}

@media (min-width: 768px) {
  .usuarios-shell {
    padding: 1rem;
  }
}
</style>