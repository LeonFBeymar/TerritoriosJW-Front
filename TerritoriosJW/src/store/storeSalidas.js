        
import { defineStore } from 'pinia';
import api from '../services/api';

export const useSalidaStore = defineStore('salida', {
    state: () => ({
        salidas: [],
        salida: null,
        salidasSemanales: [],
        cargandoExcel: false,
        error: null,
    }),
    actions: {
        async fetchSalidas() {
            try {
                const response = await api.getSalidas();
                this.salidas = response.data;
                this.error = null;
            } catch (error) {
                console.error('Error fetching salidas:', error);
                this.error = ' No se pudieron cargar las salidas.';
            }
        },
        async fetchSalida(id) {
            try {
                const response = await api.getSalida(id);
                this.salida = response.data;
                this.error = null;
            } catch (error) {
                this.error = ` No se pudo cargar la salida con id ${id}.`;
                console.error(`Error fetching salida with id ${id}:`, error);
            }
        },
        async createSalida(data) {
            try {
                const response = await api.createSalida(data);
                this.salidas.push(response.data);
                this.error = null;
            } catch (error) {
                console.error('Error creating salida:', error);
                this.error = ' No se pudo crear la salida.';
            }
        },
        async updateSalida(id, data) {
            try {
                const response = await api.updateSalida(id, data);
                const index = this.salidas.findIndex(s => s.id === id);
                if (index !== -1) {
                    this.salidas[index] = response.data;
                }
                this.error = null;
            } catch (error) {
                console.error(`Error updating salida with id ${id}:`, error);
                this.error = ` No se pudo actualizar la salida con id ${id}.`;
            }
        },
        async deleteSalida(id) {
            try {
                await api.deleteSalida(id);
                this.salidas = this.salidas.filter(s => s.id !== id);
                this.error = null;
            } catch (error) {
                this.error = ` No se pudo eliminar la salida con id ${id}.`;
                console.error(`Error deleting salida with id ${id}:`, error);
            }
        },
        async fetchSalidasSemanal() {
            try {
                const response = await api.getSalidasSemanal();
                this.salidasSemanales = response.data;
                this.error = null;
            } catch (error) {
                console.error('Error fetching salidas semanal:', error);
                this.error = ' No se pudieron cargar las salidas semanal.';
            }
        },
        async fetchSalidaSemanal(id) {
            try {
                const response = await api.getSalidaSemanal(id);
                this.error = null;
                return response.data;
            } catch (error) {
                console.error(`Error fetching salida semanal with id ${id}:`, error);
                this.error = ` No se pudo cargar la salida semanal con id ${id}.`;
                return null;
            }
        },
        async createSalidaSemanal(data) {
            try {
                const response = await api.createSalidaSemanal(data);
                this.salidasSemanales.push(response.data);
                this.error = null;
            } catch (error) {
                console.error('Error creating salida semanal:', error);
                this.error = ' No se pudo crear la salida semanal.';
            }
        },
        getSalidaSemanalPorId(id) {
            return this.salidasSemanales.find(s => s.id === id);
        },
         async descargarExcelSalidas() {
            try {
                this.cargandoExcel = true;
                // 1. Llamada al servicio que ya configuraste con { responseType: 'blob' }
                const response = await api.descargarExcelSalidas();

                // 2. Crear el objeto URL
                const url = window.URL.createObjectURL(new Blob([response.data]));
                
                // 3. Crear link temporal y disparar descarga
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'salidas.xlsx');
                document.body.appendChild(link);
                
                link.click(); // Esto inicia la descarga en el navegador

                // 4. Limpieza
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url); 
                this.error = null;
            } catch (error) {
                console.error('Error al descargar:', error);
                alert('No se pudo descargar el archivo');
                this.error = ' No se pudo descargar el archivo.';
            } finally {
                this.cargandoExcel = false;
            }
        }
    }
});