import {guardarDato, obtenerDato, eliminarDato} from "./gestorBD.js";
import {obtenerUsuarios} from "./gestorUsuarios.js";
export {iniciarSesion,cerrarSesion,obtenerSesion,esAdministrador,actualizarInterfaz,configurarFormularioLogin,mostrarMensaje};

const CLAVE_SESION = "sebamax_session";

const LISTA_USUARIOS = [
  { nombreUsuario: "usuario", clave: "usuario", rol: "user" },
  { nombreUsuario: "admin", clave: "admin", rol: "admin" }
];

function obtenerSesion() {
  return obtenerDato(CLAVE_SESION);
}

function guardarSesion(usuario) {
  const datosSesion = {
    nombreUsuario: usuario.nombreUsuario,
    rol: usuario.rol
  };

  guardarDato(CLAVE_SESION, datosSesion);
}

function borrarSesion() {
  eliminarDato(CLAVE_SESION);
}

function esAdministrador() {
  return obtenerSesion()?.rol === "admin";
}

function iniciarSesion(nombreUsuario, clave) {
  let usuarioEncontrado = null;

  for (let i = 0; i < LISTA_USUARIOS.length; i++) {
    const usuarioActual = LISTA_USUARIOS[i];

    if (usuarioActual.nombreUsuario === nombreUsuario && usuarioActual.clave === clave) {
      usuarioEncontrado = usuarioActual;
        break;
      }
    }
    if (usuarioEncontrado === null) {
      const usuarios = obtenerUsuarios();
      for (let i = 0; i < usuarios.length; i++) {
        const u = usuarios[i];
        if (u.nombreUsuario === nombreUsuario && u.clave === clave) {
          if (u.habilitado === false) {
            return "deshabilitado";
          }
          usuarioEncontrado = { nombreUsuario: u.nombreUsuario, rol: u.rol};
          break;
        }
      }

    if (usuarioEncontrado === null) {
      return false;
  }}

  guardarSesion(usuarioEncontrado);
  return usuarioEncontrado;
}

function cerrarSesion() {
  borrarSesion();
  location.reload();
}

function actualizarInterfaz() {
  const sesion = obtenerSesion();
  const elementosSoloAdmin = document.querySelectorAll(".soloAdmin");
  const usuarioEsAdmin = esAdministrador();

  const contenedorBtnIngresar = document.getElementById("contenedorBtnIngresar");
  if (contenedorBtnIngresar !== null) {
    if (sesion === null) {
      contenedorBtnIngresar.innerHTML =
        '<button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#loginModal">' +
        "Ingresar</button>";
    } else {
      let colorInsignia = "info text-dark";

      if (usuarioEsAdmin) {
        colorInsignia = "warning text-dark";
      }

      contenedorBtnIngresar.innerHTML =
        '<span id="logoSesion" class="badge bg-' + colorInsignia + ' me-2" role="button" style="cursor:pointer;">' +
        sesion.rol.toUpperCase() + ": " + sesion.nombreUsuario +
        "</span>" +
        '<button id="logoutBtn" class="btn btn-danger btn-sm">Salir</button>';

      const logoSesion = document.getElementById("logoSesion");
      if (logoSesion !== null) {
        logoSesion.addEventListener("click", function () {
          location.href = "historial.html";
        });
      }

      const botonSalir = document.getElementById("logoutBtn");
      if (botonSalir !== null) {
        botonSalir.addEventListener("click", cerrarSesion);
      }
    }
  }

  for (let i = 0; i < elementosSoloAdmin.length; i++) {
    if (usuarioEsAdmin === true) {
      elementosSoloAdmin[i].classList.remove("d-none");
    } else {
      elementosSoloAdmin[i].classList.add("d-none");
    }
  }

  const elementosSoloUsuario = document.querySelectorAll('.soloUsuario');
  for (let i = 0; i < elementosSoloUsuario.length; i++) {
    if (usuarioEsAdmin === false) {
      elementosSoloUsuario[i].classList.remove('d-none');
    } else {
      elementosSoloUsuario[i].classList.add('d-none');
    }
  }

  const elementosSinSesion = document.getElementById("authWarning")
  if (elementosSinSesion !== null) {
    if (sesion === null) {
      elementosSinSesion.classList.remove("d-none");
    } else {
      elementosSinSesion.classList.add("d-none");
    }
  }
}

function configurarFormularioLogin() {
  const formulario = document.getElementById("loginForm");

  if (formulario === null) {
    return;
  }

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const campoUsuario = document.getElementById("usuario");
    const campoClave = document.getElementById("password");
    const contenedorError = document.getElementById("loginError");

    const nombreUsuario = campoUsuario.value.trim();
    const clave = campoClave.value;

    const resultado = iniciarSesion(nombreUsuario, clave);
    
    if (resultado === "deshabilitado") {
        mostrarMensaje("Usuario deshabilitado por la administración. Si desea acceder al sitio, contacte al soporte.","danger");
        return;
    }

    if (resultado === false) {
        contenedorError.classList.remove("d-none");
        return;
    }

    const elementoModal = document.getElementById("loginModal");
    const instanciaModal = bootstrap.Modal.getInstance(elementoModal);

    if (instanciaModal !== null) {
      instanciaModal.hide();
    }

    actualizarInterfaz();
    if (window.refrescarTablaProductos !== undefined) {
      window.refrescarTablaProductos();
    }
    if (window.refrescarHistorial !== undefined) {
      window.refrescarHistorial();
    }

    let tipoDeMensaje = "success";

    if (resultado.rol === "admin") {
      tipoDeMensaje = "warning";
    }

    mostrarMensaje("Bienvenido " + resultado.nombreUsuario, tipoDeMensaje);
  });

  const campoUsuario = document.getElementById("usuario");
  const campoClave = document.getElementById("password");

  if (campoUsuario !== null) {
    campoUsuario.addEventListener("input", ocultarError);
  }

  if (campoClave !== null) {
    campoClave.addEventListener("input", ocultarError);
  }
}

function ocultarError() {
  const contenedorError = document.getElementById("loginError");

  if (contenedorError !== null) {
    contenedorError.classList.add("d-none");
  }
}

function mostrarMensaje(mensaje, tipo) {
  if (tipo === undefined) {
    tipo = "success";
  }

  let contenedorMensajes = document.getElementById("toastContainer");

  if (contenedorMensajes === null) {
    contenedorMensajes = document.createElement("div");
    contenedorMensajes.id = "toastContainer";
    contenedorMensajes.className = "toast-container position-fixed bottom-0 end-0 p-3";
    document.body.appendChild(contenedorMensajes);
  }

  let colorMensaje = "text-bg-success";

  if (tipo === "warning") {
    colorMensaje = "text-bg-warning";
  } else if (tipo === "danger") {
    colorMensaje = "text-bg-danger";
  }

  const mensajeToast = document.createElement("div");
  mensajeToast.className = "toast " + colorMensaje + " border-0";
  mensajeToast.innerHTML =
    '<div class="d-flex">' +
    '<div class="toast-body">' + mensaje + "</div>" +
    '<button class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>' +
    "</div>";

  contenedorMensajes.appendChild(mensajeToast);

  const instanciaToast = new bootstrap.Toast(mensajeToast, { delay: 3000 });
  instanciaToast.show();

  mensajeToast.addEventListener("hidden.bs.toast", function () {
    mensajeToast.remove();
  });
}