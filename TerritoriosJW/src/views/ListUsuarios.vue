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
      <h1>Usuarios</h1>
      <button type="button" class="btn btn-primary" @click="crear">Crear Usuario</button>
    </div>
    <div v-if="store.usuarios.length === 0" class="alert alert-info">
      No hay usuarios registrados.
    </div>
    <ul class="list-group">
      <li v-for="usuario in store.usuarios" :key="usuario.id" class="list-group-item">
        <div class="row">
          <div class="col-md-4">
            <span class="fw-bold">Nombre:</span> {{ usuario.nombre }}
          </div>
          <div class="col-md-4">
            <span class="fw-bold">Apellido:</span> {{ usuario.apellido }}
          </div>
          <div class="col-md-4">
            <span class="fw-bold">Rol:</span> {{ usuario.rol }}
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>