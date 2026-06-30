import {inicializarProductos, listarProductos, obtenerProductoPorId, editarProducto, eliminarProducto} from "./modulos/gestorProductos.js";
import {actualizarInterfaz, configurarFormularioLogin, esAdministrador} from "./modulos/gestorAuth.js";
import {agregarAlCarrito, inicializarCarrito} from "./modulos/gestorCarrito.js";

window.onload = function () {
    inicializarProductos();
    inicializarCarrito();
    actualizarInterfaz();
    configurarFormularioLogin();
    window.agregarAlCarrito = agregarAlCarrito;
    window.refrescarTablaProductos = mostrarProductos;
    mostrarProductos();
};

function mostrarProductos() {
    const productos = listarProductos();
    const esAdmin = esAdministrador();
    renderizarTablaProductos(productos, esAdmin);
}

function renderizarTablaProductos(productos, esAdmin) {
    const contenedor = document.getElementById("contenedorProductos");

    contenedor.innerHTML = "";

    const btnAdmin = (id) => `
        <button
            class="btn btn-warning btn-sm"
            data-admin-only="true"
            type="button"
            onclick="abrirEditarProducto(${id})"
        >
            <i class="bi bi-pencil-fill"></i>
            Editar producto
        </button>`;

    for (let i = 0; i < productos.length; i++) {
        const producto = productos[i];
        let stockClase = "bg-success";
        let stockTexto = `${producto.stock} en stock`;
        if (producto.stock === 0) {
            stockClase = "bg-danger";
            stockTexto = "Agotado";
        } else if (producto.stock <= 2) {
            stockClase = "bg-danger";
        } else if (producto.stock <= 5) {
            stockClase = "bg-warning text-dark";
        }
        const etiquetaStock = `<span class="fw-bold etiquetaStock ${stockClase}">${stockTexto}</span>`;

        contenedor.innerHTML += `
            <div class="col-12 col-md-6 col-lg-3">
                <div class="card h-100 bg-dark text-light border-success position-relative">
                    ${etiquetaStock}
                    <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title mb-3 text-center">${producto.nombre}</h5>
                        <div class="mt-auto d-grid gap-2">
                            <button class="btn btn-outline-success" data-bs-toggle="modal" data-bs-target="#modal${producto.id}" type="button">
                                Ir al producto
                            </button>
                            ${esAdmin ? '' : `<button class="btn btn-success soloUsuario" type="button" onclick="agregarAlCarrito(${producto.id})">
                                Agregar al carrito
                            </button>`}
                            ${esAdmin ? btnAdmin(producto.id) : ""}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="modal fade" id="modal${producto.id}" tabindex="-1" aria-labelledby="modalLabel${producto.id}" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content border-success">
                        <div class="modal-header border-success bg-success">
                            <h5 class="modal-title fw-bold" id="modalLabel${producto.id}">${producto.nombre}</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-4 text-center position-relative">
                                ${etiquetaStock}
                                <img src="${producto.imagen}" class="img-index-verMas rounded shadow" alt="${producto.nombre}">
                            </div>
                            <div class="mb-3">
                                <p class="text-secondary small mb-2">Descripción:</p>
                                <p class="fw-normal lh-lg">${producto.descripcion}</p>
                            </div>
                            <div class="alert alert-success alert-dismissible fade show" role="alert">
                                <span class="fw-bold fs-5">Precio: $${producto.precio.toLocaleString("es-AR")}</span>
                            </div>
                        </div>
                        <div class="modal-footer border-success">
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cerrar</button>
                            ${esAdmin ? '' : `<button type="button" class="btn btn-success soloUsuario" onclick="agregarAlCarrito(${producto.id})">
                                <i class="bi bi-cart-plus me-2"></i>Agregar al carrito
                            </button>`}
                        </div>
                    </div>
                </div>
            </div>
            
            
            
            `;
    }
}

function abrirEditarProducto(id) {
    const producto = obtenerProductoPorId(id);
    if (producto === null) return;

    const campoId = document.getElementById("editarId");
    const campoNombre = document.getElementById("editarNombre");
    const campoPrecio = document.getElementById("editarPrecio");
    const campoStock = document.getElementById("editarStock");
    const contenedorError = document.getElementById("editarProductoError");

    if (campoId) campoId.value = producto.id;
    if (campoNombre) campoNombre.value = producto.nombre;
    if (campoPrecio) campoPrecio.value = producto.precio;
    if (campoStock) campoStock.value = producto.stock;
    if (contenedorError) {
        contenedorError.classList.add("d-none");
        contenedorError.textContent = "";
    }

    new bootstrap.Modal(document.getElementById("editarProductoModal")).show();
}

window.abrirEditarProducto = abrirEditarProducto;

const formularioEditarIndex = document.getElementById("editarProductoForm");

formularioEditarIndex.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const campoId = document.getElementById("editarId");
    const campoPrecio = document.getElementById("editarPrecio");
    const campoStock = document.getElementById("editarStock");
    const contenedorError = document.getElementById("editarProductoError");

    const id = Number(campoId.value);
    const precioValor = Number(campoPrecio.value);
    const stockValor = Number(campoStock.value);

    if (precioValor < 0 || stockValor < 0) {
            contenedorError.textContent = "Precio y stock deben ser números válidos y no negativos.";
            contenedorError.classList.remove("d-none");
        return;
    }

    editarProducto(id, { precio: precioValor, stock: stockValor });
    mostrarProductos();

    new bootstrap.Modal(document.getElementById("editarProductoModal")).hide();
});


const btnEliminarIndex = document.getElementById("editarEliminarBtn");

btnEliminarIndex.addEventListener("click", function () {
    const id = Number(document.getElementById("editarId").value);

    if (!confirm("¿Estás seguro que querés eliminar este producto?")) {
        return;
    }

    eliminarProducto(id);
    mostrarProductos();

    new bootstrap.Modal(document.getElementById("editarProductoModal")).hide();
});
