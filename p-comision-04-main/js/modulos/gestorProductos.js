import { guardarDato, obtenerDato } from "./gestorBD.js";
import {mostrarMensaje} from "./gestorAuth.js";
import {eliminarDelCarrito} from "./gestorCarrito.js";

const PRODUCTOS_KEY = "productos";

const PRODUCTOS_INICIALES = [
    {
        id: 1,
        nombre: "Monitor Zowie XL2546K 24,5",
        descripcion: "El monitor gamer LED ZOWIE XL2546K Dark Grey es un monitor diseñado específicamente para jugadores profesionales que buscan un rendimiento excepcional y una experiencia de juego fluida.",
        precio: 800000,
        stock: 3,
        imagen: "img/240.webp",
        categoria: "Monitores"
    },
    {
        id: 2,
        nombre: "Monitor Samsung Odyssey G5 32",
        descripcion: "SAMSUNG - Monitor gamer Odyssey G5 de 32 pulgadas, WQHD (2560 x 1440), : Monitor gamer curvo Samsung Odyssey G5 LC32G55TQWNXZA de 32 pulgadas con panel VA WQHD (2560 x 1440), tasa de refresco de 144 Hz y tiempo de respuesta de 1 ms.",
        precio: 1460000,
        stock: 5,
        imagen: "img/curvo.webp",
        categoria: "Monitores"
    },
    {
        id: 3,
        nombre: "HyperX Cloud Alpha",
        descripcion: "HyperX Cloud Alpha - Auriculares para juegos, controladores de doble cámara, comodidad legendaria, marco de aluminio, micrófono desmontable, funciona en PC, PS4, PS5, Xbox One/Series X|S, Nintendo Switch y dispositivos móviles.",
        precio: 167500,
        stock: 8,
        imagen: "img/Auris.webp",
        categoria: "Periféricos"
    },
    {
        id: 4,
        nombre: "Mouse Razer Deathadder v3 Pro",
        descripcion: "El Razer DeathAdder V3 Pro es un mouse gaming inalámbrico con hasta 30000 DPI ajustables, sin iluminación y diseño ergonómico de segmento profesional. Pensado para gamers que valoran la libertad de movimiento sin sacrificar precisión ni respuesta, combina conectividad Inalámbrico 2.4 GHz con autonomía suficiente para largas sesiones. Ideal para shooters, MOBA y cualquier título que demande control y velocidad.",
        precio: 170000,
        stock: 15,
        imagen: "img/mouse.webp",
        categoria: "Periféricos"
    },
    {
        id: 5,
        nombre: "MSI 5080 White",
        descripcion: "MSI GeForce RTX 5080 16G Gaming Trio OC White 16GB GDDR7 PCIe 5X Boost: MSI GeForce RTX 5080 16G Gaming Trio OC White: tarjeta gráfica con GPU RTX 5080, 16GB GDDR7 (30Gbps/256-bit), configuración de fábrica con boost hasta 2745 MHz, interfaz PCIe.",
        precio: 2200000,
        stock: 1,
        imagen: "img/aorus.webp",
        categoria: "Placas de video"
    },
    {
        id: 6,
        nombre: "Ventus 5070 Ti",
        descripcion: "La MSI GeForce RTX 5070 Ti Ventus 3X OC es la opción ideal para quienes buscan un rendimiento excepcional en gráficos y juegos. Con 16GB de memoria GDDR7, esta tarjeta ofrece una frecuencia de reloj de hasta 2497 MHz y un bus de memoria de 256 bits. Compatible con la tecnología PCIe Gen 5, es capaz de manejar juegos y aplicaciones de alto rendimiento con una resolución máxima de 7680x4320. Además, su diseño con triple ventilador garantiza un rendimiento térmico eficiente.",
        precio: 1850000,
        stock: 2,
        imagen: "img/ventus5070.webp",
        categoria: "Placas de video"
    },
    {
        id: 7,
        nombre: "Asus Prime 5070 Ti",
        descripcion: "ASUS Prime GeForce RTX 5070 Ti 16GB GDDR7 PCIe 5.0 SFF-Ready: ASUS Prime RTX 5070 Ti con diseño 2.5-slot optimizado para builds compactos; enfriamiento eficiente y componentes para mayor longevidad bajo cargas intensas.",
        precio: 1970000,
        stock: 3,
        imagen: "img/ventus.webp",
        categoria: "Placas de video"
    },
    {
        id: 8,
        nombre: "MSI Prime 5080",
        descripcion: "MSI Prime 5080 16GB GDDR7 PCIe 5.0 SFF-Ready: MSI Prime RTX 5080 con diseño 2.5-slot optimizado para builds compactos; enfriamiento eficiente y componentes para mayor longevidad bajo cargas intensas.",
        precio: 2150000,
        stock: 4,
        imagen: "img/msiplaca.webp",
        categoria: "Placas de video"
    }
];

export {inicializarProductos,listarProductos,obtenerProductoPorId,agregarProducto,eliminarProducto,editarProducto};

function inicializarProductos() {
    const productosGuardados = obtenerDato(PRODUCTOS_KEY);
    if (productosGuardados === null) {
        guardarDato(PRODUCTOS_KEY, PRODUCTOS_INICIALES);
    }
}

function listarProductos() {
    const productosGuardados = obtenerDato(PRODUCTOS_KEY);
    if (productosGuardados === null) {
        return [];
    }
    return productosGuardados;
}

function obtenerProductoPorId(id) {
    const productos = listarProductos();
    for (let i = 0; i < productos.length; i++) {
        if (productos[i].id === id) {
            return productos[i];
        }
    }
    return null;
}

function agregarProducto(productoNuevo) {
    const productos = listarProductos();
    productos.push(productoNuevo);
    guardarDato(PRODUCTOS_KEY, productos);
    mostrarMensaje("El producto se agregó correctamente", "success");
}

function eliminarProducto(id) {
    const productos = listarProductos();
    const nuevosProductos = [];
    for (let i = 0; i < productos.length; i++) {
        if (productos[i].id !== id) {
            nuevosProductos.push(productos[i]);
        }
    }
    guardarDato(PRODUCTOS_KEY, nuevosProductos);
    eliminarDelCarrito(id);
}

function editarProducto(id, datosActualizados) {
    const productos = listarProductos();
    let modificado = false;

    for (let i = 0; i < productos.length; i++) {
        if (productos[i].id === id) {
            productos[i].precio = datosActualizados.precio;
            productos[i].stock = datosActualizados.stock;
            modificado = true;
        }
    }

    if (modificado) {
        guardarDato(PRODUCTOS_KEY, productos);
        mostrarMensaje("El producto se editó correctamente", "warning");
    }
}
