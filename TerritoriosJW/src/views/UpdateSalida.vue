<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useSalidaStore } from '../store/storeSalidas';
import { useUsuarioStore } from '../store/storeUsuarios';
import { useTerritorioStore } from '../store/storeTerritorio';
import { useRouter } from 'vue-router';
import { useMinutosPreferencia } from '../composables/useMinutosPreferencia';
import { usePuntosDeTerritorio } from '../composables/usePuntosDeTerritorio';
const { usarListaMinutos, minutosSugeridos } = useMinutosPreferencia();
const store = useSalidaStore();
const usuarioStore = useUsuarioStore();
const territorioStore = useTerritorioStore();
const router = useRouter();
const salidaId = router.currentRoute.value.params.id;
const salida = ref(null);
const form = ref({
  conductor1: '',
  conductor2: '',
  territorioId: '',
  salidaSemanalId: '',
  puntoEncuentro: '',
  fechaSalida: '',
  horaSalidaHour: '',
  horaSalidaMinute: '',
  turno: 0,
  observaciones: '',
  tema: 1, // Valor por defecto para campaña
});
const agregarSegundoConductor = ref(false);
const mostrarAvanzadas = ref(false);
const puntoManual = ref(false);

const { puntos: puntosDelTerritorio, cargandoPuntos, cargarPuntos } = usePuntosDeTerritorio(computed(() => form.value.territorioId));

const getEstadoColor = (estado) => {
  const colors = {
    1: '#6c757d',
    2: '#b8860b',
    3: '#0dcaf0',
    4: '#dc3545',
    5: '#198754',
  };

  return colors[estado] || '#212529';
};

const formatFechaCorta = (fecha) => {
  if (!fecha) return 'Sin completar';
  return new Date(fecha).toLocaleDateString('es-AR', { timeZone: 'UTC' });
};

const territoriosParaEditar = computed(() => {
  const disponibles = [...territorioStore.getTerritoriosDisponibles()]
    .sort((a, b) => {
      if (!a.fechaCompletado && !b.fechaCompletado) return 0;
      if (!a.fechaCompletado) return -1;
      if (!b.fechaCompletado) return 1;

      const fechaA = new Date(a.fechaCompletado);
      const fechaB = new Date(b.fechaCompletado);
      return fechaA - fechaB;
    });
  const territorioActual = territorioStore.getTerritorioPorId(form.value.territorioId);
  if (!territorioActual) {
    return disponibles.map((territorio) => ({
      id: territorio.id,
      estado: territorio.estado,
      label: `${territorio.nombre} • ${formatFechaCorta(territorio.fechaCompletado)} • ${territorioStore.getNombreEstado(territorio.estado)} • ${territorio.turno == 0 ? 'M' : 'T'}`,
    }));
  }

  const yaIncluido = disponibles.some((territorio) => territorio.id === territorioActual.id);
  const listaConActual = yaIncluido ? disponibles : [territorioActual, ...disponibles];

  return listaConActual.map((territorio) => ({
    id: territorio.id,
    estado: territorio.estado,
    label: `${territorio.nombre} • ${formatFechaCorta(territorio.fechaCompletado)} • ${territorioStore.getNombreEstado(territorio.estado)} • ${territorio.turno == 0 ? 'M' : 'T'}`,
  }));
});

watch(agregarSegundoConductor, (nuevoValor, valorAnterior) => {
  if (!nuevoValor && valorAnterior) {
    form.value.conductor2 = '';
  }
});

watch([() => form.value.conductor1, () => form.value.conductor2], ([conductor1, conductor2]) => {
  if (agregarSegundoConductor.value && conductor1 && conductor2 && conductor1 === conductor2) {
    form.value.conductor2 = '';
  }
});

watch(() => form.value.horaSalidaHour, (hour) => {
  if (hour === '') {
    return;
  }

  form.value.turno = Number(hour) >= 12 ? 1 : 0;
});

onMounted(async () => {
  await Promise.all([
    store.fetchSalidas(),
    store.fetchSalidasSemanal(),
    usuarioStore.fetchUsuarios(),
    territorioStore.fetchTerritorios()
  ]);
  await store.fetchSalida(salidaId);
  salida.value = store.salida;

  if (salida.value) {
    const usuarioIds = salida.value.usuarioIds || [];
    form.value.conductor1 = usuarioIds[0] || '';
    form.value.conductor2 = usuarioIds[1] || '';
    form.value.territorioId = salida.value.territorioId;
    form.value.salidaSemanalId = salida.value.salidaSemanalId;
    form.value.puntoEncuentro = salida.value.puntoEncuentro;
    form.value.observaciones = salida.value.observaciones || '';

    if (salida.value.horaSalida) {
      const fechaHora = new Date(salida.value.horaSalida);
      const year = fechaHora.getFullYear();
      const month = String(fechaHora.getMonth() + 1).padStart(2, '0');
      const day = String(fechaHora.getDate()).padStart(2, '0');

      form.value.fechaSalida = `${year}-${month}-${day}`;
      form.value.horaSalidaHour = fechaHora.getHours();
      form.value.horaSalidaMinute = fechaHora.getMinutes();
    }

    agregarSegundoConductor.value = Boolean(form.value.conductor2);
    form.value.observaciones = salida.value.observaciones || '';
    form.value.tema = salida.value.tema || 1;
    form.value.turno = salida.value.turno ?? (Number(form.value.horaSalidaHour) >= 12 ? 1 : 0);

    // Si el punto guardado no está entre los del territorio, se muestra como texto libre.
    await cargarPuntos(form.value.territorioId);
    puntoManual.value = Boolean(form.value.puntoEncuentro)
      && !puntosDelTerritorio.value.some(p => p.lugar === form.value.puntoEncuentro);
  }

  // Se registra recién ahora para que la carga inicial no borre el punto ya guardado.
  watch(() => form.value.territorioId, () => {
    form.value.puntoEncuentro = '';
    puntoManual.value = false;
  });
});

const editar = async () => {
  if (!form.value.conductor1) {
    alert('Seleccione el conductor principal');
    return;
  }

  if (agregarSegundoConductor.value && form.value.conductor2 && form.value.conductor1 === form.value.conductor2) {
    alert('No puede seleccionar el mismo conductor en ambos campos');
    form.value.conductor2 = '';
    return;
  }

  if (!form.value.fechaSalida || form.value.horaSalidaHour === '' || form.value.horaSalidaMinute === '') {
    alert('Seleccione fecha y hora de salida válidas');
    return;
  }

  const usuarioIds = [form.value.conductor1];
  if (agregarSegundoConductor.value && form.value.conductor2) {
    usuarioIds.push(form.value.conductor2);
  }

  const hh = String(form.value.horaSalidaHour).padStart(2, '0');
  const mm = String(form.value.horaSalidaMinute).padStart(2, '0');
  const horaSalidaIso = `${form.value.fechaSalida}T${hh}:${mm}:00`;

  await territorioStore.updateTerritorio(form.value.territorioId, {
    estado: 2,
    ultimaSalida: form.value.fechaSalida,
    // tema: Number(form.value.tema)
  });

  const parsedId = Number(salidaId);
  const salidaIdToUpdate = Number.isNaN(parsedId) ? salidaId : parsedId;

  await store.updateSalida(salidaIdToUpdate, {
    usuarioIds,
    territorioId: form.value.territorioId,
    salidaSemanalId: form.value.salidaSemanalId,
    puntoEncuentro: form.value.puntoEncuentro,
    horaSalida: horaSalidaIso,
    turno: Number(form.value.turno),
    observaciones: form.value.observaciones, // Usado como grupo/s por ahora
    tema: form.value.tema // Enviar campaña seleccionada
  });

  if (store.error) {
    alert(store.error);
    return;
  }

  router.push('/salidas');
};
const volver = () => router.push("/salidas");
</script>
<template>
    <div class="container py-4">
        <h1 class="mb-4 d-flex align-items-center">
            <span class="me-2"><i class="bi bi-eye"></i></span>
          Editar Salida <span v-if="salida">: <strong>#{{ store.salidaloading ? '...' : salida.id }}</strong></span>
        </h1>
        <div v-if="store.salidaloading" class="alert alert-info">Cargando salida...</div>
        <div v-else-if="!salida" class="alert alert-danger">Salida no encontrada</div>
        <div v-else class="form-shell">
    <form @submit.prevent="editar" class="row g-3">
      <div class="col-md-6">
        <label class="form-label"> <strong>Conductor principal *</strong></label>
        <select v-model="form.conductor1" class="form-select" required>
          <option value="" disabled>Seleccione el conductor</option>
          <option v-for="usuario in usuarioStore.usuarios" :key="usuario.id" :value="usuario.id">
            {{ usuario.nombre }} {{ usuario.apellido }}
          </option>
        </select>
        <div class="form-check mt-2">
          <input class="form-check-input" type="checkbox" id="agregarSegundoConductor" v-model="agregarSegundoConductor">
          <label class="form-check-label" for="agregarSegundoConductor">
            Agregar otro conductor
          </label>
        </div>
        <div v-if="agregarSegundoConductor" class="mt-2">
          <label class="form-label"> <strong>Segundo conductor *</strong></label>
          <select v-model="form.conductor2" class="form-select" :required="agregarSegundoConductor">
            <option value="" disabled>Seleccione el segundo conductor</option>
            <option v-for="usuario in usuarioStore.usuarios" :key="usuario.id" :value="usuario.id" :disabled="usuario.id === form.conductor1">
              {{ usuario.nombre }} {{ usuario.apellido }}
            </option>
          </select>
        </div>
      </div>
      <div class="col-md-6">
        <label class="form-label"> <strong>Territorio *</strong></label>
        <select v-model="form.territorioId" class="form-select" required>
          <option value="" disabled>Seleccione: Territorio • Ult. completado • Estado • Turno</option>
          <option
            v-for="territorio in territoriosParaEditar"
            :key="territorio.id"
            :value="territorio.id"
            :style="{ color: getEstadoColor(territorio.estado), fontWeight: '600' }"
          >
            {{ territorio.label }}
          </option>
        </select>
      </div>
      <div class="col-md-3">
        <label class="form-label"> <strong>Semana de Salida *</strong></label>
        <select v-model="form.salidaSemanalId" class="form-select" required>
          <option value="" disabled>Seleccione una semana</option>
          <option v-for="semana in store.salidasSemanales" :key="semana.id" :value="semana.id">
            {{ formatFechaCorta(semana.semanaInicio) }}
          </option>
        </select>
      </div>
      <div class="col-md-3">
        <label class="form-label"> <strong>Fecha de Salida *</strong></label>
        <input v-model="form.fechaSalida" type="date" class="form-control" required />
      </div>
      <div class="col-md-3">
        <label class="form-label"> <strong>Hora (hs) *</strong></label>
        <select v-model="form.horaSalidaHour" class="form-select" required>
          <option value="" disabled>HH</option>
          <option v-for="h in 24" :key="h-1" :value="(h-1)">
            {{ (h-1) }}hs
          </option>
        </select>
      </div>
      <div class="col-md-3">
        <label class="form-label"> <strong>Minutos *</strong></label>
        <select v-if="usarListaMinutos" v-model.number="form.horaSalidaMinute" class="form-select" required>
          <option value="" disabled>MM</option>
          <option v-for="m in minutosSugeridos" :key="m" :value="m">
            {{ m.toString().padStart(2,'0') }}
          </option>
        </select>
        <input
          v-else
          v-model.number="form.horaSalidaMinute"
          type="number"
          class="form-control"
          min="1"
          max="59"
          step="1"
          placeholder="MM"
          required
        />
        <div class="form-check mt-2">
          <input class="form-check-input" type="checkbox" id="usarListaMinutosEditar" v-model="usarListaMinutos">
          <label class="form-check-label small" for="usarListaMinutosEditar">Elegir de la lista</label>
        </div>
      </div>
      <div class="col-12">
        <label class="form-label"> <strong>Punto de Encuentro *</strong></label>
        <select
          v-if="puntosDelTerritorio.length > 0 && !puntoManual"
          v-model="form.puntoEncuentro"
          class="form-select"
          required
        >
          <option value="" disabled>Seleccione un punto de encuentro</option>
          <option v-for="punto in puntosDelTerritorio" :key="punto.id" :value="punto.lugar">
            {{ punto.lugar }}
          </option>
        </select>
        <input v-else v-model="form.puntoEncuentro" type="text" class="form-control" required />

        <div v-if="cargandoPuntos" class="form-text">Buscando puntos de encuentro del territorio...</div>
        <div v-else-if="form.territorioId && puntosDelTerritorio.length === 0" class="form-text">
          El territorio no tiene puntos de encuentro asociados; escriba uno.
        </div>
        <div v-else-if="puntosDelTerritorio.length > 0" class="form-check mt-2">
          <input class="form-check-input" type="checkbox" id="puntoManualEditar" v-model="puntoManual">
          <label class="form-check-label small" for="puntoManualEditar">Escribir otro punto</label>
        </div>
      </div>

      <div class="col-12">
        <button type="button" class="btn btn-link btn-sm px-0 text-decoration-none" @click="mostrarAvanzadas = !mostrarAvanzadas">
          <i class="bi" :class="mostrarAvanzadas ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
          {{ mostrarAvanzadas ? 'Ocultar opciones avanzadas' : 'Mostrar opciones avanzadas' }}
        </button>
      </div>
      <div v-if="mostrarAvanzadas" class="col-12">
        <div class="row g-3 opciones-avanzadas">
          <div class="col-md-4">
            <label class="form-label"> <strong>Turno *</strong></label>
            <select v-model.number="form.turno" class="form-select" required>
              <option :value="0">Mañana</option>
              <option :value="1">Tarde</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label"> <strong>Campaña *</strong></label>
            <select v-model="form.tema" class="form-select" required>
              <option value="" disabled>Seleccione una campaña</option>
              <option v-for="(label, value) in territorioStore.temas" :key="value" :value="value">{{ label }}</option>
            </select>
          </div>
          <div class="col-md-4">
            <!-- Esta parte es de observaciones pero actuara como grupo/s por ahora -->
            <label class="form-label"> <strong>Grupo/s (Opcional)</strong></label>
            <input v-model="form.observaciones" class="form-control" type="text" placeholder="Todos"/>
          </div>
        </div>
      </div>

      <div class="col-12 d-flex justify-content-end gap-2 pt-2 mt-2 border-top">
        <button type="button" class="btn btn-secondary" @click="volver">Volver</button>
        <button type="submit" class="btn btn-primary">{{ store.salidaloadingSave ? 'Actualizando...' : 'Actualizar' }}</button>
      </div>
    </form>
        </div>

    </div>
</template>
<style scoped>
.opciones-avanzadas {
  background: #f7f3fd;
  border: 1px dashed #d9c9f2;
  border-radius: 12px;
  padding: 0.85rem;
  margin: 0;
}

.form-shell {
  background: linear-gradient(180deg, #ffffff 0%, #faf8ff 100%);
  border: 1px solid #eadff7;
  border-radius: 14px;
  padding: 1rem;
  box-shadow: 0 0.35rem 0.8rem rgba(51, 21, 84, 0.08);
}

.form-label {
  margin-bottom: 0.35rem;
}

.form-control,
.form-select {
  border-radius: 10px;
}

@media (min-width: 768px) {
  .form-shell {
    padding: 1.25rem;
  }
}
</style>