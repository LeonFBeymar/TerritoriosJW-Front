<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useSalidaStore } from '../store/storeSalidas';
import { useUsuarioStore } from '../store/storeUsuarios';
import { useTerritorioStore } from '../store/storeTerritorio';
import { useRouter } from 'vue-router';
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
  observaciones: '',
  tema: 1, // Valor por defecto para campaña
});
const agregarSegundoConductor = ref(false);

const territoriosParaEditar = computed(() => {
  const disponibles = territorioStore.getTerritoriosDisponibles();
  const territorioActual = territorioStore.getTerritorioPorId(form.value.territorioId);
  if (!territorioActual) {
    return disponibles;
  }

  const yaIncluido = disponibles.some((territorio) => territorio.id === territorioActual.id);
  if (yaIncluido) {
    return disponibles;
  }

  return [territorioActual, ...disponibles];
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
  }
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
        <div v-else class="bg-white p-4 rounded shadow-sm">
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
          <option value="" disabled>Seleccione un territorio</option>
          <option v-for="territorio in territoriosParaEditar" :key="territorio.id" :value="territorio.id">
            {{ territorio.nombre.padEnd(20, ' ') }} 
            {{ territorioStore.getNombrePrioridad(territorio.prioridad) }} 
              » 🕒{{ territorio.ultimaSalida }}
          </option>
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label"> <strong>Semana de Salida *</strong></label>
        <select v-model="form.salidaSemanalId" class="form-select" required>
          <option value="" disabled>Seleccione una semana</option>
          <option v-for="semana in store.salidasSemanales" :key="semana.id" :value="semana.id">
            {{ semana.semanaInicio }}
          </option>
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label"> <strong>Punto de Encuentro *</strong></label>
        <input v-model="form.puntoEncuentro" type="text" class="form-control" required />
      </div>
      <div class="col-md-6">
        <label class="form-label"> <strong>Fecha de Salida *</strong></label>
        <input v-model="form.fechaSalida" type="date" class="form-control" required />
      </div>
      <div class="col-md-3">
        <label class="form-label"> <strong>Hora (hs)  *</strong></label>
        <select v-model="form.horaSalidaHour" class="form-select" required>
          <option value="" disabled>HH</option>
          <option v-for="h in 24" :key="h-1" :value="(h-1)">
            {{ (h-1) }}hs
          </option>
        </select>
      </div>
      <div class="col-md-3">
        <label class="form-label"> <strong>Minutos *</strong></label>
        <select v-model="form.horaSalidaMinute" class="form-select" required>
          <option value="" disabled>MM</option>
          <option v-for="m in [0,10,20,30,40,50]" :key="m" :value="m">
            {{ m.toString().padStart(2,'0') }}
          </option>
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label"> <strong>Campaña*</strong></label>
        <select v-model="form.tema" class="form-select" required>
          <option value="" disabled>Seleccione una campaña</option>
          <option v-for="(label, value) in territorioStore.temas" :key="value" :value="value">{{ label }}</option>
        </select>
      </div>
      <div class="col-3">
        <!-- Esta parte es de observaciones pero actuara como grupo/s por ahora -->
        <label class="form-label"> <strong>Grupo/s(Opcional)</strong></label> 
        <input v-model="form.observaciones" class="form-control" type="text" placeholder="Todos"/>
      </div>
      <div class="col-12 d-flex justify-content-end gap-2">
        <button type="button" class="btn btn-secondary" @click="volver">Volver</button>
        <button type="submit" class="btn btn-primary">{{ store.salidaloadingSave ? 'Actualizando...' : 'Actualizar' }}</button>
      </div>
    </form>
        </div>

    </div>
</template>