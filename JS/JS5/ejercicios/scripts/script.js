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

// Vuelve a la vista de agregación
btnVolver.addEventListener("click", () => {
    modoModificar.classList.add("d-none");
    modoAgregar.classList.remove("d-none");
});

// Llena los campos "Actuales" y cambia a la vista modificar (se ejecuta al hacer clic en la lista)
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
    mensajeDiv.className = `position-absolute start-0 bottom-0 small ${esError ? 'text-danger' : 'text-success'}`;
    mensajeDiv.textContent = texto;
    setTimeout(() => mensajeDiv.textContent = "", 3000);
}

// 1. OBTENER (Leer todos los alumnos)
async function obtenerAlumnos() {
    try {
        const respuesta = await axios.post("/api/alumnos");
        renderizarAlumnos(respuesta.data);
    } catch (error) {
        listaAlumnosUl.innerHTML = `<li class="list-group-item text-danger">Error al conectar con el servidor</li>`;
    }
}

// 2. CREAR (Ingresar alumno nuevo)
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

// 3. MODIFICAR (Actualizar alumno existente)
async function modificarAlumno(id, datosNuevos) {
    try {
        await axios.put(`/api/alumnos/${id}`, datosNuevos);
        mostrarMensaje("Alumno modificado correctamente");
        btnVolver.click(); // Simula hacer clic en volver para restaurar la vista
        obtenerAlumnos();
    } catch (error) {
        mostrarMensaje("Error al modificar el alumno", true);
    }
}

// 4. ELIMINAR
async function eliminarAlumno(id) {
    if (!confirm("¿Estás seguro de que deseas eliminar este alumno?")) return;
    
    try {
        await axios.delete(`/api/alumnos/${id}`);
        mostrarMensaje("Alumno eliminado correctamente");
        obtenerAlumnos();
    } catch (error) {
        mostrarMensaje("Error al eliminar el alumno", true);
    }
}

// Renderiza la lista de la derecha con sus botones
function renderizarAlumnos(alumnos) {
    listaAlumnosUl.innerHTML = "";

    if (alumnos.length === 0) {
        listaAlumnosUl.innerHTML = `<li class="list-group-item bg-transparent border-0 text-secondary">No hay alumnos registrados</li>`;
        return;
    }

    alumnos.forEach(alumno => {
        const li = document.createElement("li");
        li.className = "list-group-item bg-transparent border border-secondary rounded-3 mb-2 d-flex justify-content-between align-items-center";
        
        li.innerHTML = `
            <span class="fw-medium">${alumno.nombre} ${alumno.apellido} <span class="text-secondary">- ${alumno.edad} años</span></span>
            <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-info btn-editar">Modificar</button>
                <button class="btn btn-sm btn-outline-danger btn-eliminar">Eliminar</button>
            </div>
        `;

        // Guardamos los datos del alumno en el botón usando datasets
        li.querySelector(".btn-editar").dataset.id = alumno.id;
        li.querySelector(".btn-editar").dataset.nombre = alumno.nombre;
        li.querySelector(".btn-editar").dataset.apellido = alumno.apellido;
        li.querySelector(".btn-editar").dataset.edad = alumno.edad;

        li.querySelector(".btn-eliminar").dataset.id = alumno.id;

        listaAlumnosUl.appendChild(li);
    });
}

// Evento de la lista (Delegación de eventos para los botones dinámicos)
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

// Evento del Formulario (Solo maneja Agregar y Guardar Modificación)
formulario.addEventListener("submit", async (e) => {
    e.preventDefault();
    const botonPresionado = e.submitter;

    // --- LÓGICA PARA INGRESAR ---
    if (botonPresionado.id === "btnIngresar") {
        const datos = {
            nombre: inputNombre.value,
            apellido: inputApellido.value,
            edad: inputEdad.value
        };
        crearAlumno(datos);
    }

    // --- LÓGICA PARA MODIFICAR ---
    if (botonPresionado.id === "btnGuardarMod") {
        const id = inputIdOculto.value;
        
        const datosNuevos = {};
        if (inputNuevoNombre.value.trim() !== "") datosNuevos.nombre = inputNuevoNombre.value.trim();
        if (inputNuevoApellido.value.trim() !== "") datosNuevos.apellido = inputNuevoApellido.value.trim();
        if (inputNuevaEdad.value !== "") datosNuevos.edad = inputNuevaEdad.value;

        if (Object.keys(datosNuevos).length === 0) {
            mostrarMensaje("Debes completar al menos un campo nuevo", true);
            return;
        }

        modificarAlumno(id, datosNuevos);
    }
});

obtenerAlumnos();