<script setup>
import { onMounted, ref, watch } from 'vue';
import { useTerritorioStore } from '../store/storeTerritorio';
import { useRouter } from 'vue-router';

const store = useTerritorioStore();
const router = useRouter();
const error = ref(null);
const showEstadosInfo = ref(false);
const showCampañaInfo = ref(false);

onMounted(async () => {
    await store.fetchTerritorios();
    error.value = store.error;
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
                <i class="bi bi-map"></i>Territorios
            </h1>
            <button class="btn btn-primary d-flex align-items-center" @click="createTerritorio">
                <i class="bi bi-plus-circle me-2"></i>Crear Territorio
            </button>
        </div>
        <div>
            <button class="btn btn-info mb-3 me-3" @click="showEstadosInfo = !showEstadosInfo">
                <strong>  
                    {{ showEstadosInfo ? 'Ocultar' : 'Ver' }} info de Estados ℹ️
                </strong> 
            </button>
            <button class="btn btn-info mb-3" @click="showCampañaInfo = !showCampañaInfo">
                <strong>  
                    {{ showCampañaInfo ? 'Ocultar' : 'Ver' }} info de Campaña ℹ️
                </strong> 
            </button>
            <div v-if="showEstadosInfo" class="alert alert-info">
                <div class="d-flex flex-column gap-2">
                    <div class="d-flex align-items-center gap-2">
                        <span class="badge bg-secondary" style="font-size: 0.85rem;">En espera</span>
                        <span>El territorio espera a ser asignado a una salida.</span>
                    </div>
                    <hr>
                    <div class="d-flex align-items-center gap-2">
                        <span class="badge bg-warning text-dark" style="font-size: 0.85rem;">Pendiente</span>
                        <span>El territorio esta asociado a una salida.</span>
                    </div>
                    <hr>

                    <div class="d-flex align-items-center gap-2">
                        <span class="badge bg-danger" style="font-size: 0.85rem;">Incompleto</span>
                        <span>El territorio se asigno a una salida pero no se completó.</span>
                    </div>
                    <hr>

                    <div class="d-flex align-items-center gap-2">
                        <span class="badge bg-info text-dark" style="font-size: 0.85rem;">Pendiente Incompleto</span>
                        <span>El territorio se asigno a una salida pero no se hizo nada por temas externos.</span>
                    </div>
                    <hr>

                    <div class="d-flex align-items-center gap-2">
                        <span class="badge bg-success" style="font-size: 0.85rem;">Completo</span>
                        <span>El territorio se asigno a una salida y se completó correctamente.</span>
                    </div>
                </div>
            </div>
          <div v-if="showCampañaInfo" class="alert alert-info shadow-sm">
            <div class="d-flex flex-column gap-3">
                <div>
                    <h6 class="fw-bold mb-3">Campañas disponibles:</h6>
                    
                    <ul class="list-unstyled mb-3">
                        <li v-for="campaña in store.temas" :key="campaña" class="mb-2">
                            <span class="badge me-2" style="background-color: #ce93d8; color: black;">
                                {{ campaña }}
                            </span>
                        </li>
                    </ul>

                    <p class="mb-0">
                        Las campañas son el tema de una salida de predicación. Cuando creas una salida, seleccionas la campaña (por defecto siempre es la de <strong>Predicación</strong>) y cuando una salida ha sido reportada, se le asigna esa campaña al territorio. Así se sabe que al territorio ya se predicó con esa campaña.
                    </p>
                </div>
                <hr class="my-1">
                <p class="mb-0">
                    También pueden editar la campaña del territorio desde <strong>Editar</strong>, solo si el territorio no está asignado a una salida.
                </p>
            </div>
        </div>
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
                        <div class="mb-1" @click="territorioView(territorio.id)" style="cursor:pointer">
                            <div class="d-flex justify-content-between ">
                                <div>
                                    <h4 class="card-title mb-1 d-flex align-items-center">
                                        <i class="bi bi-geo-alt me-2 text-primary"></i>
                                        {{ territorio.nombre }}
                                    </h4>
                                </div>
                                <div class="mb-1">
                                    <h6 class="fw-bold">Estado: 
                                        <span :class="['badge', getBadgeClass(territorio.estado)]" style="font-size: 0.85rem;">
                                            {{ store.getNombreEstado(territorio.estado) }}
                                        </span>
                                    </h6>
                                </div>
                            </div>
                            <div class="d-inline-flex align-items-center p-1 mb-2 rounded shadow-sm" style="background-color: #f3e5f5; border: 0.1px solid #ce93d8;">
                                <span class="text-dark">
                                    <i class="bi bi-calendar-event"></i> <strong>Campaña:</strong> 
                                    <span class="ms-1">{{ store.getNombreTema(territorio.tema) }}</span>
                                </span>
                            </div>
                        </div>
                        <div>
                            <div class="d-flex justify-content-end gap-2 mt-auto">
                                <button v-if="territorio.estado != 2" class="btn btn-outline-primary btn-sm d-flex align-items-center" @click.stop="editar(territorio.id)">
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
    </div>
</template>
<style>
</style>    