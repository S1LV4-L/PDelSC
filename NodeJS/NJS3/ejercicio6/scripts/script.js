const form = document.getElementById("formulario");

form.addEventListener("submit", (e) => {
    e.preventDefault(); //cancela el envio del formulario para que no se recargue la página

    const contenedor = document.getElementById("contenedor");
    const errorIntereses = document.getElementById("errorIntereses");

    contenedor.innerHTML = "";
    errorIntereses.textContent = "";

    // Validación HTML
    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
    }

    // Validar checkboxes y seleccionar solo los marcados
    const checkboxes = document.querySelectorAll(".interes:checked");

    if (checkboxes.length === 0) {
        errorIntereses.textContent = "Seleccione al menos un interés";
        return;
    }

    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const email = document.getElementById("email").value.trim();
    const edad = document.getElementById("edad").value;
    const pais = document.getElementById("pais").value;
    const generoSeleccionado = document.querySelector('input[name="genero"]:checked');

    if (!generoSeleccionado) {
        form.classList.add("was-validated");
        return;
    }

    const intereses = [];
    checkboxes.forEach(cb => {
        intereses.push(cb.nextElementSibling.textContent);
    });

    contenedor.innerHTML = `
        <div class="card text-bg-secondary mb-2">
            <div class="card-body">
                <h5 class="card-title">Datos Personales</h5>
                <p class="card-text"><strong>Nombre:</strong> ${nombre} ${apellido}</p>
                <p class="card-text"><strong>Email:</strong> ${email}</p>
                <p class="card-text"><strong>Edad:</strong> ${edad}</p>
                <p class="card-text"><strong>País:</strong> ${pais}</p>
                <p class="card-text"><strong>Género:</strong> ${generoSeleccionado.value}</p>
                <p class="card-text"><strong>Intereses:</strong> ${intereses.join(", ")}</p>
            </div>
        </div>
    `;
});