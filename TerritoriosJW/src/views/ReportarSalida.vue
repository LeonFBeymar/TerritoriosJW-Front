<script setup>
import { onMounted, ref, computed } from "vue";
import { useSalidaStore } from "../store/storeSalidas";
import { useReporteStore } from "../store/storeReporte";
import { useTerritorioStore } from "../store/storeTerritorio";
import { useRouter } from "vue-router";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";

const store = useSalidaStore();
const reporteStore = useReporteStore();
const territorioStore = useTerritorioStore();
const router = useRouter();
const salidaR = ref(null);
const territorioId = router.currentRoute.value.params.territorioId;
const reportado = ref(false);
const reporte = ref(null);
const isCreatingReporte = ref(false);
const form = ref({
  salidaId: "",
  estadoTerritorio: "",
  geoJsonFaltante: "",
  notas: "",
});

const territorioEsIncompletoPorFechas = ref(false);

const estadosDisponiblesReporte = computed(() => {
  return Object.entries(territorioStore.estadosForReporte).filter(([value]) => {
    // Si tiene fechaInicio y no tiene fechaCompletado, se considera Incompleto.
    if (territorioEsIncompletoPorFechas.value && Number(value) === 3) {
      return false;
    }
    return true;
  });
});

const drawnGeoJson = ref("");

onMounted(async () => {
  await store.fetchSalidas();
  await reporteStore.fetchReportes();
  await store.fetchSalida(router.currentRoute.value.params.id);
  await territorioStore.fetchTerritorio(territorioId);
  const fechaInicio = territorioStore.territorio?.fechaInicio;
  const fechaCompletado = territorioStore.territorio?.fechaCompletado;
  territorioEsIncompletoPorFechas.value = Boolean(fechaInicio) && !fechaCompletado;
  console.log(router.currentRoute.value.params.id);
  console.log("Salida obtenida:", store.salida.tema);
  reporte.value = reporteStore.getReporteByIdSalida(
    router.currentRoute.value.params.id,
  );
  if (reporte.value) {
    reportado.value = true;
    console.log("Reporte encontrado:", reporte.value);
    console.log("Estado del Territorio en el reporte:", reporte.value.estadoTerritorio);
    form.value.estadoTerritorio = reporte.value.estadoTerritorio;
    form.value.geoJsonFaltante = reporte.value.geoJsonFaltante;
    form.value.notas = reporte.value.notas;
  }

  const imagen = await territorioStore.getTerritorioImagen(territorioId);

  if (!imagen) {
    console.error("No se recibió URL de imagen");
    return;
  }

  console.log("Imagen URL:", imagen);

  const img = new Image();

  img.onload = () => {
    const bounds = [
      [0, 0],
      [img.height, img.width],
    ];

    const map = L.map("map", {
      crs: L.CRS.Simple,
      minZoom: -2,
    });

    L.imageOverlay(imagen, bounds).addTo(map);
    map.fitBounds(bounds);

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const syncGeoJsonFromLayers = () => {
      const data = drawnItems.toGeoJSON();
      if (!data.features || data.features.length === 0) {
        drawnGeoJson.value = "";
        form.value.geoJsonFaltante = "";
        return;
      }

      if (data.features.length === 1) {
        drawnGeoJson.value = JSON.stringify(data.features[0].geometry);
        form.value.geoJsonFaltante = drawnGeoJson.value;
        return;
      }

      drawnGeoJson.value = JSON.stringify(data);
      form.value.geoJsonFaltante = drawnGeoJson.value;
    };

    // --- LÓGICA PARA CARGAR EL GEOJSON EXISTENTE ---
    if (reporte.value && reporte.value.geoJsonFaltante) {
      try {
        // Parseamos el string a objeto JSON
        const geoData = JSON.parse(reporte.value.geoJsonFaltante);
        
        // Creamos la capa de Leaflet desde el GeoJSON
        const existingLayer = L.geoJSON(geoData, {
          style: {
            color: '#000000',
            weight: 2,
            fillColor: '#000000',
            fillOpacity: 0.5
          }
        });

        // Añadimos cada elemento al FeatureGroup para que aparezca
        existingLayer.eachLayer((layer) => {
          drawnItems.addLayer(layer);
        });
      } catch (e) {
        console.error("Error parseando el GeoJSON guardado:", e);
      }
    }

    const drawControl = new L.Control.Draw({
      edit: { featureGroup: drawnItems },
      draw: {
        polygon: {
          shapeOptions: {
            color: "#000000",
            weight: 2,
            fillColor: "#000000",
            fillOpacity: 1,
          },
        },
        rectangle: {
          shapeOptions: {
            color: "#000000",
            weight: 2,
            fillColor: "#000000",
            fillOpacity: 0.5,
          },
        },
        polyline: {
          shapeOptions: {
            color: "#000000",
            weight: 10,
            opacity: false,
          },
        },
        marker: false,
        circle: false,
        circlemarker: false,
      },
    });
    L.drawLocal = {
      draw: {
        toolbar: {
          // Botones de la parte superior (acciones generales)
          actions: {
            title: "Cancelar dibujo",
            text: "Cancelar",
          },
          finish: {
            title: "Finalizar dibujo",
            text: "Finalizar",
          },
          undo: {
            title: "Eliminar el último punto dibujado",
            text: "Deshacer",
          },
          // Nombres de los botones de herramientas
          buttons: {
            polyline: "Dibujar una línea (polilínea)",
            polygon: "Dibujar un polígono",
            rectangle: "Dibujar un rectángulo",
            circle: "Dibujar un círculo",
            marker: "Colocar un marcador",
            circlemarker: "Colocar un marcador circular",
          },
        },
        handlers: {
          circle: {
            tooltip: {
              start: "Haga clic y arrastre para dibujar un círculo.",
            },
            radius: "Radio",
          },
          circlemarker: {
            tooltip: {
              start: "Haga clic en el mapa para colocar un marcador circular.",
            },
          },
          marker: {
            tooltip: {
              start: "Haga clic en el mapa para colocar un marcador.",
            },
          },
          polygon: {
            tooltip: {
              start: "Haga clic para comenzar a dibujar el área.",
              cont: "Haga clic para continuar dibujando el área.",
              end: "Haga clic en el primer punto para cerrar el área.",
            },
          },
          polyline: {
            error: "<strong>Error:</strong> los bordes no pueden cruzarse.",
            tooltip: {
              start: "Haga clic para comenzar a dibujar la línea.",
              cont: "Haga clic para continuar dibujando la línea.",
              end: "Haga clic en el último punto para finalizar la línea.",
            },
          },
          rectangle: {
            tooltip: {
              start: "Haga clic y arrastre para dibujar un rectángulo.",
            },
          },
          simpleshape: {
            tooltip: {
              end: "Suelte el ratón para finalizar el dibujo.",
            },
          },
        },
      },
      edit: {
        toolbar: {
          actions: {
            save: {
              title: "Guardar cambios",
              text: "Guardar",
            },
            cancel: {
              title: "Cancelar edición, descarta todos los cambios",
              text: "Cancelar",
            },
            clearAll: {
              title: "Limpiar todas las capas",
              text: "Limpiar todo",
            },
          },
          buttons: {
            edit: "Editar elementos",
            editDisabled: "No hay elementos para editar",
            remove: "Eliminar elementos",
            removeDisabled: "No hay elementos para eliminar",
          },
        },
        handlers: {
          edit: {
            tooltip: {
              text: "Arrastre los nodos o marcadores para editar los elementos.",
              subtext: "Haga clic en cancelar para deshacer los cambios.",
            },
          },
          remove: {
            tooltip: {
              text: "Haga clic en un elemento para eliminarlo.",
            },
          },
        },
      },
    };

    if (!reportado.value) {
      map.addControl(drawControl);
    }
    map.on(L.Draw.Event.CREATED, function (event) {
      const layer = event.layer;
      drawnItems.addLayer(layer);
      syncGeoJsonFromLayers();
      console.log("GeoJSON:", drawnGeoJson.value);
    });

    map.on(L.Draw.Event.EDITED, function () {
      syncGeoJsonFromLayers();
    });

    map.on(L.Draw.Event.DELETED, function () {
      syncGeoJsonFromLayers();
    });
  };

  img.onerror = () => {
    console.error("Leaflet no pudo cargar la imagen");
  };

  img.src = imagen;
});

const volver = () => {
  router.push("/salidas");
};

const crearReporte = async () => {
  isCreatingReporte.value = true;
  try {
    form.value.salidaId = router.currentRoute.value.params.id;
    const turnoSalida = Number(store.salida?.turno);

    await reporteStore.createReporte({
      salidaId: form.value.salidaId,
      estadoTerritorio: form.value.estadoTerritorio,
      geoJsonFaltante: form.value.geoJsonFaltante,
      notas: form.value.notas,
    });

    await store.updateSalida(form.value.salidaId, {
      activo: false
    });
    await territorioStore.updateTerritorio(territorioId, {
      estado: Number(form.value.estadoTerritorio),
      geoJson: form.value.geoJsonFaltante || null,
      tema: store.salida.tema || 1, // Mantener la campaña del territorio según la salida
      ...(Number.isNaN(turnoSalida) ? {} : { turno: turnoSalida }),
    });


    form.value = {
      salidaId: "",
      estadoTerritorio: "",
      geoJsonFaltante: "",
      notas: "",
    };

    volver();
  } finally {
    isCreatingReporte.value = false;
  }
};
</script>
<template>
  <div v-if="!reportado" class="container py-4">
    <h1 class="mb-2">Reportar Salida</h1>
    <p class="text-muted mb-4">Complete los datos del reporte de esta salida.</p>
    <div class="form-shell">
    <form @submit.prevent="crearReporte" class="row g-3">
      <div class="col-md-6">
        <label class="form-label">Estado del Territorio</label>
        <select v-model="form.estadoTerritorio" class="form-select" required>
          <option value="" disabled>Seleccione el estado del territorio</option>
          <option v-for="([value, label]) in estadosDisponiblesReporte" :key="value" :value="value">
            {{ label }}
          </option>
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label">(GeoJson) Parte Completada</label>
        <input
          v-model="form.geoJsonFaltante"
          type="text"
          class="form-control"
          placeholder="Indique qué parte del territorio se completó (opcional)"
          readonly
        />
      </div>
      <div class="col-12">
        <label class="form-label">Notas Adicionales</label>
        <textarea
          v-model="form.notas"
          class="form-control"
          rows="4"
          placeholder="Agregue cualquier nota adicional sobre la salida"
        ></textarea>
      </div>
      <div class="mt-4">
        <label class="form-label"
          >(GeoJson) Seleccione en el mapa la parte realizada del territorio:</label
        >
        <div
          id="map"
          class="map-container"
        ></div>
      </div>
      <div class="col-12 d-flex justify-content-end gap-2 pt-2 mt-2 border-top">
        <button type="button" class="btn btn-secondary" @click="volver">
          Volver
        </button>
        <button type="submit" class="btn btn-success" :disabled="isCreatingReporte">
          {{ isCreatingReporte ? "Creando..." : "Crear Reporte" }}
        </button>
      </div>
    </form>
    </div>
  </div>
  <div v-else class="container py-4">
    <h1 class="mb-4">Reporte de Salida</h1>
    <div class="reporte-shell">
    <div class="row g-3 mb-2">
      <div class="col-md-6">
        <div class="dato-item">
          <strong class="dato-label">Estado del Territorio</strong>
          <div>
            {{
              territorioStore.getNombreEstado(Number(reporte.estadoTerritorio)) ||
              "N/A"
            }}
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="dato-item">
          <strong class="dato-label">Campaña</strong>
          <div>{{ territorioStore.getNombreTema(store.salida.tema) || "Sin Campaña" }}</div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="dato-item">
          <strong class="dato-label">GeoJson Faltante</strong>
          <div>{{ reporte.geoJsonFaltante || "Sin datos" }}</div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="dato-item">
          <strong class="dato-label">Notas Adicionales</strong>
          <div>{{ reporte.notas || "Sin Notas" }}</div>
        </div>
      </div>
    </div>
    <div class="mt-4">
      <label class="form-label"
        >Parte realizada del territorio (según el mapa):</label
      >
      <div
        id="map"
        class="map-container"
      ></div>
    </div>
    <div class="col-12 d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
      <button type="button" class="btn btn-secondary" @click="volver">
        Volver
      </button>
    </div>
    </div>
  </div>
</template>
<style scoped>
.form-shell,
.reporte-shell {
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

.dato-item {
  background: #ffffff;
  border: 1px solid #efe8f7;
  border-radius: 10px;
  padding: 0.6rem 0.75rem;
  height: 100%;
}

.dato-label {
  display: block;
  color: #5e3a7f;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 0.2rem;
}

.map-container {
  height: 400px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

@media (min-width: 768px) {
  .form-shell,
  .reporte-shell {
    padding: 1.25rem;
  }
}
</style>
