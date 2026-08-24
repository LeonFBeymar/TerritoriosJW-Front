
import { defineStore } from 'pinia';
import api from '../services/api';

// La API responde 409 con un mensaje propio (lugar repetido, punto todavía vinculado, etc.).
// En esos casos conviene mostrar ese texto y no uno genérico.
const mensajeDeError = (error, mensajePorDefecto) => {
    const data = error?.response?.data;
    if (typeof data === 'string' && data.trim()) return data;
    if (data?.message) return data.message;
    if (data?.title) return data.title;
    return mensajePorDefecto;
};

// La API puede devolver el territorio o la fila de la relación; en ese último caso el id
// propio es el del vínculo y el del territorio viaja en territorioId.
const idDeTerritorio = (item) => item?.territorioId ?? item?.territorio?.id ?? item?.id;

export const usePuntoEncuentroStore = defineStore('puntoEncuentro', {
    state: () => ({
        puntos: [],
        punto: null,
        territoriosPorPunto: {}, // { [puntoId]: [territorio] } cargado a demanda
        error: null,
        puntoLoading: false,
        puntoLoadingSave: false,
        puntoLoadingDeleteId: null,
        territoriosLoadingId: null,
        vinculoLoadingKey: null, // `${puntoId}-${territorioId}` del vínculo en proceso
    }),
    actions: {
        async fetchPuntos() {
            this.puntoLoading = true;
            try {
                const response = await api.getPuntosEncuentro();
                this.puntos = response.data;
                this.puntoLoading = false;
                this.error = null;
            } catch (error) {
                console.error('Error fetching puntos de encuentro:', error);
                this.puntoLoading = false;
                this.error = ' No se pudieron cargar los puntos de encuentro.';
            }
        },
        async fetchPunto(id) {
            this.puntoLoading = true;
            try {
                const response = await api.getPuntoEncuentro(id);
                this.punto = response.data;
                this.puntoLoading = false;
                this.error = null;
            } catch (error) {
                console.error(`Error fetching punto de encuentro with id ${id}:`, error);
                this.puntoLoading = false;
                this.error = ` No se pudo cargar el punto de encuentro con id ${id}.`;
            }
        },
        async createPunto(data) {
            this.puntoLoadingSave = true;
            try {
                const response = await api.createPuntoEncuentro(data);
                this.puntos.push(response.data);
                this.puntoLoadingSave = false;
                this.error = null;
            } catch (error) {
                console.error('Error creating punto de encuentro:', error);
                this.puntoLoadingSave = false;
                this.error = mensajeDeError(error, ' No se pudo crear el punto de encuentro.');
            }
        },
        async updatePunto(id, data) {
            this.puntoLoadingSave = true;
            try {
                const response = await api.updatePuntoEncuentro(id, data);
                const index = this.puntos.findIndex(p => p.id === id);
                if (index !== -1) {
                    this.puntos[index] = response.data;
                }
                this.puntoLoadingSave = false;
                this.error = null;
            } catch (error) {
                console.error(`Error updating punto de encuentro with id ${id}:`, error);
                this.puntoLoadingSave = false;
                this.error = mensajeDeError(error, ` No se pudo actualizar el punto de encuentro con id ${id}.`);
            }
        },
        async deletePunto(id) {
            this.puntoLoadingDeleteId = id;
            try {
                await api.deletePuntoEncuentro(id);
                this.puntos = this.puntos.filter(p => p.id !== id);
                delete this.territoriosPorPunto[id];
                this.puntoLoadingDeleteId = null;
                this.error = null;
            } catch (error) {
                console.error(`Error deleting punto de encuentro with id ${id}:`, error);
                this.puntoLoadingDeleteId = null;
                this.error = mensajeDeError(
                    error,
                    ' No se pudo eliminar el punto de encuentro. Desvinculelo de sus territorios e intente de nuevo.'
                );
            }
        },
        async fetchTerritoriosDePunto(id) {
            this.territoriosLoadingId = id;
            try {
                const response = await api.getTerritoriosDePuntoEncuentro(id);
                this.territoriosPorPunto[id] = response.data;
                this.territoriosLoadingId = null;
                this.error = null;
            } catch (error) {
                console.error(`Error fetching territorios del punto de encuentro ${id}:`, error);
                this.territoriosLoadingId = null;
                this.error = ' No se pudieron cargar los territorios del punto de encuentro.';
            }
        },
        async fetchPuntosDeTerritorio(territorioId) {
            this.puntoLoading = true;
            try {
                const response = await api.getPuntosEncuentroDeTerritorio(territorioId);
                this.puntoLoading = false;
                this.error = null;
                return response.data;
            } catch (error) {
                console.error(`Error fetching puntos de encuentro del territorio ${territorioId}:`, error);
                this.puntoLoading = false;
                this.error = ' No se pudieron cargar los puntos de encuentro del territorio.';
                return [];
            }
        },
        async vincularTerritorio(id, territorioId) {
            this.vinculoLoadingKey = `${id}-${territorioId}`;
            try {
                await api.vincularPuntoEncuentro(id, territorioId);
                await this.fetchTerritoriosDePunto(id);
                this.vinculoLoadingKey = null;
                this.error = null;
            } catch (error) {
                console.error(`Error vinculando punto ${id} con territorio ${territorioId}:`, error);
                this.vinculoLoadingKey = null;
                this.error = mensajeDeError(error, ' No se pudo vincular el territorio al punto de encuentro.');
            }
        },
        async desvincularTerritorio(id, territorioId) {
            this.vinculoLoadingKey = `${id}-${territorioId}`;
            try {
                await api.desvincularPuntoEncuentro(id, territorioId);
                await this.fetchTerritoriosDePunto(id);
                this.vinculoLoadingKey = null;
                this.error = null;
            } catch (error) {
                console.error(`Error desvinculando punto ${id} del territorio ${territorioId}:`, error);
                this.vinculoLoadingKey = null;
                this.error = mensajeDeError(error, ' No se pudo desvincular el territorio del punto de encuentro.');
            }
        },
        // Reemplaza de una sola vez todos los puntos de un territorio.
        async sincronizarPuntosDeTerritorio(territorioId, puntoEncuentroIds) {
            this.puntoLoadingSave = true;
            try {
                await api.sincronizarPuntosEncuentroDeTerritorio(territorioId, puntoEncuentroIds);
                this.territoriosPorPunto = {};
                this.puntoLoadingSave = false;
                this.error = null;
            } catch (error) {
                console.error(`Error sincronizando puntos de encuentro del territorio ${territorioId}:`, error);
                this.puntoLoadingSave = false;
                this.error = mensajeDeError(error, ' No se pudieron guardar los puntos de encuentro del territorio.');
            }
        },
        getTerritoriosDePunto(id) {
            return this.territoriosPorPunto[id] || [];
        },
        getTerritorioIdsDePunto(id) {
            return this.getTerritoriosDePunto(id).map(idDeTerritorio);
        },
        estaVinculado(id, territorioId) {
            return this.getTerritorioIdsDePunto(id).includes(territorioId);
        },
    },
});
