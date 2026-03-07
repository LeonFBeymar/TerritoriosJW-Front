<script setup>
import { onMounted, ref } from 'vue';
import { useTerritorioStore } from '../store/storeTerritorio';
import { useRouter } from 'vue-router';
const store = useTerritorioStore();
const router = useRouter();
const territorio = ref(null);
const error = ref(null);
const form = ref({
    geoJson: '',
    estado: 1,
    prioridad: 1,
    ultimaSalida: '',
    area: null,
    atributo1: '',
});
onMounted(async () => {
  await store.fetchTerritorios();
  const territorioId = router.currentRoute.value.params.id;
  territorio.value = store.getTerritorioPorId(Number(territorioId));
  if (territorio.value) {
    form.value.geoJson = territorio.value.geoJson || '';
    form.value.estado = territorio.value.estado;
    form.value.prioridad = territorio.value.prioridad;
    form.value.ultimaSalida = territorio.value.ultimaSalida || '';
    form.value.area = territorio.value.area || null;
    form.value.atributo1 = territorio.value.atributo1 || '';
  } else {
    error.value = 'Territorio no encontrado';
  }
});
const actualizarTerritorio = async () => {
  await store.updateTerritorio(territorio.value.id, {
    geoJson: form.value.geoJson,
    area: form.value.area ? Number(form.value.area) : null,
    estado: form.value.estado,
    prioridad: form.value.prioridad,
    ultimaSalida: form.value.ultimaSalida,
    atributo1: form.value.atributo1,
  });

  router.push('/territorios');
};

</script>
<template>
    <div class="container py-4">
        <h1 class="mb-4 d-flex align-items-center">
            <span class="me-2"><i class="bi bi-pencil-square"></i></span>
            Actualizar Territorio <span v-if="territorio">: <strong>{{ store.territorioloading ? '...' : territorio.nombre }}</strong></span>
        </h1>
        <div v-if="store.territorioloading" class="alert alert-info">Cargando territorio...</div>
        <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
        <form v-else @submit.prevent="actualizarTerritorio" class="bg-white p-4 rounded shadow-sm">
            <div class="row g-3">
                <div class="col-md-6">
                    <label for="estado" class="form-label"><strong>Estado*</strong> <i class="bi bi-flag ms-1"></i></label>
                    <select id="estado" v-model.number="form.estado" class="form-select" required>
                        <option :value="1">En espera</option>
                        <option :value="2">Pendiente</option>
                        <option :value="3">Pendiente Incompleto</option>
                        <option :value="4">Incompleto</option>
                        <option :value="5">Completo</option>
                    </select>
                    <div class="form-text">Selecciona el estado actual del territorio.</div>
                </div>
                <div class="col-md-6">
                    <label for="prioridad" class="form-label"><strong>Prioridad*</strong> <i class="bi bi-exclamation-triangle ms-1"></i></label>
                    <select id="prioridad" v-model.number="form.prioridad" class="form-select" required>
                        <option :value="1">(Lu-Vi)</option>
                        <option :value="2">(Sa-Do)</option>
                        <option :value="3">(Lu-Vi-Mes)</option>
                        <option :value="4">(Sa-Do-Mes)</option>
                        <option :value="5">General (Pub-Car-Rev-Reu)</option>
                    </select>
                    <div class="form-text">Define la prioridad de visita para este territorio.</div>
                </div>
                <div class="col-md-6">
                    <label for="ultimaSalida" class="form-label"><strong>Última Salida*</strong> <i class="bi bi-calendar-event ms-1"></i></label>
                    <input type="date" id="ultimaSalida" v-model="form.ultimaSalida" class="form-control" required/>
                    <div class="form-text">Fecha de la última salida realizada.</div>
                </div>
                <div class="col-md-6">
                    <label for="atributo1" class="form-label"><strong>Notas adicionales</strong> <i class="bi bi-info-circle ms-1"></i></label>
                    <input type="text" id="atributo1" v-model="form.atributo1" class="form-control" />
                    <div class="form-text">Información adicional del territorio.</div>
                </div>
                <div class="col-md-6">
                    <label for="area" class="form-label"><strong>Área (m²)</strong> <i class="bi bi-rulers ms-1"></i></label>
                    <input type="number" id="area" v-model.number="form.area" class="form-control" min="0" />
                    <div class="form-text">Superficie aproximada del territorio.</div>
                </div>
                <div class="col-12">
                    <label for="geoJson" class="form-label"><strong>GeoJSON</strong> <i class="bi bi-geo-alt ms-1"></i></label>
                    <textarea id="geoJson" v-model="form.geoJson" class="form-control" rows="2" placeholder="Pegue aquí el GeoJSON del territorio"></textarea>
                    <div class="form-text">Puedes pegar aquí la geometría en formato GeoJSON.</div>
                </div>
            </div>
            <div class="mt-4 d-flex justify-content-end">
                <button type="submit" class="btn btn-primary px-4">
                    <i class="bi bi-save me-2"></i>{{store.territorioloadingSave ? 'Actualizando...' : 'Actualizar Cambios'}}
                </button>
                <button type="button" class="btn btn-secondary ms-2 px-4" @click="router.push('/territorios')">
                    <i class="bi bi-x-circle me-2"></i>Cancelar
                </button>
            </div>
        </form>
    </div>
</template>