import { defineStore } from 'pinia';
import api from '../services/api';
export const useReporteStore = defineStore('reporte', {
    state: () => ({
        reportes: [],
        reporte: null,
        reporteLoading: false,
        error: null,
    }),
    actions:{
        async fetchReportes(){
            this.reporteLoading = true;
            try {
                const response = await api.getReportes();
                
                this.reportes = response.data;
                this.reporteLoading = false;
                this.error = null;

            } catch (error) {
                console.error('Error fetching reportes:', error);
                this.reporteLoading = false;
                this.error = ' No se pudieron cargar los reportes.';
            }
        },
        async fetchReporte(id){
                this.reporteLoading = true;
            try {
                const response = await api.getReporte(id);
                this.reporte = response.data;
                this.reporteLoading = false;
                this.error = null;
            } catch (error) {
                console.error(`Error fetching reporte with id ${id}:`, error);
                this.error = ` No se pudo cargar el reporte con id ${id}.`;
                this.reporteLoading = false;
            }
        },
        async createReporte(data){
            this.reporteLoading = true;
            try {
                const response = await api.createReporte(data);
                this.reportes.push(response.data);
                this.reporteLoading = false;
                this.error = null;
            } catch (error) {
                console.error('Error creating reporte:', error);
                this.reporteLoading = false;
                this.error = ' No se pudo crear el reporte.';
            }
        },
        async updateReporte(id, data){
            this.reporteLoading = true;
            try {
                const response = await api.updateReporte(id, data);
                const index = this.reportes.findIndex(r => r.id === id);
                if (index !== -1) {
                    this.reportes[index] = response.data;
                }
                this.reporteLoading = false;
                this.error = null;
            } catch (error) {
                console.error(`Error updating reporte with id ${id}:`, error);
                this.reporteLoading = false;
                this.error = ` No se pudo actualizar el reporte con id ${id}.`;
            }
        },
        getReporteByIdSalida(idSalida) {
            const reporte = this.reportes.findLast(r => r.salidaId == idSalida);
            return reporte;
        },
        async deleteReporte(id){
            this.reporteLoading = true;
            try {
                await api.deleteReporte(id);
                this.reportes = this.reportes.filter(r => r.id !== id);
                this.reporteLoading = false;
                this.error = null;
            } catch (error) {
                console.error(`Error deleting reporte with id ${id}:`, error);
                this.reporteLoading = false;
                this.error = ` No se pudo eliminar el reporte con id ${id}.`;
            }
        }
    }
})