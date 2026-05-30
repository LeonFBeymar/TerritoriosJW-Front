<script setup>
import { computed, onMounted, ref, watch } from "vue";
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
const salidaSemanalError = ref("");
const salidaSemanalSuccess = ref("");
const paginaActual = ref(1);
const salidaSemanalSeleccionada = ref("");

const ultimasSalidasSemanales = computed(() => {
  return [...store.salidasSemanales]
    .sort((a, b) => b.id - a.id)
    .slice(0, 4);
});

const obtenerSemanaInicio = (salida) => {
  return store.getSalidaSemanalPorId(salida.salidaSemanalId)?.semanaInicio || "Sin fecha";
};

const timestampSemana = (semanaInicio) => {
  const timestamp = new Date(semanaInicio).getTime();
  return Number.isNaN(timestamp) ? -Infinity : timestamp;
};

const gruposSalidasPorSemana = computed(() => {
  const grupos = store.salidas.reduce((acc, salida) => {
    const semanaInicio = obtenerSemanaInicio(salida);
    if (!acc[semanaInicio]) {
      acc[semanaInicio] = [];
    }
    acc[semanaInicio].push(salida);
    return acc;
  }, {});

  return Object.entries(grupos)
    .sort(([semanaA], [semanaB]) => timestampSemana(semanaB) - timestampSemana(semanaA))
    .map(([, salidas]) => salidas);
});

const totalPaginas = computed(() => gruposSalidasPorSemana.value.length);

const salidasPaginaActual = computed(() => {
  return gruposSalidasPorSemana.value[paginaActual.value - 1] || [];
});

const cambiarPagina = (pagina) => {
  if (pagina < 1 || pagina > totalPaginas.value) return;
  paginaActual.value = pagina;
};

const paginasVisibles = computed(() => {
  const total = totalPaginas.value;
  const actual = paginaActual.value;

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const paginas = [1];
  const inicio = Math.max(2, actual - 1);
  const fin = Math.min(total - 1, actual + 1);

  if (inicio > 2) {
    paginas.push("...");
  }

  for (let pagina = inicio; pagina <= fin; pagina += 1) {
    paginas.push(pagina);
  }

  if (fin < total - 1) {
    paginas.push("...");
  }

  paginas.push(total);
  return paginas;
});

watch(totalPaginas, (nuevoTotal) => {
  if (nuevoTotal === 0) {
    paginaActual.value = 1;
    return;
  }
  if (paginaActual.value > nuevoTotal) {
    paginaActual.value = nuevoTotal;
  }
});

const openModal = () => {
  salidaSemanalError.value = "";
  salidaSemanalSuccess.value = "";
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
  if (!form.value.fechaInicio) {
    salidaSemanalError.value = "Debe seleccionar una fecha de inicio.";
    salidaSemanalSuccess.value = "";
    return;
  }

  await store.createSalidaSemanal({
    semanaInicio: form.value.fechaInicio,
  });

  if (store.error) {
    salidaSemanalError.value = store.error;
    salidaSemanalSuccess.value = "";
    return;
  }

  salidaSemanalError.value = "";
  salidaSemanalSuccess.value = "Salida semanal creada correctamente.";
  form.value.fechaInicio = "";
};

const eliminarSalidaSemanal = async (id) => {
  salidaSemanalError.value = "";
  salidaSemanalSuccess.value = "";
  
  await store.deleteSalidaSemanal(id);

  if (store.error) {
    salidaSemanalError.value = store.error;
    return;
  }

  salidaSemanalSuccess.value = "Salida semanal eliminada correctamente.";
};
const crear = () => {
  router.push("/crear-salida");
};
const editar = (id) => {
  // Lógica para editar la salida
  router.push(`/update-salida/${id}`);
};
const reportar = (salidaId, territorioId) => {
  // Lógica para reportar la salida
  router.push(`/reportar-salida/${salidaId}/${territorioId}`);
};
const getReporteSalida = (salidaId) => reporteStore.getReporteByIdSalida(salidaId);
const tieneReporte = (salidaId) => getReporteSalida(salidaId) !== undefined;

const descargarReporteExcel = async () => {
  if (!salidaSemanalSeleccionada.value) {
    return;
  }

  await store.descargarExcelReportePorSalidaSemanal(Number(salidaSemanalSeleccionada.value));
};
</script>
<template>
  <div class="container col-12 py-4">
    <div class="container-fluid container-md py-3 py-md-4">
  <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
    <h1 class="mb-0 d-flex align-items-center">
                <i class="bi bi-map"></i>Salidas
            </h1>
    
    
    <div class="d-grid d-md-flex gap-2 w-100 w-md-auto justify-content-md-end acciones-salidas">
      <button class="btn btn-primary" @click="crear()">
        Crear Salida
      </button>
      
      <button class="btn style-color text-white " @click="openModal">
        Salida Semanal
      </button>
      
      <button 
        class="btn btn-success" 
        :disabled="store.cargandoExcel" 
        @click="store.descargarExcelSalidas()">
        <span v-if="store.cargandoExcel" class="spinner-border spinner-border-sm me-1"></span>
        {{ store.cargandoExcel ? 'Generando...' : 'Descargar Salidas Excel' }}
      </button>

      <select
        v-model="salidaSemanalSeleccionada"
        class="form-select form-select-sm reporte-semanal-select"
        aria-label="Seleccionar salida semanal"
      >
        <option value="" disabled>Fecha salida semanal</option>
        <option
          v-for="semana in ultimasSalidasSemanales"
          :key="semana.id"
          :value="semana.id"
        >
          {{ semana.semanaInicio }}
        </option>
      </select>

      <button
        class="btn btn-success"
        :disabled="!salidaSemanalSeleccionada || store.cargandoExcelReporte"
        @click="descargarReporteExcel"
      >
        <span v-if="store.cargandoExcelReporte" class="spinner-border spinner-border-sm me-1"></span>
        {{ store.cargandoExcelReporte ? 'Generando...' : 'Descargar Reporte Excel' }}
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
      <div v-else class="col-12 mb-3" v-for="salida in salidasPaginaActual" :key="salida.id">
        <div class="card border-primary border-2 shadow-sm">
          <div
            class="card-header bg-primary text-white d-flex justify-content-between align-items-center"
          >
            <span>Salida #{{ salida.id }}</span>
            <span class="text-wite"
              ><strong>Semana de Salida:
              {{
                store.getSalidaSemanalPorId(salida.salidaSemanalId)
                  ?.semanaInicio || "N/A"
              }}</strong>
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
                    <button class="btn btn-primary" type="button" @click="editar(salida.id)">Editar</button>
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

      <nav
        v-if="!store.salidaloading && !error && totalPaginas > 1"
        aria-label="Paginacion de salidas por semana"
        class="mt-4"
      >
        <ul class="pagination justify-content-center mb-0">
          <li class="page-item" :class="{ disabled: paginaActual === 1 }">
            <button
              class="page-link"
              type="button"
              aria-label="Anterior"
              @click="cambiarPagina(paginaActual - 1)"
            >
              &laquo;
            </button>
          </li>

          <li
            v-for="(item, index) in paginasVisibles"
            :key="`${item}-${index}`"
            class="page-item"
            :class="{ active: paginaActual === item, disabled: item === '...' }"
          >
            <span v-if="item === '...'" class="page-link">...</span>
            <button v-else class="page-link" type="button" @click="cambiarPagina(item)">
              {{ item }}
            </button>
          </li>

          <li class="page-item" :class="{ disabled: paginaActual === totalPaginas }">
            <button
              class="page-link"
              type="button"
              aria-label="Siguiente"
              @click="cambiarPagina(paginaActual + 1)"
            >
              &raquo;
            </button>
          </li>
        </ul>
      </nav>
    
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
        <div class="modal-header style-color text-white">
          <h5 class="modal-title text-white">Salida Semanal</h5>
          <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Fecha de inicio semanal</label>
            <div class="d-flex gap-2 align-items-end">
              <input v-model="form.fechaInicio" type="date" class="form-control" />
              <button
                class="btn btn-primary"
                type="button"
                :disabled="store.salidasSemanalesLoadingSave"
                @click="crearSalidaSemanal()"
              >
                {{ store.salidasSemanalesLoadingSave ? "Creando..." : "Crear" }}
              </button>
            </div>
          </div>

          <div v-if="salidaSemanalError" class="alert alert-danger py-2 mb-3">
            {{ salidaSemanalError }}
          </div>
          <div v-if="salidaSemanalSuccess" class="alert alert-success py-2 mb-3">
            {{ salidaSemanalSuccess }}
          </div>

          <h6 class="mb-2">Ultimas salidas semanales</h6>
          <div v-if="ultimasSalidasSemanales.length === 0" class="text-muted small">
            Aun no hay salidas semanales creadas.
          </div>
          <ul v-else class="list-group">
            <li
              v-for="semana in ultimasSalidasSemanales"
              :key="semana.id"
              class="list-group-item d-flex justify-content-between align-items-center"
            >
              <span>#{{ semana.id }} - {{ semana.semanaInicio }}</span>
              <button
                class="btn btn-sm btn-outline-danger"
                type="button"
                :disabled="store.salidasSemanalesLoadingDeleteId === semana.id"
                @click="eliminarSalidaSemanal(semana.id)"
              >
                {{ store.salidasSemanalesLoadingDeleteId === semana.id ? "Eliminando..." : "Eliminar" }}
              </button>
            </li>
          </ul>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline-secondary" type="button" @click="closeModal">Cerrar</button>
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
.style-color {
  background-color: #4d087a !important;
}

.acciones-salidas > * {
  width: 100%;
}

@media (min-width: 768px) {
  .acciones-salidas > * {
    width: auto;
  }

  .reporte-semanal-select {
    width: 200px;
  }
}
</style>
