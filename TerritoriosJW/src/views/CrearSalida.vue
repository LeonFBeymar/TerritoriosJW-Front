<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useUsuarioStore } from '../store/storeUsuarios';
import { useTerritorioStore } from '../store/storeTerritorio';
import { useSalidaStore } from '../store/storeSalidas';
import { useRouter } from 'vue-router';

const usuarioStore = useUsuarioStore();
const territorioStore = useTerritorioStore();
const salidaStore = useSalidaStore();
const router = useRouter();

const form = ref({
  conductor1: '',
  conductor2: '',
  territorioId: '',
  salidaSemanalId: '',
  puntoEncuentro: '',
  fechaSalida: '',
  horaSalidaHour: '',
  horaSalidaMinute: '',
  observaciones: ''
});
const agregarSegundoConductor = ref(false);

// Watchers para mantener consistencia y limpiar duplicados o valores inválidos
watch([() => form.value.conductor1, () => form.value.conductor2, agregarSegundoConductor], ([c1, c2, add2], [oldC1, oldC2, oldAdd2]) => {
  // Si el checkbox se desmarca, limpiar conductor2
  if (!add2 && oldAdd2) {
    form.value.conductor2 = '';
  }

  // Si ambos están seleccionados y son iguales, limpiar el segundo
  if (add2 && c1 && c2 && c1 === c2) {
    form.value.conductor2 = '';
  }
});

onMounted(async () => {
  await usuarioStore.fetchUsuarios();
  await territorioStore.fetchTerritorios();
  await salidaStore.fetchSalidasSemanal();
});

const crearSalida = async () => {
  // Validación extra para asegurar que no se envíen ids duplicados
  if (!form.value.conductor1) {
    alert('Seleccione el conductor principal');
    return;
  }
  if (agregarSegundoConductor.value && form.value.conductor2 && form.value.conductor1 === form.value.conductor2) {
    alert('No puede seleccionar el mismo conductor en ambos campos');
    form.value.conductor2 = '';
    return;
  }

  // Construir el array de usuarioIds según los selects
  const usuarioIds = [form.value.conductor1];
  if (agregarSegundoConductor.value && form.value.conductor2) {
    usuarioIds.push(form.value.conductor2);
  }

  // Construir la fecha y hora en ISO (backend espera ISO). Validar fecha/hora
  if (!form.value.fechaSalida || form.value.horaSalidaHour === '' || form.value.horaSalidaMinute === '') {
    alert('Seleccione fecha y hora de salida válidas');
    return;
  }
  const hh = String(form.value.horaSalidaHour).padStart(2, '0');
  const mm = String(form.value.horaSalidaMinute).padStart(2, '0');
  // Construir string de fecha/hora en formato ISO local sin conversión de zona
  // (evita que `toISOString()` convierta a UTC y cambie la hora)
  const horaSalidaIso = `${form.value.fechaSalida}T${hh}:${mm}:00`;

  await territorioStore.updateTerritorio(form.value.territorioId, {
    estado: 2, // Cambiar estado a "Pendiente" al crear una salida
    ultimaSalida: form.value.fechaSalida // Actualizar última salida con la fecha seleccionada
  });
  
  await salidaStore.createSalida({
    usuarioIds,
    territorioId: form.value.territorioId,
    salidaSemanalId: form.value.salidaSemanalId,
    puntoEncuentro: form.value.puntoEncuentro,
    horaSalida: horaSalidaIso,
    observaciones: form.value.observaciones
  });


  form.value = { conductor1: '', conductor2: '', territorioId: '', salidaSemanalId: '', puntoEncuentro: '', fechaSalida: '', horaSalidaHour: '', horaSalidaMinute: '', observaciones: '' };
  agregarSegundoConductor.value = false;
  router.push('/salidas');
};

const volver = () => {
  router.push('/salidas');
};
</script>

<template>
  <div class="container py-4">
    <h1 class="mb-4">Crear Salida</h1>
    <form @submit.prevent="crearSalida" class="row g-3">
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
          <option v-for="territorio in territorioStore.getTerritoriosDisponibles()" :key="territorio.id" :value="territorio.id">
            {{ territorio.nombre }}
          </option>
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label"> <strong>Semana de Salida *</strong></label>
        <select v-model="form.salidaSemanalId" class="form-select" required>
          <option value="" disabled>Seleccione una semana</option>
          <option v-for="semana in salidaStore.salidasSemanales" :key="semana.id" :value="semana.id">
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
      <div class="col-3">
        <!-- Esta parte es de observaciones pero actuara como grupo/s por ahora -->
        <label class="form-label"> <strong>Grupo/s(Opcional)</strong></label> 
        <input v-model="form.observaciones" class="form-control" type="text" placeholder="Todos"/>
      </div>
      <div class="col-12 d-flex justify-content-end gap-2">
        <button type="button" class="btn btn-secondary" @click="volver">Volver</button>
        <button type="submit" class="btn btn-primary">Crear Salida</button>
      </div>
    </form>
  </div>
</template>