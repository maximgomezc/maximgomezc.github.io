import {guardarDato, obtenerDato, eliminarDato} from "./gestorBD.js";
export {obtenerUsuarios, guardarUsuario, eliminarUsuario, actualizarEstadoUsuario};

const CLAVE_USUARIOS = "usuarios";

function obtenerUsuarios() {
    const datos = obtenerDato(CLAVE_USUARIOS);
    return datos ?? [];
}

function guardarUsuario(usuario) {
    const usuarios = obtenerUsuarios();
    usuarios.push(usuario);
    guardarDato(CLAVE_USUARIOS, usuarios);
}

function eliminarUsuario(nombreUsuario) {
    const usuarios = obtenerUsuarios().filter(u => u.nombreUsuario !== nombreUsuario);
    guardarDato(CLAVE_USUARIOS, usuarios);
}

function actualizarEstadoUsuario(nombreUsuario, habilitado) {
    const usuarios = obtenerUsuarios();
    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].nombreUsuario === nombreUsuario) {
            usuarios[i].habilitado = habilitado;
            break;
        }
    }
    guardarDato(CLAVE_USUARIOS, usuarios);
}