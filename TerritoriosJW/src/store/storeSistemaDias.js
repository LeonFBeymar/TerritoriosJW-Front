
import { defineStore } from 'pinia';
import api from '../services/api';

// Abreviaturas usadas en SistemaDias.DiaTurno (Lu-PM, Ma-AM, ...), indexadas por Date.getDay().
const DIAS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

const mensajeDeError = (error, mensajePorDefecto) => {
    const data = error?.response?.data;
    if (typeof data === 'string' && data.trim()) return data;
    if (data?.message) return data.message;
    if (data?.title) return data.title;
    return mensajePorDefecto;
};

export const useSistemaDiasStore = defineStore('sistemaDias', {
    state: () => ({
        dias: [],
        error: null,
        sistemaDiasLoading: false,
        sistemaDiasLoadingSave: false,
    }),
    actions: {
        async fetchDias() {
            this.sistemaDiasLoading = true;
            try {
                const response = await api.getSistemaDias();
                this.dias = response.data;
                this.sistemaDiasLoading = false;
                this.error = null;
            } catch (error) {
                console.error('Error fetching sistema de dias:', error);
                this.sistemaDiasLoading = false;
                this.error = ' No se pudo cargar el sistema de días.';
            }
        },
        async fetchProgresoTerritorio(territorioId) {
            this.sistemaDiasLoading = true;
            try {
                const response = await api.getProgresoSistemaDias(territorioId);
                this.sistemaDiasLoading = false;
                this.error = null;
                return response.data;
            } catch (error) {
                console.error(`Error fetching progreso del sistema de dias del territorio ${territorioId}:`, error);
                this.sistemaDiasLoading = false;
                this.error = ' No se pudo cargar el sistema de días del territorio.';
                return [];
            }
        },
        async marcarDia(id, territorioId) {
            this.sistemaDiasLoadingSave = true;
            try {
                await api.marcarSistemaDia(id, territorioId);
                this.sistemaDiasLoadingSave = false;
                this.error = null;
                return true;
            } catch (error) {
                console.error(`Error marcando el dia ${id} para el territorio ${territorioId}:`, error);
                this.sistemaDiasLoadingSave = false;
                this.error = mensajeDeError(error, ' No se pudo registrar el día en el sistema de días.');
                return false;
            }
        },
        async desmarcarDia(id, territorioId) {
            this.sistemaDiasLoadingSave = true;
            try {
                await api.desmarcarSistemaDia(id, territorioId);
                this.sistemaDiasLoadingSave = false;
                this.error = null;
                return true;
            } catch (error) {
                console.error(`Error desmarcando el dia ${id} para el territorio ${territorioId}:`, error);
                this.sistemaDiasLoadingSave = false;
                this.error = mensajeDeError(error, ' No se pudo quitar el día del sistema de días.');
                return false;
            }
        },
        // Arma la clave del catálogo (ej: "Lu-PM") a partir de la fecha y el turno de la salida.
        getClaveDiaTurno(fecha, turno) {
            const dia = new Date(fecha);
            if (!fecha || Number.isNaN(dia.getTime())) return null;

            return `${DIAS[dia.getDay()]}-${Number(turno) === 1 ? 'PM' : 'AM'}`;
        },
        getDiaPorClave(clave) {
            if (!clave) return null;
            return this.dias.find(d => (d.diaTurno || '').toLowerCase() === clave.toLowerCase()) || null;
        },
        // Registra en el sistema de días el día+turno en que se hizo la salida.
        // Devuelve la clave usada, o null si ese día+turno no está en el catálogo.
        async registrarDiaDeSalida(salida, territorioId) {
            if (!salida || !territorioId) return null;

            if (this.dias.length === 0) {
                await this.fetchDias();
            }

            const clave = this.getClaveDiaTurno(salida.horaSalida, salida.turno);
            const dia = this.getDiaPorClave(clave);
            if (!dia) return null;

            const registrado = await this.marcarDia(dia.id, territorioId);
            return registrado ? clave : null;
        },
    },
});
