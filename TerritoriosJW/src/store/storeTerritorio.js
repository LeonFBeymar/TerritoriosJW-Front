
import { defineStore } from 'pinia';
import api from '../services/api';

export const useTerritorioStore = defineStore('territorio', {
    state: () => ({
        territorios: [],
        territorio: null,
    }),     
    actions: {
        async fetchTerritorios() {
            try {
                const response = await api.getTerritorios();
                this.territorios = response.data;
                console.log('Territorios fetched successfully:', this.territorios);
            } catch (error) {
                console.error('Error fetching territorios:', error);
            }
        },
        async fetchTerritorio(id) {
            try {
                const response = await api.getTerritorio(id);
                this.territorio = response.data;
            } catch (error) {
                console.error(`Error fetching territorio with id ${id}:`, error);
            }
        },
        async createTerritorio(data) {
            try {
                const response = await api.createTerritorio(data);
                this.territorios.push(response.data);
            } catch (error) {
                console.error('Error creating territorio:', error);
            }
        },
        async updateTerritorio(id, data) {
            try {
                const response = await api.updateTerritorio(id, data);
                const index = this.territorios.findIndex(t => t.id === id);
                if (index !== -1) {
                    this.territorios[index] = response.data;
                }
            } catch (error) {
                console.error(`Error updating territorio with id ${id}:`, error);
            }
        },
        async deleteTerritorio(id) {
            try {
                await api.deleteTerritorio(id);
                this.territorios = this.territorios.filter(t => t.id !== id);
            } catch (error) {
                console.error(`Error deleting territorio with id ${id}:`, error);
            }
        },
        getNombreEstado(idEstado) {
            const estados = {
                1: 'En espera',
                2: 'Pendiente',
                3: 'Pendiente Incompleto',
                4: 'Incompleto',
                5: 'Completo',
            };
            return estados[idEstado] || 'Desconocido';
        },
        getTerritorioPorId(id) {
            return this.territorios.find(t => t.id === id);
        },
        getTerritoriosDisponibles() {
            return this.territorios.filter(t => t.estado === 1 || t.estado === 3 || t.estado === 4); // Ejemplo: filtrar por estado "En espera" o "Pendiente Incompleto" o "Incompleto"
        },
        getTerritorioImagen(id) {
            return api.getTerritorioImagen(id)
                .then(response => response.data)
                .catch(error => {
                    console.error(`Error fetching image for territorio with id ${id}:`, error);
                    return null;
                });
        },
    },
    
});