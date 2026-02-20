<script setup>
import { onMounted, ref, watch } from 'vue';
import { useTerritorioStore } from '../store/storeTerritorio';
import { useRouter } from 'vue-router';

const store = useTerritorioStore();
const router = useRouter();
onMounted(async () => {
    await store.fetchTerritorios();
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
</script>

<template>
    <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h1 class="mb-0">Territorios</h1>
            </div>
            <div>
                <button class="btn btn-primary" @click="createTerritorio">Crear Territorio</button>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6 col-lg-4 mb-3" v-for="territorio in store.territorios" :key="territorio.id">
                <div class="card shadow-sm h-100" @click="territorioView(territorio.id)" style="cursor: pointer">
                    <div class="card-body" >
                        <h5 class="card-title">Territorio: {{ territorio.nombre }}</h5>
                        <p class="card-text">
                            <span class="fw-bold">Estado: </span> 
                            <span :class="['badge ms-2', getBadgeClass(territorio.estado)]">
                              {{ store.getNombreEstado(territorio.estado) }}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
            <div v-if="store.territorios.length === 0">
                Cargando territorios...
            </div>
        </div>
    </div>
</template>
<style>
</style>    