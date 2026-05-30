<script setup>
import { ref } from 'vue';
import { useUsuarioStore } from '../store/storeUsuarios';
import { useRouter } from 'vue-router';
const store = useUsuarioStore();
const router = useRouter();
const form = ref({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    repeatPassword: ''
});
const showPassword = ref(false);
const showRepeatPassword = ref(false);
const crearUsuario = async () => {
    await store.createUsuario({
        nombre: form.value.nombre,
        apellido: form.value.apellido, // Asumiendo que apellido es igual a nombre por simplicidad
        email: form.value.email,
        contrasenia: form.value.password,
        repetirContrasenia: form.value.repeatPassword
    });
    // Limpiar formulario o redirigir según necesidad
    form.value = { nombre: '', apellido: '', email: '', password: '', repeatPassword: '' };
    volver();
};
const volver = () => {
    router.push("/usuarios");
};
</script>
<template>
    <div class="container py-4">
        <h1 class="mb-2">Crear Conductor</h1>
        <p class="text-muted mb-4">Complete los datos para registrar un nuevo conductor.</p>
        <div class="form-shell">
        <form @submit.prevent="crearUsuario" class="row g-3">
            <div class="col-md-6">
                <label for="nombre" class="form-label"> <strong>Nombre *</strong></label>
                <input type="text" id="nombre" v-model="form.nombre" class="form-control" required />
            </div>
            <div class="col-md-6">
                <label for="apellido" class="form-label"> <strong>Apellido *</strong></label>
                <input type="text" id="apellido" v-model="form.apellido" class="form-control" required />
            </div>
            <div class="col-md-6">
                <label for="email" class="form-label"> <strong>Email *</strong></label>
                <input type="email" id="email" v-model="form.email" class="form-control" required />
            </div>
            <div class="col-md-6">
                <label for="password" class="form-label"> <strong>Contraseña *</strong></label>
                <div class="input-group">
                    <input :type="showPassword ? 'text' : 'password'" id="password" v-model="form.password" class="form-control" required autocomplete="new-password" />
                    <button type="button" class="btn btn-outline-secondary" @click="showPassword = !showPassword" tabindex="-1">
                        <span v-if="showPassword">Ocultar</span>
                        <span v-else>Ver</span>
                    </button>
                </div>
            </div>
            <div class="col-md-6">
                <label for="repeatPassword" class="form-label"> <strong>Repetir Contraseña *</strong></label>
                <div class="input-group">
                    <input :type="showRepeatPassword ? 'text' : 'password'" id="repeatPassword" v-model="form.repeatPassword" class="form-control" required autocomplete="new-password" />
                    <button type="button" class="btn btn-outline-secondary" @click="showRepeatPassword = !showRepeatPassword" tabindex="-1">
                        <span v-if="showRepeatPassword">Ocultar</span>
                        <span v-else>Ver</span>
                    </button>
                </div>
            </div>
                        <div class="col-12 d-flex justify-content-end gap-2 pt-2 mt-2 border-top">
                <button type="button" class="btn btn-secondary" @click="volver">Volver</button>
                <button type="submit" class="btn btn-primary">{{ store.usuarioLoadingSave ? 'Creando...' : 'Crear Usuario' }}</button>
            </div>
        </form>
                </div>
    </div>
</template>
<style scoped>
.form-shell {
    background: linear-gradient(180deg, #ffffff 0%, #faf8ff 100%);
    border: 1px solid #eadff7;
    border-radius: 14px;
    padding: 1rem;
    box-shadow: 0 0.35rem 0.8rem rgba(51, 21, 84, 0.08);
}

.form-label {
    margin-bottom: 0.35rem;
}

.form-control,
.form-select {
    border-radius: 10px;
}

@media (min-width: 768px) {
    .form-shell {
        padding: 1.25rem;
    }
}
</style>