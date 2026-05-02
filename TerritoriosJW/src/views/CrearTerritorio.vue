<script setup>
import { ref } from 'vue';
import { useTerritorioStore } from '../store/storeTerritorio';
import { useRouter } from 'vue-router';
const store = useTerritorioStore();
const router = useRouter();
const form = ref({
  nombre: '',
  geoJson: '',
  area: null,
  estado: 1,
  prioridad: 1,
  ultimaSalida: '',
  atributo1: '',
  tema: '',
});

const estados = [
  { value: 1, label: 'En espera' },
  { value: 2, label: 'Pendiente' },
  { value: 3, label: 'Pendiente Incompleto' },
  { value: 4, label: 'Incompleto' },
  { value: 5, label: 'Completo' }
];

const prioridades = {
                1: '(Lu-Vi)',
                2: '(Sa-Do)',
                3: '(Lu-Vi-Mes)',
                4: '(Sa-Do-Mes)',
                5: 'General (Pub-Car-Rev-Reu)',
            };

const temas = {
  1: 'Predicación',
  2: 'Invitación a Reunión',
  3: 'Invitación a  Asamblea',
  4: 'Invitación a Conmemoración',
  5: 'Nuevo Tratado',
  6: 'Conseguir Estudios',
  7: 'Otro Servicio',
}
const crearTerritorio = async () => {
  await store.createTerritorio({
    Nombre: form.value.nombre,
    GeoJson: form.value.geoJson || null,
    Area: form.value.area ? Number(form.value.area) : null,
    Estado: Number(form.value.estado),
    Prioridad: Number(form.value.prioridad),
    UltimaSalida: form.value.ultimaSalida || null,
    Atributo1: form.value.atributo1 || null,
    Tema: form.value.tema || null,
  });
  // Limpiar formulario o redirigir según necesidad
  form.value = { nombre: '', geoJson: '', area: null, estado: 1, prioridad: 1, ultimaSalida: '', atributo1: '', tema: '' };
  volver();
};

const volver = () => {
  router.push("/territorios");
};
</script>

<template>
  <div class="container py-4">
    <h1 class="mb-4">Crear Territorio</h1>
    <form @submit.prevent="crearTerritorio" class="row g-3">
      <div class="col-md-6">
        <label class="form-label"><strong>Nombre *</strong></label>
        <input v-model="form.nombre" type="text" class="form-control" required />
      </div>
      <div class="col-md-6">
        <label class="form-label"><strong>Estado *</strong></label>
        <select v-model="form.estado" class="form-select" required>
          <option v-for="e in estados" :key="e.value" :value="e.value">{{ e.label }}</option>
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label"><strong>Prioridad *</strong></label>
        <select v-model="form.prioridad" class="form-select" required>
          <option v-for="(label, value) in prioridades" :key="value" :value="value">{{ label }}</option>
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label"><strong>Última Salida *</strong></label>
        <input v-model="form.ultimaSalida" type="date" class="form-control" required/>
      </div>
      <div class="col-md-6">
        <label class="form-label"><strong>Campaña *</strong></label>
        <select v-model="form.tema" class="form-select" required>
          <option v-for="(label, value) in temas" :key="value" :value="value">{{ label }}</option>
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label"><strong>Notas adicionales (Opcional)</strong></label>
        <input v-model="form.atributo1" type="text" class="form-control" />
      </div>
      <div class="col-md-6">
        <label class="form-label"><strong>Área m² (Opcional)</strong></label>
        <input v-model="form.area" type="number" class="form-control" min="0" />
      </div>
      <div class="col-12">
        <label class="form-label"><strong>GeoJson (Opcional)</strong></label>
        <textarea v-model="form.geoJson" class="form-control" rows="2" placeholder="Pegue aquí el GeoJson si lo tiene..."></textarea>
      </div>
      <div class="col-12 d-flex justify-content-end gap-2">
         <button type="button" class="btn btn-secondary" @click="volver()">Volver</button>
        <button type="submit" class="btn btn-primary">{{ store.territorioloadingSave ? 'Creando...' : 'Crear Territorio' }}</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
</style>
