<script setup>
import { onMounted, ref } from "vue";
import { useSalidaStore } from "../store/storeSalidas";
import { useUsuarioStore } from "../store/storeUsuarios";
import { useTerritorioStore } from "../store/storeTerritorio";
import { useReporteStore } from "../store/storeReporte";
import { useRouter } from "vue-router";
const store = useSalidaStore();
const usuarioStore = useUsuarioStore();
const territorioStore = useTerritorioStore();
const reporteStore = useReporteStore();
const router = useRouter();
const showModal = ref(false);
const error = ref(null);
const reportesInicializados = ref(false);
const territoriosInicializados = ref(false);
const usuarioInicializados = ref(false);
const form = ref({
  fechaInicio: "",
});
const openModal = () => {
  showModal.value = true;
};
const closeModal = () => {
  showModal.value = false;
};

onMounted(async () => {
  await store.fetchSalidas();
  await store.fetchSalidasSemanal();
  try {
    await usuarioStore.fetchUsuarios();
  } finally {
    usuarioInicializados.value = true;
  }
  
  try {
    await territorioStore.fetchTerritorios();
  } finally {
    territoriosInicializados.value = true;
  }

  try {
    await reporteStore.fetchReportes();
  } finally {
    reportesInicializados.value = true;
  }
  error.value = store.error;
});

const crearSalidaSemanal = async () => {
  await store.createSalidaSemanal({
    semanaInicio: form.value.fechaInicio,
  });
  closeModal();
};
const crear = () => {
  router.push("/crear-salida");
};
const editar = () => {
  // Lógica para editar la salida
  alert("Funcionalidad de edición no implementada aún.");
};
const reportar = (salidaId, territorioId) => {
  // Lógica para reportar la salida
  router.push(`/reportar-salida/${salidaId}/${territorioId}`);
};
const getReporteSalida = (salidaId) => reporteStore.getReporteByIdSalida(salidaId);
const tieneReporte = (salidaId) => getReporteSalida(salidaId) !== undefined;
</script>
<template>
  <div class="container col-12 py-4">
    <div class="container-fluid container-md py-3 py-md-4">
  <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
    
    <h1 class="mb-0 fs-2 fs-md-1">Salidas</h1>
    
    <div class="d-grid d-md-flex gap-2 w-100 w-md-auto justify-content-md-end">
      <button class="btn btn-primary" @click="crear()">
        Crear Salida
      </button>
      
      <button class="btn btn-primary" @click="openModal">
        Crear Salida Semanal
      </button>
      
      <button 
        class="btn btn-success" 
        :disabled="store.cargandoExcel" 
        @click="store.descargarExcelSalidas()">
        <span v-if="store.cargandoExcel" class="spinner-border spinner-border-sm me-1"></span>
        {{ store.cargandoExcel ? 'Generando...' : 'Descargar Excel' }}
      </button>
    </div>

  </div>
</div>
      <div v-if="store.salidaloading && !error" class="alert alert-info">
        Cargando salidas...
      </div>
      <div v-else-if="store.salidas.length === 0 && !error" class="alert alert-info">
        No hay salidas registradas.
      </div>
      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>
    <!-- <div class="row"> -->
      <div v-else class="col-12 mb-3" v-for="salida in store.salidas" :key="salida.id">
        <div class="card border-primary border-2 shadow-sm">
          <div
            class="card-header bg-primary text-white d-flex justify-content-between align-items-center"
          >
            <span>Salida #{{ salida.id }}</span>
            <span class="text-wite"
              ><strong>Semana de Inicio:</strong>
              {{
                store.getSalidaSemanalPorId(salida.salidaSemanalId)
                  ?.semanaInicio || "N/A"
              }}
            </span>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-6 col-md-4 mb-2">
                <strong>Conductores:</strong>
                <span v-if="!usuarioInicializados || usuarioStore.usuarioLoading && !usuarioStore.error">
                  Cargando conductores...
                </span>
                <span v-else-if="usuarioStore.error">
                  {{ usuarioStore.error }}
                </span>
                <span v-else-if="salida.usuarioIds && salida.usuarioIds.length">
                  <span v-for="(uid, idx) in salida.usuarioIds" :key="uid">
                    {{ usuarioStore.getUsuarioPorId(uid)?.nombre || 'N/A' }}{{ usuarioStore.getUsuarioPorId(uid)?.apellido ? ' ' + usuarioStore.getUsuarioPorId(uid)?.apellido : '' }}<span v-if="idx < salida.usuarioIds.length - 1">, </span>
                  </span>
                </span>
              </div>
              <div class="col-6 col-md-4 mb-2">
                <div v-if="!territoriosInicializados || territorioStore.territorioloading && !territorioStore.error">
                  Cargando territorios...
                </div>
                <div v-else-if="territorioStore.error" class="alert alert-danger">
                  {{ territorioStore.error }}
                </div>
                <div v-else>
                  <strong>Territorio:</strong>
                  {{
                    territorioStore.getTerritorioPorId(salida.territorioId)
                    ?.nombre || "N/A"
                  }}
                </div>
              </div>
              <div class="col-6 col-md-4 mb-2">
                <strong>Punto de Encuentro:</strong> {{ salida.puntoEncuentro }}
              </div>
              <div class="col-12 mb-2">
                <strong>Dia:</strong>
                {{
                  salida.horaSalida
                    ? new Date(salida.horaSalida).toLocaleDateString()
                    : ""
                }}
              </div>
              <div class="col-12 mb-2">
                <strong>Hora:</strong>
                {{
                  salida.horaSalida
                    ? new Date(salida.horaSalida).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""
                }}
              </div>
              <div class="col-12 mb-2">
                <!-- Por el momento observaciones es usado como grupo/s -->
                <strong>Grupo/s:</strong>
                {{ salida.observaciones || "Todos" }}
              </div>

              <div>
                <div v-if="!reportesInicializados || reporteStore.reporteLoading" class="col-12 mb-2 alert alert-info">
                  Cargando reporte...
                </div>

                <div v-else-if="reporteStore.error" class="col-12 mb-2 alert alert-danger">
                  {{ reporteStore.error }}
                </div>

                <div
                  v-else-if="tieneReporte(salida.id)"
                  class="col-12 mb-2"
                >
                  <strong>Territorio Concluido-Estado:</strong>
                  {{
                    territorioStore.getNombreEstado(
                      getReporteSalida(salida.id)?.estadoTerritorio,
                    ) || "N/A"
                  }}
                </div>

                <div v-if="reportesInicializados && !reporteStore.reporteLoading" class="col-12 mb-2 d-flex gap-2">
                  <div v-if="!tieneReporte(salida.id)">
                    <button class="btn btn-primary" type="button" @click="editar">Editar</button>
                  </div>

                  <div v-if="!tieneReporte(salida.id)">
                    <button class="btn btn-primary" type="button" @click="reportar(salida.id, salida.territorioId)">
                      Reportar
                    </button>
                  </div>

                  <div v-else>
                    <button class="btn btn-secondary" type="button" @click="reportar(salida.id, salida.territorioId)">
                      Ver Reporte
                    </button>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>
    <!-- </div> -->
    
  </div>

  <!-- Modal -->
  <div
    v-if="showModal"
    class="modal fade show d-block"
    tabindex="-1"
    style="background: rgba(0, 0, 0, 0.5)"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Crear Salida Semanal</h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>
        <div class="modal-body">
          <div class="col-md-6">
            <label class="form-label">Indique la semana de inicio</label>
            <input
              v-model="form.fechaInicio"
              type="date"
              class="form-control"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary mt-3" @click="crearSalidaSemanal()">
            Crear Salida Semanal
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- Fin Modal -->
</template>
<style scoped>
.card.border-primary {
  border-color: #6f42c1 !important; /* morado Bootstrap */
}
.card-header.bg-primary {
  background-color: #6f42c1 !important;
}
</style>
