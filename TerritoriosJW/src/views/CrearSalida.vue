<script setup>
import { ref, onMounted } from 'vue';
import { useUsuarioStore } from '../store/storeUsuarios';
import { useTerritorioStore } from '../store/storeTerritorio';
import { useSalidaStore } from '../store/storeSalidas';
import { useRouter } from 'vue-router';

const usuarioStore = useUsuarioStore();
const territorioStore = useTerritorioStore();
const salidaStore = useSalidaStore();
const router = useRouter();

const form = ref({
  usuarioId: '',
  territorioId: '',
  salidaSemanalId: '',
  puntoEncuentro: '',
  horaSalida: '',
  observaciones: ''
});

onMounted(async () => {
  await usuarioStore.fetchUsuarios();
  await territorioStore.fetchTerritorios();
  await salidaStore.fetchSalidasSemanal();
});

const crearSalida = async () => {
  await salidaStore.createSalida({
    usuarioId: form.value.usuarioId,
    territorioId: form.value.territorioId,
    salidaSemanalId: form.value.salidaSemanalId,
    puntoEncuentro: form.value.puntoEncuentro,
    horaSalida: form.value.horaSalida,
    observaciones: form.value.observaciones
  });

  await territorioStore.updateTerritorio(form.value.territorioId, {
    estado: 2, // Cambiar estado a "Pendiente" al crear una salida
    ultimaSalida: form.value.horaSalida.split('T')[0] // Actualizar última salida
  });

  form.value = { usuarioId: '', territorioId: '', salidaSemanalId: '', puntoEncuentro: '', horaSalida: '', observaciones: '' };
  router.push('/salidas');
};

const volver = () => {
  router.push('/salidas');
};
</script>

<template>
  <div class="container py-4">
    <h1 class="mb-4">Crear Salida</h1>
    <form @submit.prevent="crearSalida" class="row g-3">
      <div class="col-md-6">
        <label class="form-label"> <strong>Conductor</strong></label>
        <select v-model="form.usuarioId" class="form-select" required>
          <option value="" disabled>Seleccione el conductor</option>
          <option v-for="usuario in usuarioStore.usuarios" :key="usuario.id" :value="usuario.id">
            {{ usuario.nombre }} {{ usuario.apellido }}
          </option>
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label"> <strong>Territorio</strong></label>
        <select v-model="form.territorioId" class="form-select" required>
          <option value="" disabled>Seleccione un territorio</option>
          <option v-for="territorio in territorioStore.getTerritoriosDisponibles()" :key="territorio.id" :value="territorio.id">
            {{ territorio.nombre }}
          </option>
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label"> <strong>Semana de Salida</strong></label>
        <select v-model="form.salidaSemanalId" class="form-select" required>
          <option value="" disabled>Seleccione una semana</option>
          <option v-for="semana in salidaStore.salidasSemanales" :key="semana.id" :value="semana.id">
            {{ semana.semanaInicio }}
          </option>
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label"> <strong>Punto de Encuentro</strong></label>
        <input v-model="form.puntoEncuentro" type="text" class="form-control" required />
      </div>
      <div class="col-md-6">
        <label class="form-label"> <strong>Hora de Salida</strong></label>
        <input v-model="form.horaSalida" type="datetime-local" class="form-control" required />
      </div>
      <div class="col-12">
        <label class="form-label"> <strong>Observaciones</strong></label>
        <textarea v-model="form.observaciones" class="form-control" rows="2"></textarea>
      </div>
      <div class="col-12 d-flex justify-content-end gap-2">
        <button type="button" class="btn btn-secondary" @click="volver">Volver</button>
        <button type="submit" class="btn btn-primary">Crear Salida</button>
      </div>
    </form>
  </div>
</template>