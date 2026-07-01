// script.js
// Lógica de la Feria de Emprendedores: validación, eventos, buscador y persistencia en localStorage

// Elementos del DOM
const formulario = document.getElementById("formulario-postulacion-form");
const listaPostulantes = document.getElementById("lista-postulantes");
const mensajeVacio = document.getElementById("mensaje-vacio");
const buscadorPostulantes = document.getElementById("buscador-postulantes");

const CLAVE_ALMACENAMIENTO = "postulantesFeria";

// Persistencia local para guardar a los postulantes.

function obtenerPostulantes() {
  const datosGuardados = localStorage.getItem(CLAVE_ALMACENAMIENTO);
  return datosGuardados ? JSON.parse(datosGuardados) : [];
}

function guardarPostulantes(postulantes) {
  localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(postulantes));
}

// Filtro para el buscador en el apartado de postulantes.
// Filtra los postulantes según lo escrito en el buscador.
function filtrarPostulantes(postulantes, terminoBusqueda) {
  const termino = terminoBusqueda.trim().toLowerCase();
  if (termino === "") return postulantes;

  return postulantes.filter((postulante) => {
    const nombreCoincide = postulante.nombre.toLowerCase().includes(termino);
    const proyectoCoincide = postulante.proyecto.toLowerCase().includes(termino);
    return nombreCoincide || proyectoCoincide;
  });
}

function renderizarPostulantes() {
  const todosLosPostulantes = obtenerPostulantes();
  const terminoBusqueda = buscadorPostulantes.value;
  const postulantesAMostrar = filtrarPostulantes(todosLosPostulantes, terminoBusqueda);

  listaPostulantes.innerHTML = "";

  // Si no hay postulantes, se muestra un mensaje de que no se encontraron postulantes.
  if (postulantesAMostrar.length === 0) {
    mensajeVacio.style.display = "block";
    mensajeVacio.textContent =
      todosLosPostulantes.length === 0
        ? "Aún no hay postulantes registrados."
        : "No se encontraron postulantes que coincidan con tu búsqueda.";
  } else {
    mensajeVacio.style.display = "none";
  }

  postulantesAMostrar.forEach((postulante) => {
    const item = document.createElement("li");

    const infoPostulante = document.createElement("div");
    infoPostulante.classList.add("info-postulante");

    const nombreProyecto = document.createElement("strong");
    nombreProyecto.textContent = `${postulante.proyecto} — ${postulante.nombre}`;

    const detalle = document.createElement("small");
    detalle.textContent = `Categoría: ${postulante.categoria} | ${postulante.correo}`;

    infoPostulante.append(nombreProyecto, detalle);

    const botonEliminar = document.createElement("button");
    botonEliminar.textContent = "Eliminar";
    botonEliminar.classList.add("boton-eliminar");
    botonEliminar.setAttribute("data-id", postulante.id);

    item.append(infoPostulante, botonEliminar);
    listaPostulantes.append(item);
  });
}

// Con nuestra persistencia al momento de cargar la pagina se mostraran los postulantes guardados.
document.addEventListener("DOMContentLoaded", renderizarPostulantes);

// Filtro de postulantes en tiempo real.
buscadorPostulantes.addEventListener("input", renderizarPostulantes);

// Validacion a todos los campos del formulario.

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

const validadores = {
  nombre(valor) {
    if (valor.trim() === "") return "El nombre es obligatorio.";
    if (valor.trim().length < 3) return "Debe tener al menos 3 caracteres.";
    if (!REGEX_SOLO_LETRAS.test(valor.trim())) return "Solo se permiten letras.";
    return "";
  },
  correo(valor) {
    if (valor.trim() === "") return "El correo es obligatorio.";
    if (!REGEX_CORREO.test(valor.trim())) return "Formato de correo inválido.";
    return "";
  },
  "confirmar-correo"(valor, correoOriginal) {
    if (valor.trim() === "") return "Debes confirmar el correo.";
    if (valor.trim() !== correoOriginal.trim()) return "Los correos no coinciden.";
    return "";
  },
  proyecto(valor) {
    if (valor.trim() === "") return "El nombre del proyecto es obligatorio.";
    if (valor.trim().length < 3) return "Debe tener al menos 3 caracteres.";
    return "";
  },
  categoria(valor) {
    if (valor === "") return "Debes seleccionar una categoría.";
    return "";
  },
};

function validarCampo(idCampo) {
  const campo = document.getElementById(idCampo);
  const spanError = document.getElementById(`error-${idCampo}`);
  const correoActual = document.getElementById("correo").value;

  const mensaje = validadores[idCampo](campo.value, correoActual);

  if (mensaje) {
    campo.classList.add("campo-invalido");
    campo.classList.remove("campo-valido");
  } else {
    campo.classList.add("campo-valido");
    campo.classList.remove("campo-invalido");
  }
  spanError.textContent = mensaje;

  return mensaje === "";
}

function validarFormularioCompleto() {
  const idsCampos = ["nombre", "correo", "confirmar-correo", "proyecto", "categoria"];
  return idsCampos
    .map((id) => validarCampo(id))
    .every((resultado) => resultado === true);
}

// Validacion en tiempo real.
["nombre", "correo", "confirmar-correo", "proyecto"].forEach((id) => {
  document.getElementById(id).addEventListener("input", () => validarCampo(id));
});

// Validar al momento que el usuario cambie la categoria.
document.getElementById("categoria").addEventListener("change", () => validarCampo("categoria"));

// Evento submit para el envio del formulario.
formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const formularioValido = validarFormularioCompleto();
  if (!formularioValido) return;

  const nuevoPostulante = {
    id: Date.now(),
    nombre: document.getElementById("nombre").value.trim(),
    correo: document.getElementById("correo").value.trim(),
    proyecto: document.getElementById("proyecto").value.trim(),
    categoria: document.getElementById("categoria").value,
  };

  const postulantes = obtenerPostulantes();
  postulantes.push(nuevoPostulante);
  guardarPostulantes(postulantes);

  renderizarPostulantes();
  formulario.reset();

  document.querySelectorAll(".campo-valido, .campo-invalido").forEach((campo) => {
    campo.classList.remove("campo-valido", "campo-invalido");
  });
});

// Al momento de clickear el boton de eliminar se elimina el postulante al instante.
listaPostulantes.addEventListener("click", (evento) => {
  if (!evento.target.classList.contains("boton-eliminar")) return;

  const idAEliminar = Number(evento.target.getAttribute("data-id"));
  const postulantes = obtenerPostulantes().filter(
    (postulante) => postulante.id !== idAEliminar
  );

  guardarPostulantes(postulantes);
  renderizarPostulantes();
});