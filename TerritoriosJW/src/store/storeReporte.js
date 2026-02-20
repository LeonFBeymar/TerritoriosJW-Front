import { defineStore } from 'pinia';
import api from '../services/api';
export const useReporteStore = defineStore('reporte', {
    state: () => ({
        reportes: [],
        reporte: null,
    }),
    actions:{
        async fetchReportes(){
            try {
                const response = await api.getReportes();
                this.reportes = response.data;
            } catch (error) {
                console.error('Error fetching reportes:', error);
            }
        },
        async fetchReporte(id){
            try {
                const response = await api.getReporte(id);
                this.reporte = response.data;
            } catch (error) {
                console.error(`Error fetching reporte with id ${id}:`, error);
            }
        },
        async createReporte(data){
            try {
                const response = await api.createReporte(data);
                this.reportes.push(response.data);
            } catch (error) {
                console.error('Error creating reporte:', error);
            }
        },
        async updateReporte(id, data){
            try {
                const response = await api.updateReporte(id, data);
                const index = this.reportes.findIndex(r => r.id === id);
                if (index !== -1) {
                    this.reportes[index] = response.data;
                }
            } catch (error) {
                console.error(`Error updating reporte with id ${id}:`, error);
            }
        },
        getReporteByIdSalida(idSalida) {
            const reporte = this.reportes.findLast(r => r.salidaId == idSalida);
            return reporte;
        },
        async deleteReporte(id){
            try {
                await api.deleteReporte(id);
                this.reportes = this.reportes.filter(r => r.id !== id);
            } catch (error) {
                console.error(`Error deleting reporte with id ${id}:`, error);
            }
        }
    }
})