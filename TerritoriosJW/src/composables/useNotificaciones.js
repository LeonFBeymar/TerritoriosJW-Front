import { readonly, ref } from 'vue';

// Estado a nivel módulo: todas las pantallas comparten la misma cola de notificaciones,
// que se muestra desde <notificaciones-jw /> en App.vue.
const notificaciones = ref([]);
let ultimoId = 0;

const DURACION_POR_DEFECTO = 5000;

const agregar = (mensaje, tipo, duracion = DURACION_POR_DEFECTO) => {
  if (!mensaje) return null;

  const id = ++ultimoId;
  notificaciones.value.push({ id, mensaje, tipo });

  if (duracion > 0) {
    setTimeout(() => cerrar(id), duracion);
  }

  return id;
};

const cerrar = (id) => {
  notificaciones.value = notificaciones.value.filter(n => n.id !== id);
};

export function useNotificaciones() {
  return {
    notificaciones: readonly(notificaciones),
    cerrar,
    notificarExito: (mensaje, duracion) => agregar(mensaje, 'exito', duracion),
    notificarError: (mensaje, duracion) => agregar(mensaje, 'error', duracion),
    notificarAviso: (mensaje, duracion) => agregar(mensaje, 'aviso', duracion),
  };
}
