import { ref, watch } from 'vue';
import { useSistemaDiasStore } from '../store/storeSistemaDias';

const normalizarDia = (item) => ({
  id: item?.sistemaDiasId ?? item?.id,
  diaTurno: item?.diaTurno ?? item?.sistemaDias?.diaTurno ?? '',
  completado: Boolean(item?.completado),
});

// El progreso llega como un resumen del territorio con la grilla en `dias`.
const extraerDias = (respuesta) => {
  if (Array.isArray(respuesta)) return respuesta;
  if (Array.isArray(respuesta?.dias)) return respuesta.dias;
  return [];
};

// Mantiene el progreso del sistema de días sincronizado con el territorio elegido en un formulario.
export function useProgresoSistemaDias(territorioId) {
  const store = useSistemaDiasStore();
  const progresoDias = ref([]);
  const cargandoProgreso = ref(false);
  let ultimoTerritorioId = null;

  const cargarProgreso = async (id) => {
    if (id === ultimoTerritorioId) return;
    ultimoTerritorioId = id;

    if (!id) {
      progresoDias.value = [];
      return;
    }

    cargandoProgreso.value = true;
    try {
      const respuesta = await store.fetchProgresoTerritorio(id);
      progresoDias.value = extraerDias(respuesta).map(normalizarDia);
    } finally {
      cargandoProgreso.value = false;
    }
  };

  watch(territorioId, (id) => cargarProgreso(id));

  return { progresoDias, cargandoProgreso, cargarProgreso };
}
