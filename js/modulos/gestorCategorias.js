import {guardarDato, obtenerDato} from "./gestorBD.js";
export {inicializarCategorias, listarCategorias, agregarCategoria, obtenerCategoriaPorNombre, obtenerNombresCategorias};

const CATEGORIAS_KEY = "categorias";

const CATEGORIAS_INICIALES = [
    { id: 1, nombre: "Monitores" },
    { id: 2, nombre: "Periféricos" },
    { id: 3, nombre: "Placas de video" }
];

function inicializarCategorias() {
    const categoriasGuardadas = obtenerDato(CATEGORIAS_KEY);

    if (categoriasGuardadas === null) {
        guardarDato(CATEGORIAS_KEY, CATEGORIAS_INICIALES);
        return CATEGORIAS_INICIALES;
    }

    return categoriasGuardadas;
}

function listarCategorias() {
    const categoriasGuardadas = obtenerDato(CATEGORIAS_KEY);
    return categoriasGuardadas === null ? [] : categoriasGuardadas;
}

function obtenerCategoriaPorNombre(nombre) {
    const categorias = listarCategorias();
    const nombreNormalizado = nombre.trim().toLowerCase();

    return categorias.find((categoria) => categoria.nombre.trim().toLowerCase() === nombreNormalizado) || null;
}

function agregarCategoria(nombre) {
    const nombreLimpio = nombre.trim();

    if (nombreLimpio === "") {
        return null;
    }

    const categoriaExistente = obtenerCategoriaPorNombre(nombreLimpio);
    if (categoriaExistente) {
        return categoriaExistente;
    }

    const categorias = listarCategorias();
    const nuevaCategoria = {
        id: categorias.length > 0 ? categorias[categorias.length - 1].id + 1 : 1,
        nombre: nombreLimpio
    };

    categorias.push(nuevaCategoria);
    guardarDato(CATEGORIAS_KEY, categorias);

    return nuevaCategoria;
}

function obtenerNombresCategorias() {
    const categorias = listarCategorias();
    const nombres = [];

    for (let i = 0; i < categorias.length; i++) {
        nombres.push(categorias[i].nombre);
    }

    return nombres;
}
