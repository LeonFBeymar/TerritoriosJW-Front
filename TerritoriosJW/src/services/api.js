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
    descargarExcelSalidas: () => api.get('/Salida/excel', { responseType: 'blob' }),
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
    //Salidas Semanal
    getSalidasSemanal: () => api.get('/SalidaSemanal'),
    getSalidaSemanal: (id) => api.get(`/SalidaSemanal/${id}`),
    createSalidaSemanal: (data) => api.post('/SalidaSemanal', data),
    updateSalidaSemanal: (id, data) => api.put(`/SalidaSemanal/${id}`, data),
    deleteSalidaSemanal: (id) => api.delete(`/SalidaSemanal/${id}`),


};
