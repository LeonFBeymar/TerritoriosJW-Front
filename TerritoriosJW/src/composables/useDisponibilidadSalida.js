import { computed, ref, watch } from 'vue';
import { useSalidaStore } from '../store/storeSalidas';

// Se arma sin zona horaria, igual que el valor que se guarda, para que la consulta de
// disponibilidad y el POST/PUT comparen exactamente lo mismo.
export const armarHoraSalida = (fecha, hora, minuto) => {
  if (!fecha || hora === '' || hora === null || minuto === '' || minuto === null) return null;

  const hh = String(hora).padStart(2, '0');
  const mm = String(minuto).padStart(2, '0');
  return `${fecha}T${hh}:${mm}:00`;
};

// Avisa si el territorio ya tiene una salida en esa fecha y horario.
// `excluirSalidaId` es la salida que se está editando, para que no choque consigo misma.
export function useDisponibilidadSalida(form, excluirSalidaId = null) {
  const store = useSalidaStore();
  const conflicto = ref(null);
  const verificando = ref(false);

  const horaSalida = computed(() =>
    armarHoraSalida(form.value.fechaSalida, form.value.horaSalidaHour, form.value.horaSalidaMinute)
  );

  const verificar = async () => {
    conflicto.value = null;
    if (!form.value.territorioId || !horaSalida.value) return null;

    verificando.value = true;
    try {
      const resultado = await store.verificarDisponibilidad(
        form.value.territorioId,
        horaSalida.value,
        excluirSalidaId
      );
      conflicto.value = resultado?.disponible === false ? resultado : null;
      return resultado;
    } finally {
      verificando.value = false;
    }
  };

  watch([() => form.value.territorioId, horaSalida], () => verificar());

  return { conflicto, verificando, horaSalida, verificar };
}
