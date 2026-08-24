<script setup>
import { computed, onMounted, ref } from 'vue';
import { usePuntoEncuentroStore } from '../store/storePuntoEncuentro';
import { useTerritorioStore } from '../store/storeTerritorio';
import { useNotificaciones } from '../composables/useNotificaciones';

const { notificarExito, notificarError, notificarAviso } = useNotificaciones();
const store = usePuntoEncuentroStore();
const territorioStore = useTerritorioStore();

const filtro = ref('');
const mostrarFormulario = ref(false);
const nuevoLugar = ref('');
const puntoEnEdicion = ref(null);
const lugarEditado = ref('');
const puntoExpandido = ref(null);
const filtroTerritorios = ref('');

onMounted(async () => {
    await Promise.all([store.fetchPuntos(), territorioStore.fetchTerritorios()]);
});

const puntosFiltrados = computed(() => {
    const texto = filtro.value.trim().toLowerCase();
    const lista = [...store.puntos].sort((a, b) => (a.lugar || '').localeCompare(b.lugar || '', 'es'));
    if (!texto) return lista;
    return lista.filter(p => (p.lugar || '').toLowerCase().includes(texto));
});

const territoriosDisponibles = computed(() => {
    const texto = filtroTerritorios.value.trim().toLowerCase();
    const lista = [...territorioStore.territorios]
        .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es', { numeric: true }));
    if (!texto) return lista;
    return lista.filter(t => (t.nombre || '').toLowerCase().includes(texto));
});

const crear = async () => {
    const lugar = nuevoLugar.value.trim();
    if (!lugar) return;

    await store.createPunto({ lugar });
    if (store.error) {
        notificarError(store.error);
        return;
    }

    nuevoLugar.value = '';
    mostrarFormulario.value = false;
    notificarExito(`Se creó el punto de encuentro "${lugar}".`);
};

const empezarEdicion = (punto) => {
    puntoEnEdicion.value = punto.id;
    lugarEditado.value = punto.lugar;
};

const cancelarEdicion = () => {
    puntoEnEdicion.value = null;
    lugarEditado.value = '';
};

const guardarEdicion = async (punto) => {
    const lugar = lugarEditado.value.trim();
    if (!lugar || lugar === punto.lugar) {
        cancelarEdicion();
        return;
    }

    await store.updatePunto(punto.id, { lugar });
    if (store.error) {
        notificarError(store.error);
        return;
    }

    cancelarEdicion();
    notificarExito(`Se actualizó el punto de encuentro "${lugar}".`);
};

const eliminar = async (punto) => {
    // La API rechaza la baja si el punto sigue vinculado; se avisa antes de intentarlo.
    await store.fetchTerritoriosDePunto(punto.id);
    const vinculados = store.getTerritorioIdsDePunto(punto.id);
    if (vinculados.length > 0) {
        const nombres = vinculados.map(nombreTerritorio).join(', ');
        notificarAviso(
            `"${punto.lugar}" tiene ${vinculados.length} territorio(s) asociado(s): ${nombres}. Desvinculelos antes de eliminarlo.`
        );
        puntoExpandido.value = punto.id;
        return;
    }

    if (!confirm(`¿Eliminar el punto de encuentro "${punto.lugar}"?`)) return;

    await store.deletePunto(punto.id);
    if (store.error) {
        notificarError(store.error);
        return;
    }

    if (puntoExpandido.value === punto.id) {
        puntoExpandido.value = null;
    }
    notificarExito(`Se eliminó el punto de encuentro "${punto.lugar}".`);
};

const alternarTerritorios = async (punto) => {
    if (puntoExpandido.value === punto.id) {
        puntoExpandido.value = null;
        return;
    }

    puntoExpandido.value = punto.id;
    filtroTerritorios.value = '';
    await store.fetchTerritoriosDePunto(punto.id);
};

const alternarVinculo = async (punto, territorio) => {
    if (store.estaVinculado(punto.id, territorio.id)) {
        await store.desvincularTerritorio(punto.id, territorio.id);
    } else {
        await store.vincularTerritorio(punto.id, territorio.id);
    }

    if (store.error) {
        notificarError(store.error);
    }
};

const vinculoEnProceso = (puntoId, territorioId) => store.vinculoLoadingKey === `${puntoId}-${territorioId}`;

const nombreTerritorio = (territorioId) => territorioStore.getTerritorioPorId(territorioId)?.nombre ?? `#${territorioId}`;
</script>

<template>
  <div class="container py-4">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
      <h1 class="mb-0 d-flex align-items-center">
        <i class="bi bi-geo-alt me-2"></i>Puntos de Encuentro
      </h1>
      <button class="btn btn-primary d-flex align-items-center" @click="mostrarFormulario = !mostrarFormulario">
        <i class="bi me-2" :class="mostrarFormulario ? 'bi-x-circle' : 'bi-plus-circle'"></i>
        {{ mostrarFormulario ? 'Cancelar' : 'Nuevo Punto' }}
      </button>
    </div>

    <div v-if="mostrarFormulario" class="puntos-shell mb-3">
      <form class="row g-2 align-items-end" @submit.prevent="crear">
        <div class="col-md-9">
          <label class="form-label"><strong>Lugar *</strong></label>
          <input v-model="nuevoLugar" type="text" class="form-control" placeholder="Ej: Plaza principal" required />
        </div>
        <div class="col-md-3 d-grid">
          <button type="submit" class="btn btn-primary" :disabled="store.puntoLoadingSave">
            {{ store.puntoLoadingSave ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </form>
    </div>

    <div class="mb-3">
      <input v-model="filtro" type="search" class="form-control" placeholder="Buscar punto de encuentro..." />
    </div>

    <div class="puntos-shell">
      <div v-if="store.puntoLoading" class="alert alert-info mb-0">Cargando puntos de encuentro...</div>
      <div v-else-if="puntosFiltrados.length === 0" class="alert alert-info mb-0">
        No hay puntos de encuentro registrados.
      </div>

      <ul v-else class="list-group list-group-flush">
        <li v-for="punto in puntosFiltrados" :key="punto.id" class="list-group-item py-3 punto-item">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
            <div class="flex-grow-1">
              <div class="text-uppercase small text-muted fw-semibold">Punto de encuentro</div>
              <div v-if="puntoEnEdicion !== punto.id" class="fw-bold">{{ punto.lugar }}</div>
              <form v-else class="d-flex gap-2 mt-1" @submit.prevent="guardarEdicion(punto)">
                <input v-model="lugarEditado" type="text" class="form-control form-control-sm" required />
                <button type="submit" class="btn btn-sm btn-primary" :disabled="store.puntoLoadingSave">Guardar</button>
                <button type="button" class="btn btn-sm btn-secondary" @click="cancelarEdicion">Cancelar</button>
              </form>
            </div>

            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary" @click="alternarTerritorios(punto)">
                <i class="bi bi-map me-1"></i>
                {{ puntoExpandido === punto.id ? 'Ocultar territorios' : 'Territorios' }}
              </button>
              <button
                v-if="puntoEnEdicion !== punto.id"
                class="btn btn-sm btn-outline-secondary"
                @click="empezarEdicion(punto)"
              >
                <i class="bi bi-pencil me-1"></i>Editar
              </button>
              <button
                class="btn btn-sm btn-outline-danger"
                :disabled="store.puntoLoadingDeleteId === punto.id"
                @click="eliminar(punto)"
              >
                <i class="bi bi-trash me-1"></i>
                {{ store.puntoLoadingDeleteId === punto.id ? 'Eliminando...' : 'Eliminar' }}
              </button>
            </div>
          </div>

          <div v-if="puntoExpandido === punto.id" class="territorios-panel mt-3">
            <div v-if="store.territoriosLoadingId === punto.id" class="text-muted small">Cargando territorios...</div>
            <template v-else>
              <div class="d-flex flex-wrap gap-1 mb-2">
                <span
                  v-for="territorioId in store.getTerritorioIdsDePunto(punto.id)"
                  :key="territorioId"
                  class="badge bg-primary"
                >
                  {{ nombreTerritorio(territorioId) }}
                </span>
                <span v-if="store.getTerritorioIdsDePunto(punto.id).length === 0" class="text-muted small">
                  Sin territorios vinculados.
                </span>
              </div>

              <input
                v-model="filtroTerritorios"
                type="search"
                class="form-control form-control-sm mb-2"
                placeholder="Buscar territorio..."
              />

              <div class="territorios-lista">
                <!-- El estado va en la key para que el checkbox se redibuje si la operación falla -->
                <div
                  v-for="territorio in territoriosDisponibles"
                  :key="`${territorio.id}-${store.estaVinculado(punto.id, territorio.id)}`"
                  class="form-check"
                >
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :id="`punto-${punto.id}-territorio-${territorio.id}`"
                    :checked="store.estaVinculado(punto.id, territorio.id)"
                    :disabled="vinculoEnProceso(punto.id, territorio.id)"
                    @change="alternarVinculo(punto, territorio)"
                  />
                  <label class="form-check-label" :for="`punto-${punto.id}-territorio-${territorio.id}`">
                    {{ territorio.nombre }}
                  </label>
                </div>
                <div v-if="territoriosDisponibles.length === 0" class="text-muted small">
                  No hay territorios que coincidan con la búsqueda.
                </div>
              </div>
            </template>
          </div>
        </li>
      </ul>

      <div v-if="store.error" class="alert alert-danger mt-3 mb-0">{{ store.error }}</div>
    </div>
  </div>
</template>

<style scoped>
.puntos-shell {
  background: linear-gradient(180deg, #ffffff 0%, #faf8ff 100%);
  border: 1px solid #eadff7;
  border-radius: 14px;
  padding: 0.75rem;
  box-shadow: 0 0.35rem 0.8rem rgba(51, 21, 84, 0.08);
}

.punto-item {
  border-radius: 10px;
}

.territorios-panel {
  background: #f7f3fd;
  border: 1px dashed #d9c9f2;
  border-radius: 12px;
  padding: 0.85rem;
}

.territorios-lista {
  max-height: 240px;
  overflow-y: auto;
}

@media (min-width: 768px) {
  .puntos-shell {
    padding: 1rem;
  }
}
</style>
