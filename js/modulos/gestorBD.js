export { guardarDato, obtenerDato, eliminarDato };

function guardarDato(clave, datos) {
    localStorage.setItem(clave, JSON.stringify(datos));
}

function obtenerDato(clave) {
    const datos = localStorage.getItem(clave);
    return datos ? JSON.parse(datos) : null;
}

function eliminarDato(clave) {
    localStorage.removeItem(clave);
}