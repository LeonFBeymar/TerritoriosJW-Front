
import { defineStore } from 'pinia';
import api from '../services/api';

export const useTerritorioStore = defineStore('territorio', {
    state: () => ({
        territorios: [],
        territorio: null,
        error: null,
    }),     
    actions: {
        async fetchTerritorios() {
            try {
                const response = await api.getTerritorios();
                this.territorios = response.data;
                console.log('Territorios fetched successfully:', this.territorios);
                this.error = null;
            } catch (error) {
                console.error('Error fetching territorios:', error);
                this.error = ' No se pudieron cargar los territorios.';
            }
        },
        async fetchTerritorio(id) {
            try {
                const response = await api.getTerritorio(id);
                this.territorio = response.data;
                this.error = null;
            } catch (error) {
                console.error(`Error fetching territorio with id ${id}:`, error);
                this.error = ` No se pudo cargar el territorio con id ${id}.`;
            }
        },
        async createTerritorio(data) {
            try {
                const response = await api.createTerritorio(data);
                this.territorios.push(response.data);
                this.error = null;
            } catch (error) {
                console.error('Error creating territorio:', error);
                this.error = ' No se pudo crear el territorio.';
            }
        },
        async updateTerritorio(id, data) {
            try {
                const response = await api.updateTerritorio(id, data);
                const index = this.territorios.findIndex(t => t.id === id);
                if (index !== -1) {
                    this.territorios[index] = response.data;
                }
                this.error = null;
            } catch (error) {
                console.error(`Error updating territorio with id ${id}:`, error);
                this.error = ` No se pudo actualizar el territorio con id ${id}.`;
            }
        },
        async deleteTerritorio(id) {
            try {
                await api.deleteTerritorio(id);
                this.territorios = this.territorios.filter(t => t.id !== id);
                this.error = null;
            } catch (error) {
                console.error(`Error deleting territorio with id ${id}:`, error);
                this.error = ` No se pudo eliminar el territorio con id ${id}.`;
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
        getNombrePrioridad(idPrioridad) {
            const prioridades = {
                1: '(Lu-Vi)',
                2: '(Sa-Do)',
                3: '(Lu-Vi-Mes)',
                4: '(Sa-Do-Mes)',
                5: 'General (Pub-Car-Rev-Reu)',
            };            return prioridades[idPrioridad] || 'Desconocido';
        },
        getTerritorioPorId(id) {
            return this.territorios.find(t => t.id === id);
        },
        getTerritoriosDisponibles() {
            return this.territorios.filter(t => t.estado === 1 || t.estado === 3 || t.estado === 4 || t.prioridad === 5); // Ejemplo: filtrar por estado "En espera" o "Pendiente Incompleto" o "Incompleto"
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