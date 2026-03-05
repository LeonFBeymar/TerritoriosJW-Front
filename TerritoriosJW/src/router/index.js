import {createRouter, createWebHistory} from 'vue-router';
import ListSalidas from '../views/ListSalidas.vue';
import ListTerritorio from '../views/ListTerritorio.vue';
import CrearTerritorio from '../views/CrearTerritorio.vue';
import CrearUsuario from '../views/CrearUsuario.vue';
import ListUsuarios from '../views/ListUsuarios.vue';
import CrearSalida from '../views/CrearSalida.vue';
import ReportarSalida from '../views/ReportarSalida.vue';
import Territorio from '../views/Territorio.vue';
import UpdateTerritorio from '../views/UpdateTerritorio.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: '/territorios',
            component: ListTerritorio
        },
        {
            path: '/salidas',
            name: 'ListSalidas',
            component: ListSalidas
        },
        {
            path: '/territorios',
            name: 'ListTerritorio',
            component: ListTerritorio
        },
        {
            path: '/crearterritorio',
            component: CrearTerritorio,
            name: 'CrearTerritorio',
        },
        {
            path: '/crear-usuario',
            component: CrearUsuario,
            name: 'CrearUsuario',
        },
        {
            path: '/usuarios',
            component: ListUsuarios,
            name: 'ListUsuarios',
        },
        {
            path: '/crear-salida',
            component: CrearSalida,
            name: 'CrearSalida',
        },
        {
            path: '/reportar-salida/:id/:territorioId',
            name: 'ReportarSalida',
            component: ReportarSalida,
        },
        {
            path: '/territorio/:id',
            name: 'Territorio',
            component: Territorio,
        },
        {
            path: '/update-terrirorio/:id',
            name: 'UpdateTerritorio',
            component: UpdateTerritorio,
        }
    ]
});

export default router;