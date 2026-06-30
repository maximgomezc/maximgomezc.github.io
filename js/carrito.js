import { inicializarCarrito, obtenerCarrito, eliminarDelCarrito, actualizarCantidadDelCarrito, finalizarCompra} from "./modulos/gestorCarrito.js";
import { actualizarInterfaz, configurarFormularioLogin, esAdministrador } from "./modulos/gestorAuth.js";

window.onload = function () {
    inicializarCarrito();
    actualizarInterfaz();
    configurarFormularioLogin();
    if (esAdministrador()) {
        location.href = "index.html";
        return;
    }

    mostrarCarrito();
    configurarEventosCarrito();
};

function mostrarCarrito() {
    const contenedor = document.getElementById("productosCarrito");
    const resumen = document.getElementById("resumenCarrito");

    const carrito = obtenerCarrito();
    let totalCompra = 0;
    let totalProductos = 0;

    if (carrito.length === 0) {
        contenedor.innerHTML = `
            <div class="alert alert-secondary text-center" role="alert">
                Tu carrito está vacío.
            </div>`;
    } else {
        contenedor.innerHTML = "";

        for (let i = 0; i < carrito.length; i++) {
            const producto = carrito[i];
            totalCompra += producto.precio * producto.cantidad;
            totalProductos += producto.cantidad;

            contenedor.innerHTML += `
                <div class="card mb-3">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-3">
                                <img src="${producto.imagen}" class="img-carrito" alt="${producto.nombre}">
                            </div>
                            <div class="col">
                                <h5>${producto.nombre}</h5>
                                <p>${producto.descripcion}</p>
                                <div class="d-flex align-items-center gap-2">
                                    <button class="btn btn-sm btn-outline-secondary" type="button" name="disminuir" value="${producto.id}">-</button>
                                    <span>${producto.cantidad}</span>
                                    <button class="btn btn-sm btn-outline-secondary" type="button" name="aumentar" value="${producto.id}">+</button>
                                </div>
                            </div>
                            <div class="col-auto text-end">
                                <strong>$${(producto.precio * producto.cantidad).toLocaleString("es-AR")}</strong>
                                <br>
                                <button class="btn btn-sm btn-danger mt-2" type="button" name="eliminar" value="${producto.id}">
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>`;
        }
    }

    resumen.innerHTML = `
        <h3 class="mb-4">RESUMEN</h3>
        <div class="d-flex justify-content-between mb-3">
            <span>${totalProductos} producto(s)</span>
        </div>
        <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="fs-4">Total</span>
            <strong class="fs-2">$${totalCompra.toLocaleString("es-AR")}</strong>
        </div>
        <div class="d-grid gap-3 mt-4">
            <button class="btn btn-success" type="button" id="btnFinalizarCompra">
                <i class="bi bi-credit-card me-2"></i>
                Finalizar compra
            </button>
            <a href="listado-productos.html" class="btn btn-outline-success">Ver más productos</a>
        </div>`;
    configurarEventosCarrito();
}

function configurarEventosCarrito() {
    const contenedor = document.getElementById("productosCarrito");

    const botonesDisminuir = contenedor.querySelectorAll("button[name='disminuir']");
    for (let i = 0; i < botonesDisminuir.length; i++) {
        botonesDisminuir[i].onclick = function () {
            const id = Number(this.value);
            actualizarCantidadDelCarrito(id, -1);
            mostrarCarrito();
        };
    }

    const botonesAumentar = contenedor.querySelectorAll("button[name='aumentar']");
    for (let i = 0; i < botonesAumentar.length; i++) {
        botonesAumentar[i].onclick = function () {
            const id = Number(this.value);
            actualizarCantidadDelCarrito(id, 1);
            mostrarCarrito();
        };
    }

    const botonesEliminar = contenedor.querySelectorAll("button[name='eliminar']");
    for (let i = 0; i < botonesEliminar.length; i++) {
        botonesEliminar[i].onclick = function () {
            const id = Number(this.value);
            eliminarDelCarrito(id);
            mostrarCarrito();
        };
    }
    const btnFinalizarCompra = document.getElementById("btnFinalizarCompra");
    if (btnFinalizarCompra !== null) {
        btnFinalizarCompra.onclick = function () {
            const success = finalizarCompra();
            mostrarCarrito();
            if (success) {
                mostrarModalFinalizarCompra();
            }
        };
    }
}

function mostrarModalFinalizarCompra() {
    let container = document.getElementById("modalFinalizarCompra");

    container = document.createElement("div");
    container.id = "modalFinalizarCompra";
    document.body.appendChild(container);

    container.innerHTML = `
    <div class="modal fade" id="pedidoRealizadoModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content bg-dark text-light border-success">

                <div class="modal-header border-success">
                    <h5 class="modal-title text-success">
                        <i class="bi bi-check-circle-fill me-2"></i>
                        ¡Compra realizada!
                    </h5>
                    <button type="button"
                            class="btn-close btn-close-white"
                            data-bs-dismiss="modal">
                    </button>
                </div>

                <div class="modal-body text-center">

                    <i class="bi bi-box-seam display-1 text-success"></i>

                    <h4 class="mt-3">
                        Tu pedido fue confirmado correctamente.
                    </h4>

                    <p class="text-secondary mb-4">
                        Estamos preparando tu compra. En breve será despachada.
                    </p>

                    <div class="card bg-secondary-subtle text-dark mb-3">
                        <div class="card-body">
                            <h6 class="mb-2">Número de seguimiento</h6>
                            <h3 id="numeroTicket" class="text-success fw-bold"></h3>
                        </div>
                    </div>

                    <div class="alert alert-success mb-0">
                        <i class="bi bi-truck me-2"></i>
                        Tu pedido está en camino.
                    </div>

                </div>

                <div class="modal-footer border-success">
                    <button class="btn btn-success"
                            data-bs-dismiss="modal">
                        Aceptar
                    </button>
                </div>

            </div>
        </div>
    </div>`;

    const modalElement = container.querySelector('.modal');
    const modal = new bootstrap.Modal(modalElement);
    const ticketNumber = Math.floor(Math.random() * 900000) + 100000;
    const ticketElement = container.querySelector('#numeroTicket');
    ticketElement.textContent = ticketNumber;

    modal.show();
}