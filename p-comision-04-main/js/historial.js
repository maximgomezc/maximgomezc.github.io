import { obtenerDato } from "./modulos/gestorBD.js";
import { obtenerSesion, esAdministrador, actualizarInterfaz, configurarFormularioLogin } from "./modulos/gestorAuth.js";

window.onload = function () {
    actualizarInterfaz();
    configurarFormularioLogin();
    window.refrescarHistorial = mostrarHistorial;
    mostrarHistorial();
};

function mostrarHistorial() {
    const sesion = obtenerSesion();
    const contenedor = document.getElementById("historialContainer");

    if (!sesion) {
        contenedor.innerHTML = `
            <div class="alert alert-warning text-center" role="alert">
                Iniciá sesión para ver el historial de compras o ventas.
            </div>
        `;
        return;
    }

    const compras = obtenerDato("compras") || [];
    const esAdmin = esAdministrador();
    const comprasMostradas = esAdmin ? compras : compras.filter(c => c.usuario === sesion.nombreUsuario);
    const titulo = esAdmin ? "Historial de Ventas" : "Mi Historial de Compras";
    const subtitulo = esAdmin ? "Ventas Realizadas" : "Compras Realizadas";
    const rolTexto = esAdmin ? "Administrador" : "Usuario";
    const rolClase = esAdmin ? "warning text-dark" : "info text-dark";

    let filas = "";

    for (let i = 0; i < comprasMostradas.length; i++) {
        const compra = comprasMostradas[i];
        let productosHTML = "";

        for (let j = 0; j < compra.productos.length; j++) {
            const producto = compra.productos[j];
            const precio = Number(producto.precio || 0);
            const cantidad = Number(producto.cantidad || 0);

            productosHTML += `
                <li>${producto.nombre} — ${cantidad} unidad(es) x $${precio.toLocaleString("es-AR")}</li>
            `;
        }

        filas += `
            <tr>
                <td>${i + 1}</td>
                <td>${compra.fecha || "Sin fecha"}</td>
                ${esAdmin ? `<td>${compra.usuario || "Sin usuario"}</td>` : ""}
                <td>
                    <ul class="mb-0 ps-3">
                        ${productosHTML}
                    </ul>
                </td>
                <td>$${Number(compra.total || 0).toLocaleString("es-AR")}</td>
            </tr>
        `;
    }

    contenedor.innerHTML = `
        <div class="card shadow-sm mb-4">
            <div class="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                    <h2 class="text-success mb-1">${titulo}</h2>
                    <p class="text-secondary mb-0">${subtitulo}</p>
                </div>
                <span class="badge bg-${rolClase}">${rolTexto}</span>
            </div>
        </div>

        ${comprasMostradas.length === 0 ? `
            <div class="alert alert-secondary text-center" role="alert">
                No hay ventas/compras para mostrar por el momento.
            </div>
        ` : `
            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead class="table-dark">
                        <tr>
                            <th>#</th>
                            <th>Fecha</th>
                            ${esAdmin ? `<th>Usuario</th>` : ""}
                            <th>Productos</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filas}
                    </tbody>
                </table>
            </div>
        `}
    `;
}
