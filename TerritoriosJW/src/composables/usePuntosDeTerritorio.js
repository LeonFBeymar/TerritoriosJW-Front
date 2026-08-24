import { ref, watch } from 'vue';
import { usePuntoEncuentroStore } from '../store/storePuntoEncuentro';

// La API puede devolver el punto de encuentro o la fila de la relación; en ese último caso
// los datos del punto vienen anidados.
const normalizarPunto = (item) => {
  const id = item?.puntoEncuentroId ?? item?.puntoEncuentro?.id ?? item?.id;
  return { id, lugar: item?.lugar ?? item?.puntoEncuentro?.lugar ?? `#${id}` };
};

// Mantiene la lista de puntos de encuentro sincronizada con el territorio elegido en un formulario.
export function usePuntosDeTerritorio(territorioId) {
  const store = usePuntoEncuentroStore();
  const puntos = ref([]);
  const cargandoPuntos = ref(false);
  let ultimoTerritorioId = null;

  const cargarPuntos = async (id) => {
    if (id === ultimoTerritorioId) return;
    ultimoTerritorioId = id;

    if (!id) {
      puntos.value = [];
      return;
    }

    cargandoPuntos.value = true;
    const respuesta = await store.fetchPuntosDeTerritorio(id);
    puntos.value = (respuesta || []).map(normalizarPunto);
    cargandoPuntos.value = false;
  };

  watch(territorioId, (id) => cargarPuntos(id));

  return { puntos, cargandoPuntos, cargarPuntos };
}
