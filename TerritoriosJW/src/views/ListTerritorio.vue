<script setup>
import { onMounted, ref, watch } from 'vue';
import { useTerritorioStore } from '../store/storeTerritorio';
import { useRouter } from 'vue-router';

const store = useTerritorioStore();
const router = useRouter();
const error = ref(null);
onMounted(async () => {
    await store.fetchTerritorios();
    error.value = store.error;
    console.log('Territorios:', store.territorios);
});

const getBadgeClass = (estado) => {
  const colors = {
    1: 'bg-secondary', // En espera
    2: 'bg-warning text-dark', // Pendiente
    3: 'bg-info text-dark', // Pendiente Incompleto
    4: 'bg-danger', // Incompleto
    5: 'bg-success', // Completo
  };
  return colors[estado] || 'bg-light text-dark';
};

const createTerritorio = () => router.push("/crearterritorio");
const territorioView = (id) => router.push(`/territorio/${id}`);
const editar = (id) => {
  // Lógica para editar el territorio
  router.push(`/update-terrirorio/${id}`);
};
</script>

<template>
    <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="mb-0 d-flex align-items-center">
                <i class="bi bi-map me-2"></i>Territorios
            </h1>
            <button class="btn btn-primary d-flex align-items-center" @click="createTerritorio">
                <i class="bi bi-plus-circle me-2"></i>Crear Territorio
            </button>
        </div>
        <div class="row g-4">
            <div v-if="store.territorioloading && !error" class="alert alert-info mt-4">
                <i class="bi bi-info-circle me-2"></i>Cargando territorios...
            </div>
            <div v-else-if="!store.territorioloading && store.territorios.length === 0 && !error" class="alert alert-info mt-4">
                <i class="bi bi-info-circle me-2"></i>No hay territorios registrados.
            </div>
            <div v-else-if="error" class="alert alert-danger mt-4">
                <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
            </div>
            <div v-else class="col-md-6 col-lg-4" v-for="territorio in store.territorios" :key="territorio.id">
                <div class="card h-100 shadow-sm border-1">
                    <div class="card-body d-flex flex-column justify-content-between">
                        <div class="mb-2" @click="territorioView(territorio.id)" style="cursor:pointer">
                            <h5 class="card-title mb-1 d-flex align-items-center">
                                <i class="bi bi-geo-alt me-2 text-primary"></i>
                                {{ territorio.nombre }}
                            </h5>
                            <div class="mb-2">
                                <span class="fw-bold">Estado: </span>
                                <span :class="['badge', getBadgeClass(territorio.estado)]">
                                    {{ store.getNombreEstado(territorio.estado) }}
                                </span>
                            </div>
                        </div>
                        <div class="d-flex justify-content-end gap-2 mt-auto">
                            <button class="btn btn-outline-primary btn-sm d-flex align-items-center" @click.stop="editar(territorio.id)">
                                <i class="bi bi-pencil-square me-1"></i>Editar
                            </button>
                            <button class="btn btn-outline-secondary btn-sm d-flex align-items-center" @click.stop="territorioView(territorio.id)">
                                <i class="bi bi-eye me-1"></i>Ver
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style>
</style>    