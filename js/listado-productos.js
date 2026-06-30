import {inicializarProductos, listarProductos, eliminarProducto, agregarProducto, obtenerProductoPorId, editarProducto} from "./modulos/gestorProductos.js";
import {esAdministrador, actualizarInterfaz, configurarFormularioLogin, mostrarMensaje} from "./modulos/gestorAuth.js";
import {agregarAlCarrito, inicializarCarrito} from "./modulos/gestorCarrito.js";
import {inicializarCategorias, listarCategorias, agregarCategoria, obtenerNombresCategorias} from "./modulos/gestorCategorias.js";

window.onload = function () {
    inicializarCategorias();
    inicializarProductos();
    inicializarCarrito();
    actualizarInterfaz();
    configurarFormularioLogin();
    window.refrescarTablaProductos = mostrarProductos;
    mostrarProductos();
    configurarFiltros();
    configurarAgregarProducto();
    configurarAgregarCategoria();
};

function configurarFiltros() {
    const inputBusqueda = document.getElementById("buscarProducto");
    const selectCategoria = document.getElementById("filtroCategoria");

    if (inputBusqueda !== null) {
        inputBusqueda.addEventListener("input", mostrarProductos);
    }

    if (selectCategoria !== null) {
        selectCategoria.addEventListener("change", mostrarProductos);
    }

    actualizarOpcionesCategorias();
}

function actualizarOpcionesCategorias() {
    const categorias = listarCategorias();
    const categoriasNombres = obtenerNombresCategorias(categorias);

    const selectFiltro = document.getElementById("filtroCategoria");
    selectFiltro.innerHTML = "";

    const opcionTodas = document.createElement("option");
    opcionTodas.value = "Todas las categorías";
    opcionTodas.textContent = "Todas las categorías";
    selectFiltro.appendChild(opcionTodas);

    categoriasNombres.forEach((nombre) => {
        const opcion = document.createElement("option");
        opcion.value = nombre;
        opcion.textContent = nombre;
        selectFiltro.appendChild(opcion);
    });

    const selectProducto = document.getElementById("nuevoCategoria");

    selectProducto.innerHTML = "";

    categoriasNombres.forEach((nombre) => {
        const opcion = document.createElement("option");
        opcion.value = nombre;
        opcion.textContent = nombre;
        selectProducto.appendChild(opcion);
    });
    
}

function obtenerProductosFiltrados() {
    const productos = listarProductos();
    const inputBusqueda = document.getElementById("buscarProducto");
    const selectCategoria = document.getElementById("filtroCategoria");

    let busqueda = "";
    let categoriaFiltro = "";

    if (inputBusqueda !== null) {
        busqueda = inputBusqueda.value.toLowerCase();
    }

    if (selectCategoria !== null) {
        categoriaFiltro = selectCategoria.value;
    }

    const productosFiltrados = [];

    for (let i = 0; i < productos.length; i++) {
        const producto = productos[i];
        
        const cumpleBusqueda =producto.nombre.toLowerCase().includes(busqueda) || producto.descripcion.toLowerCase().includes(busqueda);
        
        const cumpleCategoria =categoriaFiltro === "Todas las categorías" || producto.categoria === categoriaFiltro;

        if (cumpleBusqueda && cumpleCategoria) {
            productosFiltrados.push(producto);
        }
    }

    return productosFiltrados;
}

function mostrarProductos() {
    const productos = obtenerProductosFiltrados();
    const esAdmin = esAdministrador();
    renderizarTablaProductos(productos, esAdmin);
    configurarEventosTabla();
}

function renderizarTablaProductos(productos, esAdmin) {
    const tabla = document.getElementById("tablaProductos");

    tabla.innerHTML = "";

    for (let i = 0; i < productos.length; i++) {
        const producto = productos[i];
        let botonesAdmin = "";

        if (esAdmin) {
            botonesAdmin = `
                    <button class="btn btn-sm btn-outline-warning" type="button" name="editar" value="${producto.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" type="button" name="eliminar" value="${producto.id}">
                        <i class="bi bi-trash"></i>
                    </button>`;
        }

        tabla.innerHTML += `
            <tr>
                <th scope="row">${producto.id}</th>
                <td class="text-center">
                    <span class="text-truncate d-block" title="${producto.nombre}">${producto.nombre}</span>
                </td>
                <td class="text-center" style="max-width: 220px;">
                    <span class="text-truncate d-block" title="${producto.descripcion}">${producto.descripcion}</span>
                </td>
                <td class="text-center">$${producto.precio.toLocaleString("es-AR")}</td>
                <td class="text-center">${producto.stock}</td>
                <td class="text-center">
                    <img src="${producto.imagen}" class="img-fluid img-listado" alt="${producto.nombre}">
                </td>
                <td class="text-center">
                    ${esAdmin ? '' : `<button class="btn btn-sm btn-success soloUsuario" type="button" name="agregarAlCarrito" value="${producto.id}">
                        <i class="bi bi-cart-plus"></i>
                    </button>`}  
                    ${botonesAdmin}
                </td>
            </tr>`;
    }
}

function configurarEventosTabla() {
    const botonesEliminar = document.getElementsByName("eliminar");
    for (let i = 0; i < botonesEliminar.length; i++) {
        botonesEliminar[i].onclick = function () {
            const id = Number(this.value);
            eliminarProducto(id);
            mostrarProductos();
        };
    }

    const botonesEditar = document.getElementsByName("editar");
    for (let i = 0; i < botonesEditar.length; i++) {
        botonesEditar[i].onclick = function () {
            const id = Number(this.value);
            const producto = obtenerProductoPorId(id);

            const campoId = document.getElementById("editarId");
            const campoPrecio = document.getElementById("editarPrecio");
            const campoStock = document.getElementById("editarStock");
            const contenedorError = document.getElementById("editarProductoError");

            campoId.value = producto.id;
            campoPrecio.value = producto.precio;
            campoStock.value = producto.stock;
            
            contenedorError.classList.add("d-none");
            contenedorError.textContent = "";
            

            new bootstrap.Modal(document.getElementById("editarProductoModal")).show();
        };
    }

    const botonesAgregarAlCarrito = document.getElementsByName("agregarAlCarrito");
    for (let i = 0; i < botonesAgregarAlCarrito.length; i++) {
        botonesAgregarAlCarrito[i].onclick = function () {
            const id = Number(this.value);
            agregarAlCarrito(id);
        };
    }
}

const formularioEditar = document.getElementById("editarProductoForm");

formularioEditar.addEventListener("submit", function (evento) {
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

    editarProducto(id, {precio: precioValor, stock: stockValor});
    mostrarProductos();

    const editarModal = bootstrap.Modal.getInstance(document.getElementById("editarProductoModal")) || new bootstrap.Modal(document.getElementById("editarProductoModal"));
    editarModal.hide();
});

const btnEliminarModal = document.getElementById("editarEliminarBtn");

btnEliminarModal.addEventListener("click", function () {
    const id = Number(document.getElementById("editarId").value);

    if (!confirm("¿Estás seguro que querés eliminar este producto?")) {
        return;
    }

    eliminarProducto(id);
    mostrarProductos();

    new bootstrap.Modal(document.getElementById("editarProductoModal")).hide();
});


function configurarAgregarProducto() {
    const formulario = document.getElementById("agregarProductoForm");
    const errorContenedor = document.getElementById("agregarProductoError");

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        errorContenedor.classList.add("d-none");
        errorContenedor.textContent = "";

        const nombre = document.getElementById("nuevoNombre");
        const descripcion = document.getElementById("nuevoDescripcion");
        const precio = document.getElementById("nuevoPrecio");
        const stock = document.getElementById("nuevoStock");
        const categoria = document.getElementById("nuevoCategoria");
        const imagenInput = document.getElementById("nuevoImagen");

        const nombreValor = nombre.value.trim();
        const descripcionValor = descripcion.value.trim();
        const precioValor = Number(precio.value);
        const stockValor = Number(stock.value);
        const categoriaValor = categoria.value;

        if (nombreValor === "" || descripcionValor === "" || isNaN(precioValor) || precioValor < 0 || isNaN(stockValor) || stockValor < 0) {
            errorContenedor.textContent = "Completa todos los campos correctamente antes de guardar.";
            errorContenedor.classList.remove("d-none");
            return;
        }

        const procesarProducto = function(imagenValor) {
            const productos = listarProductos();
            const nuevoId = productos.length > 0 ? productos[productos.length - 1].id + 1 : 1;

            const productoNuevo = {
                id: nuevoId,
                nombre: nombreValor,
                descripcion: descripcionValor,
                precio: precioValor,
                stock: stockValor,
                imagen: imagenValor,
                categoria: categoriaValor
            };

            agregarProducto(productoNuevo);
            mostrarProductos(); 

            const agregarModal = bootstrap.Modal.getInstance(document.getElementById("agregarProductoModal")) || new bootstrap.Modal(document.getElementById("agregarProductoModal"));
            agregarModal.hide();

            formulario.reset();
            actualizarOpcionesCategorias();
        };

        const imagenValor = imagenInput.value.trim();

        if (imagenValor !== "") {
            procesarProducto(imagenValor);
        } else {
            procesarProducto("img/240.webp");
        }

    });

}

function configurarAgregarCategoria() {
    const formulario = document.getElementById("agregarCategoriaForm");
    const errorContenedor = document.getElementById("agregarCategoriaError");


    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        errorContenedor.classList.add("d-none");
        errorContenedor.textContent = "";

        const campoNombre = document.getElementById("nuevaCategoriaNombre");
        const nombreValor = campoNombre.value.trim();

        if (nombreValor === "") {
            errorContenedor.textContent = "Ingresá un nombre para la categoría.";
            errorContenedor.classList.remove("d-none");
            return;
        }

        const categoriaNueva = agregarCategoria(nombreValor);

        if (categoriaNueva === null) {
            errorContenedor.textContent = "Ingresá un nombre para la categoría.";
            errorContenedor.classList.remove("d-none");
            return;
        }

        actualizarOpcionesCategorias();
        mostrarProductos();
        mostrarMensaje("La categoría se agregó correctamente", "success");

        const agregarModal = bootstrap.Modal.getInstance(document.getElementById("agregarCategoriaModal")) || new bootstrap.Modal(document.getElementById("agregarCategoriaModal"));
        agregarModal.hide();

        formulario.reset();
    });
}


