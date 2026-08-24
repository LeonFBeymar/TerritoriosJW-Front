<script setup>
import { useNotificaciones } from '../composables/useNotificaciones';

const { notificaciones, cerrar } = useNotificaciones();

const claseAlerta = (tipo) => {
  const clases = {
    exito: 'alert-success',
    error: 'alert-danger',
    aviso: 'alert-warning',
  };
  return clases[tipo] || 'alert-info';
};

const icono = (tipo) => {
  const iconos = {
    exito: 'bi-check-circle-fill',
    error: 'bi-exclamation-octagon-fill',
    aviso: 'bi-exclamation-triangle-fill',
  };
  return iconos[tipo] || 'bi-info-circle-fill';
};
</script>

<template>
  <div class="notificaciones-jw">
    <transition-group name="notificacion">
      <div
        v-for="notificacion in notificaciones"
        :key="notificacion.id"
        class="alert alert-dismissible d-flex align-items-start shadow-sm"
        :class="claseAlerta(notificacion.tipo)"
        role="alert"
      >
        <i class="bi me-2" :class="icono(notificacion.tipo)"></i>
        <div class="flex-grow-1">{{ notificacion.mensaje }}</div>
        <button type="button" class="btn-close" aria-label="Cerrar" @click="cerrar(notificacion.id)"></button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.notificaciones-jw {
  position: fixed;
  top: 1rem;
  right: 1rem;
  left: 1rem;
  z-index: 1080;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  pointer-events: none;
}

.notificaciones-jw .alert {
  pointer-events: auto;
  max-width: 420px;
  width: 100%;
  margin-bottom: 0;
}

.notificacion-enter-active,
.notificacion-leave-active {
  transition: all 0.25s ease;
}

.notificacion-enter-from,
.notificacion-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}
</style>
