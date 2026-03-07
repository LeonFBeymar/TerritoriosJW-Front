import { defineStore } from "pinia";
import api from "../services/api";

export const useUsuarioStore = defineStore("usuario", {
    state: () => ({
        usuarios: [],
        usuario: null,
        usuarioLoading: false,
        usuarioLoadingSave: false,
        error: null,
    }),
    actions: {
        async fetchUsuarios() {
            this.usuarioLoading = true;
            try {
                const response = await api.getUsuarios();
                this.usuarios = response.data;
                this.usuarioLoading = false;
                this.error = null;
            } catch (error) {
                console.error("Error fetching usuarios:", error);
                this.usuarioLoading = false;
                this.error = ' No se pudieron cargar los usuarios.';
            }
        },
        async fetchUsuario(id) {
            this.usuarioLoading = true;
            try {
                const response = await api.getUsuario(id);
                this.usuario = response.data;
                this.usuarioLoading = false;
                this.error = null;
            } catch (error) {
                console.error(`Error fetching usuario with id ${id}:`, error);
                this.usuarioLoading = false;
                this.error = ` No se pudo cargar el usuario con id ${id}.`;
            }
        },
        async createUsuario(data) {
            this.usuarioLoadingSave = true;
            try {
                const response = await api.createUsuario(data);
                this.usuarios.push(response.data);
                this.usuarioLoadingSave = false;
                this.error = null;
            } catch (error) {
                console.error("Error creating usuario:", error);
                this.usuarioLoadingSave = false;
                this.error = ' No se pudo crear el usuario.';
            }
        },
        async updateUsuario(id, data) {
            this.usuarioLoadingSave = true;
            try {
                const response = await api.updateUsuario(id, data);
                const index = this.usuarios.findIndex(usuario => usuario.id === id);
                if (index !== -1) {
                    this.usuarios[index] = response.data;
                }
                this.usuarioLoadingSave = false;
                this.error = null;
            } catch (error) {
                console.error(`Error updating usuario with id ${id}:`, error);
                this.usuarioLoadingSave = false;
                this.error = ` No se pudo actualizar el usuario con id ${id}.`;
            }
        },
        async deleteUsuario(id) {
            this.usuarioLoadingSave = true;
            try {
                await api.deleteUsuario(id);
                this.usuarios = this.usuarios.filter(usuario => usuario.id !== id);
                this.usuarioLoadingSave = false;
                this.error = null;
            } catch (error) {
                console.error(`Error deleting usuario with id ${id}:`, error);
                this.usuarioLoadingSave = false;
                this.error = ` No se pudo eliminar el usuario con id ${id}.`;
            }
        },
        getUsuarioPorId(id) {
            return this.usuarios.find(u => u.id === id);
        },
    },
   
});