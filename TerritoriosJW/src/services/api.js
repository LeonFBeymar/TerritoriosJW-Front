import axios from 'axios';

const url = import.meta.env.VITE_BACKEND_URL || '';
const api = axios.create({
  baseURL: url, // Cambia esto por la URL de tu backend
});

export default {
    //Territorios
    getTerritorios: () => api.get('/Territorio'),
    getTerritorio: (id) => api.get(`/Territorio/${id}`),
    createTerritorio: (data) => api.post('/Territorio', data),
    updateTerritorio: (id, data) => api.put(`/Territorio/${id}`, data),
    deleteTerritorio: (id) => api.delete(`/Territorio/${id}`),
    getTerritorioImagen: (id) => api.get(`/Territorio/imagenurl/${id}`),

    //Salidas
    getSalidas: () => api.get('/Salida'),
    getSalida: (id) => api.get(`/Salida/${id}`),
    createSalida: (data) => api.post('/Salida', data),
    updateSalida: (id, data) => api.put(`/Salida/${id}`, data),
    deleteSalida: (id) => api.delete(`/Salida/${id}`),
    getDisponibilidadSalida: (params) => api.get('/Salida/disponibilidad', { params }),
    descargarExcelSalidas: () => api.get('/Salida/excel', { responseType: 'blob' }),
    descargarExcelReporte: (id) => api.get(`/Salida/excel-report/${id}`, { responseType: 'blob' }),
    //Usuarios
    getUsuarios: () => api.get('/Usuario'),
    getUsuario: (id) => api.get(`/Usuario/${id}`),
    createUsuario: (data) => api.post('/Usuario/Register', data),
    updateUsuario: (id, data) => api.put(`/Usuario/${id}`, data),
    deleteUsuario: (id) => api.delete(`/Usuario/${id}`),
    //Reportes
    getReportes: () => api.get('/ReporteSalida'),
    getReporte: (id) => api.get(`/ReporteSalida/${id}`),
    createReporte: (data) => api.post('/ReporteSalida', data),
    updateReporte: (id, data) => api.put(`/ReporteSalida/${id}`, data),
    deleteReporte: (id) => api.delete(`/ReporteSalida/${id}`),
    //Puntos de Encuentro
    getPuntosEncuentro: () => api.get('/PuntoEncuentro'),
    getPuntoEncuentro: (id) => api.get(`/PuntoEncuentro/${id}`),
    createPuntoEncuentro: (data) => api.post('/PuntoEncuentro', data),
    updatePuntoEncuentro: (id, data) => api.put(`/PuntoEncuentro/${id}`, data),
    deletePuntoEncuentro: (id) => api.delete(`/PuntoEncuentro/${id}`),
    getTerritoriosDePuntoEncuentro: (id) => api.get(`/PuntoEncuentro/${id}/territorios`),
    getPuntosEncuentroDeTerritorio: (territorioId) => api.get(`/PuntoEncuentro/territorio/${territorioId}`),
    vincularPuntoEncuentro: (id, territorioId) => api.post(`/PuntoEncuentro/${id}/territorios/${territorioId}`),
    desvincularPuntoEncuentro: (id, territorioId) => api.delete(`/PuntoEncuentro/${id}/territorios/${territorioId}`),
    sincronizarPuntosEncuentroDeTerritorio: (territorioId, data) => api.put(`/PuntoEncuentro/territorio/${territorioId}`, data),

    //Sistema de Días
    getSistemaDias: () => api.get('/SistemaDias'),
    getSistemaDia: (id) => api.get(`/SistemaDias/${id}`),
    createSistemaDia: (data) => api.post('/SistemaDias', data),
    updateSistemaDia: (id, data) => api.put(`/SistemaDias/${id}`, data),
    deleteSistemaDia: (id) => api.delete(`/SistemaDias/${id}`),
    getTerritoriosDeSistemaDia: (id) => api.get(`/SistemaDias/${id}/territorios`),
    getSistemaDiasDeTerritorio: (territorioId) => api.get(`/SistemaDias/territorio/${territorioId}`),
    getProgresoSistemaDias: (territorioId) => api.get(`/SistemaDias/progreso/${territorioId}`),
    getProgresoSistemaDiasGeneral: () => api.get('/SistemaDias/progreso'),
    marcarSistemaDia: (id, territorioId) => api.post(`/SistemaDias/${id}/territorios/${territorioId}`),
    desmarcarSistemaDia: (id, territorioId) => api.delete(`/SistemaDias/${id}/territorios/${territorioId}`),
    reiniciarSistemaDiasTerritorio: (territorioId) => api.post(`/SistemaDias/territorio/${territorioId}/reiniciar`),
    reiniciarSistemaDiasCompletados: () => api.post('/SistemaDias/reiniciar-completados'),

    //Salidas Semanal
    getSalidasSemanal: () => api.get('/SalidaSemanal'),
    getSalidaSemanal: (id) => api.get(`/SalidaSemanal/${id}`),
    createSalidaSemanal: (data) => api.post('/SalidaSemanal', data),
    updateSalidaSemanal: (id, data) => api.put(`/SalidaSemanal/${id}`, data),
    deleteSalidaSemanal: (id) => api.delete(`/SalidaSemanal/${id}`),


};
