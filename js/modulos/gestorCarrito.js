import { guardarDato, obtenerDato } from "./gestorBD.js";
import { obtenerProductoPorId } from "./gestorProductos.js";
import { mostrarMensaje, obtenerSesion } from "./gestorAuth.js";

export {inicializarCarrito,obtenerCarrito,agregarAlCarrito,eliminarDelCarrito,actualizarCantidadDelCarrito,vaciarCarrito,calcularTotal,finalizarCompra};

const CLAVE_CARRITO = "carrito";
const CLAVE_COMPRAS = "compras";

function inicializarCarrito() {
    const datos = obtenerDato(CLAVE_CARRITO);

    if (datos === null) {
        guardarDato(CLAVE_CARRITO, []);
    }

    actualizarContadorCarrito();
}

function obtenerCarrito() {
    const datos = obtenerDato(CLAVE_CARRITO);

    if (datos === null) {
        return [];
    }

    return datos;
}

function guardarCarrito(carrito) {
    guardarDato(CLAVE_CARRITO, carrito);
}

function actualizarContadorCarrito() {
    const elementos = document.querySelectorAll(".carrito-contador");

    if (elementos.length === 0) {
        return;
    }

    const carrito = obtenerCarrito();

    let total = 0;

    for (let i = 0; i < carrito.length; i++) {
        total += Number(carrito[i].cantidad);
    }

    elementos.forEach(el => {
        if (total > 0) {
            el.textContent = total;
            el.classList.remove("d-none");
        } else {
            el.classList.add("d-none");
        }
    });
}

function agregarAlCarrito(idProducto) {
    const producto = obtenerProductoPorId(idProducto);

    if (producto === null) {
        return;
    }

    if (producto.stock <= 0) {
        mostrarMensaje("No hay stock disponible para este producto", "warning");
        return;
    }

    const carrito = obtenerCarrito();
    let productoEnCarrito = null;

    for (let i = 0; i < carrito.length; i++) {
        if (carrito[i].id === idProducto) {
            productoEnCarrito = carrito[i];
            break;
        }
    }

    const cantidadActual = productoEnCarrito ? productoEnCarrito.cantidad : 0;
    const nuevaCantidad = cantidadActual + 1;

    if (nuevaCantidad > producto.stock) {
        mostrarMensaje(`Solo quedan ${producto.stock} unidades disponibles`, "warning");
        return;
    }

    if (productoEnCarrito !== null) {
        productoEnCarrito.cantidad = nuevaCantidad;
        productoEnCarrito.stock = producto.stock;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            precio: producto.precio,
            imagen: producto.imagen,
            stock: producto.stock,
            cantidad: 1
        });
    }

    guardarCarrito(carrito);
    mostrarMensaje("El producto se agregó al carrito", "success");
    actualizarContadorCarrito();
}

function eliminarDelCarrito(idProducto) {
    const carrito = obtenerCarrito();
    const nuevoCarrito = [];

    for (let i = 0; i < carrito.length; i++) {
        if (carrito[i].id !== idProducto) {
            nuevoCarrito.push(carrito[i]);
        }
    }

    guardarCarrito(nuevoCarrito);
    actualizarContadorCarrito();
}

function actualizarCantidadDelCarrito(idProducto, numeroAgregarORestar) {
    const carrito = obtenerCarrito();
    const producto = obtenerProductoPorId(idProducto);

    if (producto === null) {
        return;
    }

    for (let i = 0; i < carrito.length; i++) {
        if (carrito[i].id === idProducto) {

            const stockDisponible = producto.stock;
            const nuevaCantidad = carrito[i].cantidad + numeroAgregarORestar;

            if (stockDisponible <= 0) {
                carrito[i].cantidad = 0;
                carrito[i].stock = 0;
                mostrarMensaje("No hay stock disponible para este producto", "warning");
            } else if (nuevaCantidad < 1) {
                carrito[i].cantidad = 1;
            } else if (nuevaCantidad > stockDisponible) {
                carrito[i].cantidad = stockDisponible;
                mostrarMensaje(`Solo quedan ${stockDisponible} unidades disponibles`, "warning");
            } else {
                carrito[i].cantidad = nuevaCantidad;
            }

            carrito[i].stock = stockDisponible;
            break;
        }
    }

    guardarCarrito(carrito);
    actualizarContadorCarrito();
}

function vaciarCarrito() {
    guardarCarrito([]);
    actualizarContadorCarrito();
}

function calcularTotal() {
    const carrito = obtenerCarrito();

    let total = 0;

    for (let i = 0; i < carrito.length; i++) {
        total += carrito[i].precio * carrito[i].cantidad;
    }

    return total;
}

function finalizarCompra() {
    const carrito = obtenerCarrito();

    if (carrito.length === 0) {
        mostrarMensaje("El carrito está vacío", "warning");
        return false;
    }

    const sesion = obtenerSesion();

    if (!sesion || sesion.rol !== "user") {
        mostrarMensaje("Solo los usuarios pueden finalizar una compra", "warning");
        return false;
    }

    const fecha = new Date().toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

    const productosComprados = [];

    for (let i = 0; i < carrito.length; i++) {
        const item = carrito[i];

        productosComprados.push({
            id: item.id,
            nombre: item.nombre,
            cantidad: item.cantidad,
            precio: Number(item.precio || 0)
        });
    }

    const compra = {
        usuario: sesion.nombreUsuario,
        fecha: fecha,
        productos: productosComprados,
        total: calcularTotal()
    };

    const comprasPrevias = obtenerDato(CLAVE_COMPRAS) || [];
    comprasPrevias.push(compra);

    guardarDato(CLAVE_COMPRAS, comprasPrevias);

    vaciarCarrito();
    actualizarContadorCarrito();

    mostrarMensaje("Compra finalizada correctamente", "success");

    return true;
}