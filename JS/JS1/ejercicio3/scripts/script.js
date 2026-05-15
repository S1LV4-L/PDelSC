import { initNightDayButton } from "../modules/nightDayButton.js";
initNightDayButton();

const form = document.getElementById("formulario");
const contenedor = document.getElementById("contenedor");
const mensaje = document.getElementById("mensaje");

const registros = JSON.parse(localStorage.getItem("registros")) || []; // Cargar registros desde localStorage

renderizarTodo(); // Renderizar registros guardados al cargar la página

document.querySelectorAll('input[name="hijos"]').forEach(radio => { // Mostrar u ocultar cantidad de hijos según el radio seleccionado
    radio.addEventListener("change", () => {
        const cantHijos = document.getElementById("cantHijos");
        cantHijos.classList.toggle("d-none", radio.value !== "Si");
    });
});

form.addEventListener("submit", (e) => {
    e.preventDefault();

    document.querySelectorAll(".error-msg").forEach(el => el.textContent = ""); // Limpiar errores

    // Leer valores
    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();

    const edad = form.elements["edad"].value;
    const fechaNacimiento = form.elements["fechaNacimiento"].value;
    const documento = form.elements["documento"].value;
    const estadoCivil = form.elements["estadoCivil"].value;
    const nacionalidad = form.elements["nacionalidad"].value;

    const formData = new FormData(form);
    const sexo = formData.get("sexo");
    const hijos = formData.get("hijos");
    const telefono = formData.get("telefono");
    const email = formData.get("email");
    const cantidadHijos = formData.get("cantidadHijos");

    // Validaciones
    let hayErrores = false;

    if (!nombre) {
        document.getElementById("errorNombre").textContent = "Ingrese su nombre";
        hayErrores = true;
    }
    else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(nombre)) {
        document.getElementById("errorNombre").textContent = "Solo se permiten letras";
        hayErrores = true;
    }

    if (!apellido) {
        document.getElementById("errorApellido").textContent = "Ingrese su apellido";
        hayErrores = true;
    }
    else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(apellido)) {
        document.getElementById("errorApellido").textContent = "Solo se permiten letras";
        hayErrores = true;
    }

    if (!edad) {
        document.getElementById("errorEdad").textContent = "Ingrese su edad";
        hayErrores = true;
    } 
    else if (edad < 1 || edad > 120) {
        document.getElementById("errorEdad").textContent = "Debe estar entre 1 y 120";
        hayErrores = true;
    }

    if (!fechaNacimiento) {
        document.getElementById("errorFechaNacimiento").textContent = "Ingrese su fecha de nacimiento";
        hayErrores = true;
    } 
    else if (new Date(fechaNacimiento) > new Date()) {
        document.getElementById("errorFechaNacimiento").textContent = "La fecha no puede ser futura";
        hayErrores = true;
    }

    if (!sexo) {
        document.getElementById("errorSexo").textContent = "Seleccione su sexo";
        hayErrores = true;
    }

    if (!documento) {
        document.getElementById("errorDocumento").textContent = "Ingrese su documento";
        hayErrores = true;
    }
    else if (documento.length < 7 || documento.length > 8) {
        document.getElementById("errorDocumento").textContent = "El documento debe tener 7 u 8 dígitos";
        hayErrores = true;
    }

    if (!nacionalidad) {
        document.getElementById("errorNacionalidad").textContent = "Seleccione su nacionalidad";
        hayErrores = true;
    }

    if (!telefono) {
        document.getElementById("errorTelefono").textContent = "Ingrese su teléfono";
        hayErrores = true;
    }

    if (!email) {
        document.getElementById("errorEmail").textContent = "Ingrese su email";
        hayErrores = true;
    }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById("errorEmail").textContent = "Ingrese un email válido";
        hayErrores = true;
    }

    if (!estadoCivil) {
        document.getElementById("errorEstadoCivil").textContent = "Seleccione su estado civil";
        hayErrores = true;
    }

    if (hijos === "Si" && (!cantidadHijos || cantidadHijos < 1)) {
        document.getElementById("errorHijos").textContent = "Ingrese la cantidad de hijos";
        hayErrores = true;
    }

    if (hayErrores) {
        mostrarMensaje("Guardado incorrecto", "red");
        return;
    }

    const fechaFormateada = fechaNacimiento.split("-").reverse().join("/"); // Formatear fecha

    // Guardar en array y localStorage
    const registro = {
        nombre, apellido, edad, fechaNacimiento: fechaFormateada,
        sexo, documento, nacionalidad, telefono, email,
        estadoCivil, hijos, cantidadHijos: hijos === "Si" ? cantidadHijos : "-"
    };

    registros.push(registro);
    localStorage.setItem("registros", JSON.stringify(registros));

    renderizarTodo();
    form.reset();
    mostrarMensaje("Guardado correctamente", "green");
});

function mostrarMensaje(texto, color) {
    mensaje.textContent = texto;
    mensaje.style.color = color;
    setTimeout(() => mensaje.textContent = "", 3000);
}

function renderizarTodo() {
    contenedor.innerHTML = "";

    if (registros.length === 0) return;

    contenedor.insertAdjacentHTML("beforeend", `<h4><strong>Personas Registradas:</strong></h4><br>`);

    const lista = registros.map(r => `${r.apellido}, ${r.nombre}`).join(" — ");
    contenedor.insertAdjacentHTML("beforeend", `<p>${lista}</p>`);
}

document.addEventListener("keydown", (event) => {           // Presionar espacio para limpiar el localStorage 
    const tagName = document.activeElement.tagName.toLowerCase();
    const esInput = tagName === "input" || tagName === "textarea" || tagName === "select";

    if (event.code === "Space" && !esInput) {
        localStorage.removeItem("registros");
        registros.length = 0;
        renderizarTodo();
        console.log("Registros eliminados");
    }
});