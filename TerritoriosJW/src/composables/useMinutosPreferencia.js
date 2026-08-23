import { ref, watch } from 'vue';

// Modo de carga de los minutos de la hora de salida.
// 'lista'  -> select con minutos sugeridos
// 'manual' -> input numérico escrito a mano
const STORAGE_KEY = 'salidas:modoMinutos';
const MINUTOS_SUGERIDOS = [10, 20, 30, 40, 50];

const leerPreferencia = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'manual';
  } catch {
    return true;
  }
};

const guardarPreferencia = (usarLista) => {
  try {
    localStorage.setItem(STORAGE_KEY, usarLista ? 'lista' : 'manual');
  } catch {
    // Si el navegador bloquea el storage simplemente no se persiste.
  }
};

export function useMinutosPreferencia() {
  const usarListaMinutos = ref(leerPreferencia());

  watch(usarListaMinutos, guardarPreferencia);

  return { usarListaMinutos, minutosSugeridos: MINUTOS_SUGERIDOS };
}
