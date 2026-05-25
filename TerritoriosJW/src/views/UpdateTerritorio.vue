<script setup>
import { onMounted, ref } from 'vue';
import { useTerritorioStore } from '../store/storeTerritorio';
import { useRouter } from 'vue-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';

const store = useTerritorioStore();
const router = useRouter();
const territorio = ref(null);
const error = ref(null);
const form = ref({
    geoJson: '',
    estado: 1,
    prioridad: 1,
    turno: 0,
    ultimaSalida: '',
    area: null,
    atributo1: '',
    tema: 1,
});
onMounted(async () => {
  await store.fetchTerritorios();
  const territorioId = router.currentRoute.value.params.id;
  territorio.value = store.getTerritorioPorId(Number(territorioId));

  if (territorio.value) {
    form.value.geoJson = territorio.value.geoJson || '';
    form.value.estado = territorio.value.estado;
    form.value.prioridad = territorio.value.prioridad;
    form.value.turno = territorio.value.turno ?? 0;
    form.value.ultimaSalida = territorio.value.ultimaSalida || '';
    form.value.area = territorio.value.area || null;
    form.value.atributo1 = territorio.value.atributo1 || '';
    form.value.tema = territorio.value.tema;
  } else {
    error.value = 'Territorio no encontrado';
        return;
  }

    const imagen = await store.getTerritorioImagen(territorioId);
    if (!imagen) {
        return;
    }

    const img = new Image();
    img.onload = () => {
        const bounds = [[0, 0], [img.height, img.width]];

        const map = L.map('map', {
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
                form.value.geoJson = '';
                return;
            }

            if (data.features.length === 1) {
                form.value.geoJson = JSON.stringify(data.features[0].geometry);
                return;
            }

            form.value.geoJson = JSON.stringify(data);
        };

        if (form.value.geoJson) {
            try {
                const parsedGeoJson = JSON.parse(form.value.geoJson);
                const existingLayer = L.geoJSON(parsedGeoJson, {
                    style: {
                        color: '#000000',
                        weight: 2,
                        fillColor: '#000000',
                        fillOpacity: 0.5,
                    },
                });

                existingLayer.eachLayer((layer) => {
                    drawnItems.addLayer(layer);
                });
            } catch (e) {
                console.error('Error parseando GeoJSON en edición:', e);
            }
        }

        const drawControl = new L.Control.Draw({
            edit: { featureGroup: drawnItems },
            draw: {
                polygon: {
                    shapeOptions: {
                        color: '#000000',
                        weight: 2,
                        fillColor: '#000000',
                        fillOpacity: 1,
                    },
                },
                rectangle: {
                    shapeOptions: {
                        color: '#000000',
                        weight: 2,
                        fillColor: '#000000',
                        fillOpacity: 0.5,
                    },
                },
                polyline: {
                    shapeOptions: {
                        color: '#000000',
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
                    actions: {
                        title: 'Cancelar dibujo',
                        text: 'Cancelar',
                    },
                    finish: {
                        title: 'Finalizar dibujo',
                        text: 'Finalizar',
                    },
                    undo: {
                        title: 'Eliminar el ultimo punto dibujado',
                        text: 'Deshacer',
                    },
                    buttons: {
                        polyline: 'Dibujar una linea (polilinea)',
                        polygon: 'Dibujar un poligono',
                        rectangle: 'Dibujar un rectangulo',
                        circle: 'Dibujar un circulo',
                        marker: 'Colocar un marcador',
                        circlemarker: 'Colocar un marcador circular',
                    },
                },
                handlers: {
                    circle: {
                        tooltip: {
                            start: 'Haga clic y arrastre para dibujar un circulo.',
                        },
                        radius: 'Radio',
                    },
                    circlemarker: {
                        tooltip: {
                            start: 'Haga clic en el mapa para colocar un marcador circular.',
                        },
                    },
                    marker: {
                        tooltip: {
                            start: 'Haga clic en el mapa para colocar un marcador.',
                        },
                    },
                    polygon: {
                        tooltip: {
                            start: 'Haga clic para comenzar a dibujar el area.',
                            cont: 'Haga clic para continuar dibujando el area.',
                            end: 'Haga clic en el primer punto para cerrar el area.',
                        },
                    },
                    polyline: {
                        error: '<strong>Error:</strong> los bordes no pueden cruzarse.',
                        tooltip: {
                            start: 'Haga clic para comenzar a dibujar la linea.',
                            cont: 'Haga clic para continuar dibujando la linea.',
                            end: 'Haga clic en el ultimo punto para finalizar la linea.',
                        },
                    },
                    rectangle: {
                        tooltip: {
                            start: 'Haga clic y arrastre para dibujar un rectangulo.',
                        },
                    },
                    simpleshape: {
                        tooltip: {
                            end: 'Suelte el raton para finalizar el dibujo.',
                        },
                    },
                },
            },
            edit: {
                toolbar: {
                    actions: {
                        save: {
                            title: 'Guardar cambios',
                            text: 'Guardar',
                        },
                        cancel: {
                            title: 'Cancelar edicion, descarta todos los cambios',
                            text: 'Cancelar',
                        },
                        clearAll: {
                            title: 'Limpiar todas las capas',
                            text: 'Limpiar todo',
                        },
                    },
                    buttons: {
                        edit: 'Editar elementos',
                        editDisabled: 'No hay elementos para editar',
                        remove: 'Eliminar elementos',
                        removeDisabled: 'No hay elementos para eliminar',
                    },
                },
                handlers: {
                    edit: {
                        tooltip: {
                            text: 'Arrastre los nodos o marcadores para editar los elementos.',
                            subtext: 'Haga clic en cancelar para deshacer los cambios.',
                        },
                    },
                    remove: {
                        tooltip: {
                            text: 'Haga clic en un elemento para eliminarlo.',
                        },
                    },
                },
            },
        };

        map.addControl(drawControl);    

        map.on(L.Draw.Event.CREATED, (event) => {
            drawnItems.addLayer(event.layer);
            syncGeoJsonFromLayers();
        });

        map.on(L.Draw.Event.EDITED, () => {
            syncGeoJsonFromLayers();
        });

        map.on(L.Draw.Event.DELETED, () => {
            syncGeoJsonFromLayers();
        });
    };

    img.onerror = () => {
        console.error('Leaflet no pudo cargar la imagen');
    };

    img.src = imagen;
});
const actualizarTerritorio = async () => {
  await store.updateTerritorio(territorio.value.id, {
    geoJson: form.value.geoJson,
    area: form.value.area ? Number(form.value.area) : null,
    estado: form.value.estado,
    prioridad: form.value.prioridad,
        turno: Number(form.value.turno),
    ultimaSalida: form.value.ultimaSalida,
    tema: form.value.tema,
    atributo1: form.value.atributo1,
  });

  router.push('/territorios');
};

</script>
<template>
    <div class="container py-4">
        <h1 class="mb-4 d-flex align-items-center">
            <span class="me-2"><i class="bi bi-pencil-square"></i></span>
            Editar Territorio <span v-if="territorio">: <strong>{{ store.territorioloading ? '...' : territorio.nombre }}</strong></span>
        </h1>
        <div v-if="store.territorioloading" class="alert alert-info">Cargando territorio...</div>
        <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
        <form v-else @submit.prevent="actualizarTerritorio" class="bg-white p-4 rounded shadow-sm">
            <div class="row g-3">
                <div class="col-md-6">
                    <label for="estado" class="form-label"><strong>Estado*</strong> <i class="bi bi-flag ms-1"></i></label>
                    <select id="estado" v-model.number="form.estado" class="form-select" required>
                        <option v-for="(label, value) in store.estados" :key="value" :value="value">{{ label }}</option>
                    </select>
                    <div class="form-text">Selecciona el estado actual del territorio.</div>
                </div>
                <div class="col-md-6">
                    <label for="prioridad" class="form-label"><strong>Prioridad*</strong> <i class="bi bi-exclamation-triangle ms-1"></i></label>
                    <select id="prioridad" v-model.number="form.prioridad" class="form-select" required>
                        <option v-for="(label, value) in store.prioridades" :key="value" :value="value">{{ label }}</option>
                    </select>
                    <div class="form-text">Define la prioridad de visita para este territorio.</div>
                </div>
                <div class="col-md-6">
                    <label for="ultimaSalida" class="form-label"><strong>Última Salida*</strong> <i class="bi bi-calendar-event ms-1"></i></label>
                    <input type="date" id="ultimaSalida" v-model="form.ultimaSalida" class="form-control" required/>
                    <div class="form-text">Fecha de la última salida realizada.</div>
                </div>
                <div class="col-md-6">
                    <label for="tema" class="form-label"><strong>Campaña*</strong></label>
                    <select id="tema" v-model.number="form.tema" class="form-select" required>
                        <option v-for="(label, value) in store.temas" :key="value" :value="value">{{ label }}</option>
                    </select>
                    <div class="form-text">Seleccione la campaña para el territorio.</div>
                </div>
                <div class="col-md-6">
                    <label for="turno" class="form-label"><strong>Turno*</strong></label>
                    <select id="turno" v-model.number="form.turno" class="form-select" required>
                        <option :value="0">Mañana</option>
                        <option :value="1">Tarde</option>
                    </select>
                    <div class="form-text">Define el turno del territorio.</div>
                </div>
                <div class="col-md-6">
                    <label for="atributo1" class="form-label"><strong>Notas adicionales</strong> <i class="bi bi-info-circle ms-1"></i></label>
                    <input type="text" id="atributo1" v-model="form.atributo1" class="form-control" />
                    <div class="form-text">Información adicional del territorio.</div>
                </div>
                <div class="col-md-6">
                    <label for="area" class="form-label"><strong>Área (m²)</strong> <i class="bi bi-rulers ms-1"></i></label>
                    <input type="number" id="area" v-model.number="form.area" class="form-control" min="0" />
                    <div class="form-text">Superficie aproximada del territorio.</div>
                </div>
                <div class="col-12">
                    <label for="geoJson" class="form-label"><strong>GeoJSON</strong> <i class="bi bi-geo-alt ms-1"></i></label>
                    <textarea id="geoJson" v-model="form.geoJson" class="form-control" rows="2" placeholder="Dibuja o edita en el mapa para generar el GeoJSON" readonly></textarea>
                    <div class="form-text">Dibuja, edita o elimina areas en el mapa para actualizar el GeoJSON.</div>
                </div>
                <div class="col-12">
                    <label class="form-label"><strong>Mapa del territorio</strong></label>
                    <div id="map" class="map-container"></div>
                </div>
            </div>
            <div class="mt-4 d-flex justify-content-end">
                <button type="submit" class="btn btn-primary px-4">
                    <i class="bi bi-save me-2"></i>{{store.territorioloadingSave ? 'Actualizando...' : 'Actualizar Cambios'}}
                </button>
                <button type="button" class="btn btn-secondary ms-2 px-4" @click="router.push('/territorios')">
                    <i class="bi bi-x-circle me-2"></i>Cancelar
                </button>
            </div>
        </form>
    </div>
</template>
<style scoped>
.map-container {
    width: 100%;
    height: 520px;
    border-radius: 8px;
    border: 1px solid #dee2e6;
    overflow: hidden;
}
</style>