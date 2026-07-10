import { initNightDayButton } from "../modules/nightDayBtn.js";
import { initBackToTopButton } from "../modules/backToTopBtn.js";

initNightDayButton();
initBackToTopButton();

// Referencias al DOM
const formulario = document.getElementById("formulario");
const listaAlumnosUl = document.getElementById("usuarios-lista-axios");
const mensajeDiv = document.getElementById("mensaje");

const modoAgregar = document.getElementById("modoAgregar");
const modoModificar = document.getElementById("modoModificar");
const btnVolver = document.getElementById("btnVolver");

const inputNombre = document.getElementById("nombre");
const inputApellido = document.getElementById("apellido");
const inputEdad = document.getElementById("edad");

const inputIdOculto = document.getElementById("idAlumno");
const inputNombreActual = document.getElementById("nombreActual");
const inputApellidoActual = document.getElementById("apellidoActual");
const inputEdadActual = document.getElementById("edadActual");
const inputNuevoNombre = document.getElementById("nuevoNombre");
const inputNuevoApellido = document.getElementById("nuevoApellido");
const inputNuevaEdad = document.getElementById("nuevaEdad");

const regexNombre = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/;
const regexEdad = /^\d+$/;

// Mantener copia local de los alumnos para validación de duplicados
let alumnosActuales = [];

// Vuelve a la vista de agregación
btnVolver.addEventListener("click", () => {
    modoModificar.classList.add("d-none");
    modoAgregar.classList.remove("d-none");
});

// Llena los campos "Actuales" y cambia a la vista modificar
function cargarAlumnoParaModificar(id, nombre, apellido, edad) {
    inputIdOculto.value = id;
    inputNombreActual.value = nombre;
    inputApellidoActual.value = apellido;
    inputEdadActual.value = edad;
    
    inputNuevoNombre.value = "";
    inputNuevoApellido.value = "";
    inputNuevaEdad.value = "";

    modoAgregar.classList.add("d-none");
    modoModificar.classList.remove("d-none");
}

function mostrarMensaje(texto, esError = false) {
    mensajeDiv.className = `mt-auto pt-2 small ${esError ? 'text-danger' : 'text-success'}`;
    mensajeDiv.textContent = texto;
    setTimeout(() => mensajeDiv.textContent = "", 3000);
}

// OBTENER
async function obtenerAlumnos() {
    try {
        const respuesta = await axios.post("/api/alumnos");
        renderizarAlumnos(respuesta.data);
    } catch (error) {
        listaAlumnosUl.innerHTML = `<li class="list-group-item text-danger">Error al conectar con el servidor</li>`;
    }
}

// CREAR
async function crearAlumno(datos) {
    try {
        await axios.post("/api/alumnos/crear", datos);
        mostrarMensaje("Alumno ingresado correctamente");
        formulario.reset();
        obtenerAlumnos();
    } catch (error) {
        mostrarMensaje("Error al ingresar el alumno", true);
    }
}

// MODIFICAR
async function modificarAlumno(id, datosNuevos) {
    try {
        await axios.put(`/api/alumnos/${id}`, datosNuevos);
        mostrarMensaje("Alumno modificado correctamente");
        btnVolver.click();
        obtenerAlumnos();
    } catch (error) {
        mostrarMensaje("Error al modificar el alumno", true);
    }
}

// ELIMINAR
async function eliminarAlumno(id) {    
    try {
        await axios.delete(`/api/alumnos/${id}`);
        mostrarMensaje("Alumno eliminado correctamente");
        obtenerAlumnos();
    } catch (error) {
        mostrarMensaje("Error al eliminar el alumno", true);
    }
}

// Renderiza la lista
function renderizarAlumnos(alumnos) {
    alumnosActuales = alumnos;
    listaAlumnosUl.innerHTML = "";

    if (alumnos.length === 0) {
        listaAlumnosUl.innerHTML = `<li class="list-group-item bg-transparent border-0 text-secondary">No hay alumnos registrados</li>`;
        return;
    }

    alumnos.forEach(alumno => {
        const li = document.createElement("li");
        li.className = "list-group-item bg-transparent border border-secondary rounded-3 mb-2 d-flex justify-content-between align-items-center";
        
        li.innerHTML = `
            <span class="fw-medium">${alumno.nombre} ${alumno.apellido}<span class="text-secondary d-block">${alumno.edad} años</span></span>
            <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-info btn-editar">Modificar</button>
                <button class="btn btn-sm btn-outline-danger btn-eliminar">X</button>
            </div>
        `;

        li.querySelector(".btn-editar").dataset.id = alumno.id;
        li.querySelector(".btn-editar").dataset.nombre = alumno.nombre;
        li.querySelector(".btn-editar").dataset.apellido = alumno.apellido;
        li.querySelector(".btn-editar").dataset.edad = alumno.edad;

        li.querySelector(".btn-eliminar").dataset.id = alumno.id;

        listaAlumnosUl.appendChild(li);
    });
}

// Delegación de eventos en la lista
listaAlumnosUl.addEventListener("click", (e) => {
    const btnEditar = e.target.closest(".btn-editar");
    const btnEliminar = e.target.closest(".btn-eliminar");

    if (btnEditar) {
        cargarAlumnoParaModificar(
            btnEditar.dataset.id,
            btnEditar.dataset.nombre,
            btnEditar.dataset.apellido,
            btnEditar.dataset.edad
        );
    }

    if (btnEliminar) {
        eliminarAlumno(btnEliminar.dataset.id);
    }
});

// Evento del Formulario — cada rama valida solo sus propios campos
formulario.addEventListener("submit", async (e) => {
    e.preventDefault();
    const botonPresionado = e.submitter;

    // ── INGRESAR ──
    if (botonPresionado.id === "btnIngresar") {
        const nombreVal = inputNombre.value.trim();
        const apellidoVal = inputApellido.value.trim();
        const edadVal = inputEdad.value.trim();

        if (nombreVal === "") {
            mostrarMensaje("El nombre es obligatorio.", true);
            return;
        } else if (!regexNombre.test(nombreVal)) {
            mostrarMensaje("El nombre no puede contener números ni caracteres especiales.", true);
            return;
        } else if (apellidoVal === "") {
            mostrarMensaje("El apellido es obligatorio.", true);
            return;
        } else if (!regexNombre.test(apellidoVal)) {
            mostrarMensaje("El apellido no puede contener números ni caracteres especiales.", true);
            return;
        } else if (edadVal === "") {
            mostrarMensaje("La edad es obligatoria.", true);
            return;
        } else if (!regexEdad.test(edadVal)) {
            mostrarMensaje("La edad solo puede contener números.", true);
            return;
        } else if (parseInt(edadVal) > 120 || parseInt(edadVal) < 0) {
            mostrarMensaje("Ingrese una edad válida.", true);
            return;
        }

        const duplicado = alumnosActuales.some(a =>
            a.nombre.toLowerCase() === nombreVal.toLowerCase() &&
            a.apellido.toLowerCase() === apellidoVal.toLowerCase()
        );

        if (duplicado) {
            mostrarMensaje("Ya existe un alumno con ese nombre y apellido.", true);
            return;
        }

        crearAlumno({ nombre: nombreVal, apellido: apellidoVal, edad: edadVal });
    }

    // ── MODIFICAR ──
    else if (botonPresionado.id === "btnGuardarMod") {
        const datosNuevos = {};
        if (inputNuevoNombre.value.trim() !== "") datosNuevos.nombre = inputNuevoNombre.value.trim();
        if (inputNuevoApellido.value.trim() !== "") datosNuevos.apellido = inputNuevoApellido.value.trim();
        if (inputNuevaEdad.value !== "") datosNuevos.edad = inputNuevaEdad.value;

        if (Object.keys(datosNuevos).length === 0) {
            mostrarMensaje("Debes completar al menos un campo nuevo.", true);
            return;
        }

        modificarAlumno(inputIdOculto.value, datosNuevos);
    }
});

obtenerAlumnos();