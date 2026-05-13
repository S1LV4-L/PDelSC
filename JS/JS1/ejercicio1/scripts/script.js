import { initNightDayButton } from "../modules/nightDayButton.js";
initNightDayButton();

const form = document.getElementById("formulario");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const contenedor = document.getElementById("contenedor");
    const errorIntereses = document.getElementById("errorIntereses");

    // ✅ Ya no se limpia el contenedor para conservar resultados anteriores
    errorIntereses.textContent = "";

    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
    }

    const checkboxes = document.querySelectorAll(".interes:checked");

    if (checkboxes.length === 0) {
        errorIntereses.textContent = "Seleccione al menos un interés";
        return;
    }

    // getElementById
    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();

    // form.elements (acceso por colección del formulario)
    const email = form.elements["email"].value.trim();
    const edad = form.elements["edad"].value;
    const pais = form.elements["pais"].value;

    // FormData (captura todos los campos como mapa clave/valor)
    const formData = new FormData(form);
    const generoSeleccionado = formData.get("genero");

    if (!generoSeleccionado) {
        form.classList.add("was-validated");
        return;
    }

    const intereses = [];
    checkboxes.forEach(cb => {
        intereses.push(cb.nextElementSibling.textContent);
    });

    let resultado = `
        <div class="card text-bg-secondary mb-2">
            <div class="card-body">
                <h5 class="card-title">Datos Personales</h5>
                <p class="card-text"><strong>Nombre:</strong> ${nombre} ${apellido}</p>
                <p class="card-text"><strong>Email:</strong> ${email}</p>
                <p class="card-text"><strong>Edad:</strong> ${edad}</p>
                <p class="card-text"><strong>País:</strong> ${pais}</p>
                <p class="card-text"><strong>Género:</strong> ${generoSeleccionado}</p>
                <p class="card-text"><strong>Intereses:</strong> ${intereses.join(", ")}</p>
            </div>
        </div>
    `;

    // Inserta la nueva card al final sin eliminar las anteriores
    contenedor.insertAdjacentHTML("beforeend", resultado);
});