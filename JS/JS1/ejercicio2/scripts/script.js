import { initNightDayButton } from "../modules/nightDayButton.js";
initNightDayButton();

const form = document.getElementById("formulario");
const contenedor = document.getElementById("contenedor");

const deportes = [];

form.addEventListener("submit", (e) => {
    e.preventDefault();

    // --- Limpiar errores anteriores ---
    document.querySelectorAll(".error-msg").forEach(el => el.textContent = "");

    // --- Leer valores ---
    // getElementById
    const nombre = document.getElementById("nombre").value.trim();

    // form.elements
    const cantidadMin = form.elements["cantidadMin"].value;
    const cantidadMax = form.elements["cantidadMax"].value;
    const nivel = form.elements["nivel"].value;
    const duracion = form.elements["duracion"].value;

    // FormData
    const formData = new FormData(form);
    const categoria = formData.get("categoria");
    const ambiente = formData.get("ambiente");
    const genero = formData.get("genero");

    // --- Validar y mostrar errores ---
    let hayErrores = false;

    if (!nombre) {
        document.getElementById("errorNombre").textContent = "Ingrese el nombre del deporte";
        hayErrores = true;
    } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(nombre)) {
        document.getElementById("errorNombre").textContent = "Solo se permiten letras";
        hayErrores = true;
    }

    if (!categoria) {
        document.getElementById("errorCategoria").textContent = "Seleccione una categoría";
        hayErrores = true;
    }

    if (!ambiente) {
        document.getElementById("errorAmbiente").textContent = "Seleccione un ambiente";
        hayErrores = true;
    }

    if (!cantidadMin) {
        document.getElementById("errorCantidadMin").textContent = "Ingrese una cantidad mínima";
        hayErrores = true;
    } else if (cantidadMin < 1 || cantidadMin > 120) {
        document.getElementById("errorCantidadMin").textContent = "Debe estar entre 1 y 120";
        hayErrores = true;
    }

    if (!cantidadMax) {
        document.getElementById("errorCantidadMax").textContent = "Ingrese una cantidad máxima";
        hayErrores = true;
    } else if (Number(cantidadMax) < Number(cantidadMin)) {
        document.getElementById("errorCantidadMax").textContent = "Debe ser mayor a la cantidad mínima";
        hayErrores = true;
    }

    if (!nivel) {
        document.getElementById("errorNivel").textContent = "Seleccione un nivel";
        hayErrores = true;
    }

    // Validación de duración agregada
    if (!duracion) {
        document.getElementById("errorDuracion").textContent = "Seleccione una duración";
        hayErrores = true;
    }

    if (!genero) {
        document.getElementById("errorGenero").textContent = "Seleccione un género";
        hayErrores = true;
    }

    if (hayErrores) return;

    const deporte = { nombre, categoria, ambiente, cantidadMin, cantidadMax, nivel, duracion, genero };

    // Guardar en el array
    deportes.push(deporte);

    // --- Si no hay errores, mostrar resultado ---
    const resultado = `
        <div class="card bg-secondary bg-opacity-10 mb-2">
            <div class="card-body">
                <h5 class="card-title text-body-emphasis">${nombre}</h5>
                <p class="card-text"><strong>Categoría:</strong> ${categoria}</p>
                <p class="card-text"><strong>Ambiente:</strong> ${ambiente}</p>
                <p class="card-text"><strong>Jugadores:</strong> ${cantidadMin} – ${cantidadMax}</p>
                <p class="card-text"><strong>Nivel:</strong> ${nivel}</p>
                <p class="card-text"><strong>Duración:</strong> ${duracion}</p>
                <p class="card-text"><strong>Género:</strong> ${genero}</p>
            </div>
        </div>
    `;

    contenedor.insertAdjacentHTML("beforeend", resultado);
});