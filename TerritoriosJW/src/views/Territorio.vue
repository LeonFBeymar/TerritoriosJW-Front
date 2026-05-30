<script setup>
import { onMounted, ref } from "vue";
import { useTerritorioStore } from "../store/storeTerritorio";
import { useRouter } from "vue-router";

const store = useTerritorioStore();
const router = useRouter();
const territorio = ref(null);
const imagen = ref(null);
const downLoadingImage = ref(false);
onMounted(async () => {
  await store.fetchTerritorios();
  const territorioId = router.currentRoute.value.params.id;

  // 1. Obtenemos el territorio.
  // OJO: Si el store devuelve un objeto plano, no uses .value después.
  territorio.value = store.getTerritorioPorId(Number(territorioId));
  imagen.value = await store.getTerritorioImagen(territorioId);
  if (!imagen.value) {
    console.error("No se recibió URL de imagen");
    return;
  }

  const img = new Image();
  img.src = imagen.value; // Iniciamos la carga

  img.onload = () => {
    const bounds = [
      [0, 0],
      [img.height, img.width],
    ];

    const map = L.map("map", {
      crs: L.CRS.Simple,
      minZoom: -2,
    });

    L.imageOverlay(imagen.value, bounds).addTo(map);
    map.fitBounds(bounds);

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // --- LÓGICA PARA CARGAR EL GEOJSON EXISTENTE ---
    // Quitamos el .value de territorio si es un objeto directo del store

    if (territorio.value && territorio.value.geoJson) {
      try {
        const geoData = JSON.parse(territorio.value.geoJson);

        const existingLayer = L.geoJSON(geoData, {
          style: {
            color: "#000000",
            weight: 2,
            fillColor: "#000000",
            fillOpacity: 0.5,
          },
        });

        // Es vital añadir las capas al grupo drawnItems para que Leaflet.draw las reconozca
        existingLayer.eachLayer((layer) => {
          drawnItems.addLayer(layer);
        });

        // Opcional: ajustar el zoom para ver lo dibujado
        // map.fitBounds(drawnItems.getBounds());
      } catch (e) {
        console.error("Error parseando el GeoJSON guardado:", e);
      }
    }

    // Configuración del Control de Dibujo (Importante para que reconozca drawnItems)
    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems,
      },
      draw: {
        marker: false,
        circle: false,
        circlemarker: false,
      },
    });
    // map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, function (event) {
      const layer = event.layer;
      drawnItems.addLayer(layer);
      const geojson = layer.toGeoJSON();

      // Guardamos en el ref para el formulario
      drawnGeoJson.value = JSON.stringify(geojson.geometry);
      form.value.geoJson = drawnGeoJson.value;
    });

    // IMPORTANTE: Actualizar el GeoJSON si el usuario EDITA lo que ya existía
    map.on(L.Draw.Event.EDITED, function () {
      const layers = drawnItems.getLayers();
      if (layers.length > 0) {
        const combinedGeoJSON = layers[0].toGeoJSON(); // Toma la primera capa
        form.value.geoJson = JSON.stringify(combinedGeoJSON.geometry);
      }
    });
  };

  img.onerror = () => {
    console.error("Leaflet no pudo cargar la imagen");
  };
});

const getBadgeClass = (estado) => {
  const colors = {
    1: "bg-secondary", // En espera
    2: "bg-warning text-dark", // Pendiente
    3: "bg-info text-dark", // Pendiente Incompleto
    4: "bg-danger", // Incompleto
    5: "bg-success", // Completo
  };
  return colors[estado] || "bg-light text-dark";
};

const formatDateOnly = (value) => {
  if (!value) return "Sin registros";
  
  // Maneja DateOnly (yyyy-MM-dd) sin convertir zona horaria.
  const raw = String(value);
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("es-AR", { timeZone: "UTC" }).format(parsed);
};

const descargarImagen = async () => {
  downLoadingImage.value = true;
  const link = document.createElement("a");
  link.href = imagen.value;
  link.download = "territorio_" + territorio.value.nombre + ".png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  downLoadingImage.value = false;
};
</script>
<template>
  <div class="container py-4">
    <div class="mb-4 border-bottom pb-2">
      <h2 class="fw-bold text-secondary">
        Detalles del Territorio {{ store.territorioloading ? '...' : territorio?.nombre }}
      </h2>
    </div>

    <div class="row mb-4">
      <div v-if="store.territorioloading && !store.error" class="alert alert-info">
        <i class="bi bi-info-circle me-2"></i>Cargando territorio...
      </div>
      <div v-else-if="store.error" class="alert alert-danger">
        <i class="bi bi-exclamation-triangle me-2"></i>{{ store.error }}
      </div>
      <div v-else class="col-12">
        <div class="detalle-shell">
          <div class="row g-3">
            <div class="col-12 col-md-6 col-lg-4">
              <div class="dato-item h-100">
                <div class="dato-label">Estado del Territorio</div>
                <span :class="['badge', getBadgeClass(territorio?.estado)]">
                  {{ store.getNombreEstado(territorio?.estado) }}
                </span>
              </div>
            </div>

            <div class="col-12 col-md-6 col-lg-4">
              <div class="dato-item h-100">
                <div class="dato-label">Prioridad</div>
                <div>{{ store.getNombrePrioridad(territorio?.prioridad) }}</div>
              </div>
            </div>

            <div class="col-12 col-md-6 col-lg-4">
              <div class="dato-item h-100">
                <div class="dato-label">Ultima Campaña Realizada</div>
                <div>{{ store.getNombreTema(territorio?.tema) || "Sin Campaña" }}</div>
              </div>
            </div>

            <div class="col-12 col-md-6 col-lg-4">
              <div class="dato-item h-100">
                <div class="dato-label">Ultimo Turno Realizado</div>
                <div>{{ store.getNombreTurno(territorio?.turno) }}</div>
              </div>
            </div>

            <div class="col-12 col-md-6 col-lg-4">
              <div class="dato-item h-100">
                <div class="dato-label">Area</div>
                <div>{{ territorio?.area ? territorio.area + " m²" : "Sin Area" }}</div>
              </div>
            </div>

            <div class="col-12 col-md-6 col-lg-4">
              <div class="dato-item h-100">
                <div class="dato-label">Ultima Salida Realizada</div>
                <div>{{ formatDateOnly(territorio?.ultimaSalida) }}</div>
              </div>
            </div>

            <div class="col-12 col-md-6 col-lg-4">
              <div class="dato-item h-100">
                <div class="dato-label">Fecha de Inicio</div>
                <div>{{ formatDateOnly(territorio?.fechaInicio) }}</div>
              </div>
            </div>

            <div class="col-12 col-md-6 col-lg-4">
              <div class="dato-item h-100">
                <div class="dato-label">Fecha Completado</div>
                <div>{{ formatDateOnly(territorio?.fechaCompletado) }}</div>
              </div>
            </div>

            <div class="col-12">
              <div class="dato-item h-100">
                <div class="dato-label">Notas Adicionales</div>
                <div>{{ territorio?.atributo1 || "Sin Notas" }}</div>
              </div>
            </div>

            <div class="col-12">
              <div class="dato-item">
                <div class="dato-label">GeoJson</div>
                <code class="text-muted small">{{ territorio?.geoJson || "Sin datos" }}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mb-4 detalle-shell">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <div>
          <p class="fw-bold mb-0">
            Parte realizada del territorio (según el mapa):
          </p>
        </div>

        <div
          v-if="
            imagen && imagen !== 'https://localhost:44306/api/imagenes/0.png'
          "
        >
          <div class="d-flex align-items-center">
            <img
              :src="imagen"
              alt="miniatura"
              class="me-2 miniatura-territorio"
            />
            <button
              class="btn btn-primary btn-sm"
              @click="descargarImagen"
              aria-label="Descargar imagen"
            >
              {{ downLoadingImage ? "Descargando..." : "Descargar" }}
            </button>
          </div>
        </div>
      </div>

      <div
        id="map"
        class="border shadow-sm map-container"
      ></div>
    </div>

    <div class="d-flex justify-content-end">
      <button
        class="btn btn-secondary px-4 shadow-sm"
        @click="router.push('/territorios')"
      >
        Volver
      </button>
    </div>
  </div>
</template>
<style scoped>
.detalle-shell {
  background: linear-gradient(180deg, #ffffff 0%, #faf8ff 100%);
  border: 1px solid #eadff7;
  border-radius: 14px;
  padding: 1rem;
  box-shadow: 0 0.35rem 0.8rem rgba(51, 21, 84, 0.08);
}

.dato-item {
  background: #ffffff;
  border: 1px solid #efe8f7;
  border-radius: 10px;
  padding: 0.6rem 0.75rem;
}

.dato-label {
  color: #5e3a7f;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 0.2rem;
  font-weight: 600;
}

.miniatura-territorio {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.map-container {
  height: 450px;
  width: 100%;
  border-radius: 12px;
  background-color: #f8f9fa;
}

@media (min-width: 768px) {
  .detalle-shell {
    padding: 1.25rem;
  }
}
</style>
