import { defineStore } from "pinia";
import api from "../services/api";

export const useUsuarioStore = defineStore("usuario", {
    state: () => ({
        usuarios: [],
        usuario: null,
    }),
    actions: {
        async fetchUsuarios() {
            try {
                const response = await api.getUsuarios();
                this.usuarios = response.data;
            } catch (error) {
                console.error("Error fetching usuarios:", error);
            }
        },
        async fetchUsuario(id) {
            try {
                const response = await api.getUsuario(id);
                this.usuario = response.data;
            } catch (error) {
                console.error(`Error fetching usuario with id ${id}:`, error);
            }
        },
        async createUsuario(data) {
            try {
                const response = await api.createUsuario(data);
                this.usuarios.push(response.data);
            } catch (error) {
                console.error("Error creating usuario:", error);
            }
        },
        async updateUsuario(id, data) {
            try {
                const response = await api.updateUsuario(id, data);
                const index = this.usuarios.findIndex(usuario => usuario.id === id);
                if (index !== -1) {
                    this.usuarios[index] = response.data;
                }
            } catch (error) {
                console.error(`Error updating usuario with id ${id}:`, error);
            }
        },
        async deleteUsuario(id) {
            try {
                await api.deleteUsuario(id);
                this.usuarios = this.usuarios.filter(usuario => usuario.id !== id);
            } catch (error) {
                console.error(`Error deleting usuario with id ${id}:`, error);
            }
        },
        getUsuarioPorId(id) {
            return this.usuarios.find(u => u.id === id);
        },
    },
   
});