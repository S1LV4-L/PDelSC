import { initNightDayButton } from "../modules/nightDayButton.js";
initNightDayButton();

const form = document.getElementById("formulario");

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const contenedor = document.getElementById("contenedor");

    document.querySelectorAll(".error-msg").forEach(el => el.textContent = ""); // Limpiar errores anteriores

    // Leer valores
    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const email = form.elements["email"].value.trim();
    const edad = form.elements["edad"].value;
    const pais = form.elements["pais"].value;
    const formData = new FormData(form);
    const genero = formData.get("genero");
    const checkboxes = document.querySelectorAll(".interes:checked");

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

    if (!email) {
        document.getElementById("errorEmail").textContent = "Ingrese su email";
        hayErrores = true;
    }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById("errorEmail").textContent = "Ingrese un email válido";
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

    if (!pais) {
        document.getElementById("errorPais").textContent = "Seleccione un país";
        hayErrores = true;
    }

    if (!genero) {
        document.getElementById("errorGenero").textContent = "Seleccione un género";
        hayErrores = true;
    }

    if (checkboxes.length === 0) {
        document.getElementById("errorIntereses").textContent = "Seleccione al menos un interés";
        hayErrores = true;
    }

    if (hayErrores) return;

    const intereses = [...checkboxes].map(cb => cb.nextElementSibling.textContent); // convierte el nodeList de los cb en un array y guarda el textContent

    const resultado = `
        <div class="card bg-secondary bg-opacity-10 mb-2">
            <div class="card-body">
                <h5 class="card-title text-body-emphasis">Datos Personales</h5>
                <p class="card-text"><strong>Nombre:</strong> ${nombre} ${apellido}</p>
                <p class="card-text"><strong>Email:</strong> ${email}</p>
                <p class="card-text"><strong>Edad:</strong> ${edad}</p>
                <p class="card-text"><strong>País:</strong> ${pais}</p>
                <p class="card-text"><strong>Género:</strong> ${genero}</p>
                <p class="card-text"><strong>Intereses:</strong> ${intereses.join(", ")}</p>
            </div>
        </div>
    `;

    contenedor.insertAdjacentHTML("beforeend", resultado); //inserta el resultado dentro del contenedor, despues del último hijo (beforeend)
});