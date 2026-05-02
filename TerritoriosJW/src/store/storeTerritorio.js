
import { defineStore } from 'pinia';
import api from '../services/api';

export const useTerritorioStore = defineStore('territorio', {
    state: () => ({
        territorios: [],
        territorio: null,
        error: null,
        territorioloading: false,
        territorioloadingSave: false,
        temas: {
            1: 'Predicación',
            2: 'Invitación a Reunión',
            3: 'Invitación a Asamblea',
            4: 'Invitación a Conmemoración',
            5: 'Nuevo Tratado',
            6: 'Conseguir Estudios',
            7: 'Otro Servicio',
            },
        estados:{
                1: 'En espera',
                2: 'Pendiente',
                3: 'Pendiente Incompleto',
                4: 'Incompleto',
                5: 'Completo',
            },
        estadosForReporte:{
                3: 'Pendiente Incompleto',
                4: 'Incompleto',
                5: 'Completo',
            },
        prioridades: {
                1: '(L-V)',
                2: '(S-D)',
                3: '(L-V-Mes)',
                4: '(S-D-Mes)',
                5: 'General',
            },

    }),     
    actions: {
        async fetchTerritorios() {
            this.territorioloading = true;
            try {
                const response = await api.getTerritorios();
                this.territorios = response.data;
                this.territorioloading = false;
                this.error = null;
            } catch (error) {
                console.error('Error fetching territorios:', error);
                this.territorioloading = false;
                this.error = ' No se pudieron cargar los territorios.';
            }
        },
        async fetchTerritorio(id) {
            this.territorioloading = true;
            try {
                const response = await api.getTerritorio(id);
                this.territorio = response.data;
                this.territorioloading = false;
                this.error = null;
            } catch (error) {
                console.error(`Error fetching territorio with id ${id}:`, error);
                this.territorioloading = false;
                this.error = ` No se pudo cargar el territorio con id ${id}.`;
            }
        },
        async createTerritorio(data) {
            this.territorioloadingSave = true;
            try {
                const response = await api.createTerritorio(data);
                this.territorios.push(response.data);
                this.territorioloadingSave = false;
                this.error = null;
            } catch (error) {
                console.error('Error creating territorio:', error);
                this.territorioloadingSave = false;
                this.error = ' No se pudo crear el territorio.';
            }
        },
        async updateTerritorio(id, data) {
            this.territorioloadingSave = true;
            try {
                const response = await api.updateTerritorio(id, data);
                const index = this.territorios.findIndex(t => t.id === id);
                if (index !== -1) {
                    this.territorios[index] = response.data;
                }
                this.territorioloadingSave = false;
                this.error = null;
            } catch (error) {
                console.error(`Error updating territorio with id ${id}:`, error);
                this.territorioloadingSave = false;
                this.error = ` No se pudo actualizar el territorio con id ${id}.`;
            }
        },
        async deleteTerritorio(id) {
            this.territorioloadingSave = true;
            try {
                await api.deleteTerritorio(id);
                this.territorios = this.territorios.filter(t => t.id !== id);
                this.territorioloadingSave = false;
                this.error = null;
            } catch (error) {
                console.error(`Error deleting territorio with id ${id}:`, error);
                this.territorioloadingSave = false;
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
                1: '(L-V)',
                2: '(S-D)',
                3: '(L-V-Mes)',
                4: '(S-D-Mes)',
                5: 'General',
            };            
            return prioridades[idPrioridad] || 'Desconocido';
        },
        getNombreTema(idTema) {
            const temas = {
                    1: 'Predicación',
                    2: 'Invitación a Reunión',
                    3: 'Invitación a  Asamblea',
                    4: 'Invitación a Conmemoración',
                    5: 'Nuevo Tratado',
                    6: 'Conseguir Estudios',
                    7: 'Otro Servicio',
                };
            return temas[idTema] || 'Desconocido';
        },
        getTerritorioPorId(id) {
            return this.territorios.find(t => t.id === id);
        },
        getTerritoriosDisponibles() {
            return this.territorios.filter(t => t.estado === 1 || t.estado === 3 || t.estado === 4 || t.prioridad === 5).sort((a , b ) => a.ultimaSalida.localeCompare(b.ultimaSalida)); // Ejemplo: filtrar por estado "En espera" o "Pendiente Incompleto" o "Incompleto"
        },
        
        getTerritorioImagen(id) {
            const rutaImagen = import.meta.env.VITE_LINK_FRONTEND + `/${id}.png`;
            console.log('Ruta de la imagen del territorio:', rutaImagen);
            return rutaImagen;
        },
    },
    
});