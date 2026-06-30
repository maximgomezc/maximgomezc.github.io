import {obtenerUsuarios, guardarUsuario, eliminarUsuario, actualizarEstadoUsuario } from "./modulos/gestorUsuarios.js";
import {esAdministrador, actualizarInterfaz, configurarFormularioLogin, mostrarMensaje } from "./modulos/gestorAuth.js";

window.onload = function () { 
    if (!esAdministrador()) 
        {location.href = "index.html"; 
            return;} 
            
    actualizarInterfaz();
    configurarFormularioLogin();
    setupForm();
    renderUsuarios();
};

function renderUsuarios() {
    const tabla = document.getElementById("tablaUsuarios");
    const usuarios = obtenerUsuarios();

    if (usuarios.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">
                    No hay usuarios registrados.
                </td>
            </tr>`;
        return;
    }

    tabla.innerHTML = "";

    for (let i = 0; i < usuarios.length; i++) {

        const usuario = usuarios[i];
        const estado = usuario.habilitado ? "Sí" : "No";
        const textoBoton = usuario.habilitado ? "Deshabilitar" : "Habilitar";
        const colorBoton = usuario.habilitado ? "warning" : "success";

        tabla.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td class="text-center">${usuario.nombreUsuario}</td>
                <td class="text-center">${usuario.rol}</td>
                <td class="text-center">${estado}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-${colorBoton} me-2" name="cambiarEstado" value="${usuario.nombreUsuario}"> ${textoBoton} </button>
                    <button class="btn btn-sm btn-danger" name="eliminarUsuario" value="${usuario.nombreUsuario}"> Eliminar </button>
                </td>
            </tr>`;
    }

    configurarEventosUsuarios();
}

function configurarEventosUsuarios() {

    const botonesEstado = document.getElementsByName("cambiarEstado");

    for (let i = 0; i < botonesEstado.length; i++) {
        botonesEstado[i].onclick = function () {

            const nombre = this.value;
            const usuarios = obtenerUsuarios();

            for (let j = 0; j < usuarios.length; j++) {

                if (usuarios[j].nombreUsuario === nombre) {

                    actualizarEstadoUsuario(nombre, !usuarios[j].habilitado);
                    renderUsuarios();

                    mostrarMensaje(!usuarios[j].habilitado ? "Usuario habilitado: " + nombre : "Usuario deshabilitado: " + nombre, "success");

                    return;
                }
            }
        };
    }

    const botonesEliminar = document.getElementsByName("eliminarUsuario");

    for (let i = 0; i < botonesEliminar.length; i++) {
        botonesEliminar[i].onclick = function () {

            const nombre = this.value;

            if (!confirm("¿Eliminar usuario " + nombre + "?")) {
                return;
            }

            eliminarUsuario(nombre);
            renderUsuarios();
            mostrarMensaje("Usuario eliminado: " + nombre, "danger");
        };
    }
}

function setupForm() {
    const form = document.getElementById('formNuevoUsuario');

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const nombre = document.getElementById('nuevoUsuario').value.trim();
        const clave = document.getElementById('nuevaClave').value;
        const rol = document.getElementById('nuevoRol').value;
        const habil = document.getElementById('nuevoHabilitado').checked;

        if (!nombre || !clave) {
            mostrarMensaje('Complete usuario y contraseña', 'danger');
            return;
        }

        const usuarios = obtenerUsuarios();
        if (usuarios.find(u => u.nombreUsuario === nombre)) {
            mostrarMensaje('Ya existe un usuario con ese nombre', 'danger');
            return;
        }

        guardarUsuario({ nombreUsuario: nombre, clave: clave, rol: rol, habilitado: habil });
        renderUsuarios();
        form.reset();
        mostrarMensaje('Usuario agregado: ' + nombre, 'success');
    });
}
