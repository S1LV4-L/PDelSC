import { initNightDayButton } from "../modules/nightDayBtn.js";
import { initBackToTopButton } from "../modules/backToTopBtn.js";

initNightDayButton();
initBackToTopButton();

// Referencias a elementos del DOM
const form = document.getElementById("formulario");
const errorNombreDiv = document.getElementById("errorNombre");
const errorEmailDiv = document.getElementById("errorEmail");
const listaIds = document.getElementById("usuarios-lista-axios");
const mensaje = document.getElementById("mensaje");

const regexNombre = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/;
const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Botón "Enviar" del formulario y VALIDACIÓN
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Limpiar errores previos
    errorNombreDiv.textContent = "";
    errorEmailDiv.textContent = "";

    const nombreVal = form.elements["nombre"].value.trim();
    const emailVal = form.elements["email"].value.trim();

    let hayErrores = false;

    // VALIDACIÓN NOMBRE
    if (nombreVal === "") {
        errorNombreDiv.textContent = "El nombre es obligatorio.";
        setTimeout(() => {
            errorNombreDiv.textContent = "";
        }, 5000);
        hayErrores = true;
    } else if (!regexNombre.test(nombreVal)) {
        errorNombreDiv.textContent = "El nombre no puede contener números ni caracteres especiales.";
        setTimeout(() => {
            errorNombreDiv.textContent = "";
        }, 5000);
        hayErrores = true;
    }

    // VALIDACIÓN EMAIL
    if (emailVal === "") {
        errorEmailDiv.textContent = "El correo electrónico es obligatorio.";
        setTimeout(() => {
            errorEmailDiv.textContent = "";
        }, 5000);
        hayErrores = true;
    } else if (!regexEmail.test(emailVal)) {
        errorEmailDiv.textContent = "El formato del correo no es válido.";
        setTimeout(() => {
            errorEmailDiv.textContent = "";
        }, 5000);
        hayErrores = true;
    }

    if (hayErrores) {
        mostrarMensaje("Registro incorrecto", "danger");
        return;
    }

    // ENVÍO CON AXIOS
    // axios.post() hace una petición POST al backend (no directamente a la API externa), el server la recibe { name, email } y se
    // comunica con JSONPlaceholder. La promesa se resuelve con un objeto "response"; lo que la API externa devolvió llega en response.data
    // (axios ya parsea el JSON automáticamente, a diferencia de fetch).
    try {
        const respuesta = await axios.post("/api/usuarios", {
            name: nombreVal,
            email: emailVal
        });

        if (respuesta.status === 200 || respuesta.status === 201) {
            const nuevoId = respuesta.data.id; // id que la API externa generó y el server reenvió

            const li = document.createElement("li");
            li.className = "mb-2";
            li.innerHTML = `<span class="fw-bold text-info">ID: ${nuevoId}</span> — ${nombreVal} (${emailVal})`;
            listaIds.prepend(li);

            form.reset();

            const contenedorScroll = document.querySelector('.layout-principal .overflow-y-auto');
            if (contenedorScroll) {
                contenedorScroll.scrollTo({ top: 0, behavior: 'smooth' });
            }

            mostrarMensaje("Usuario registrado correctamente", "success");
        } else {
            mostrarMensaje("Respuesta inesperada del servidor", "warning");
        }

    } catch (error) {
        // axios lanza una excepción automáticamente si el status no es 2xx. Fetch solo rechaza la promesa ante errores de red
        mostrarMensaje("Error de conexión con el servidor", "danger");
    }
});

// Mostrar mensajes de error/validación
function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = `position-absolute mt-0 small text-${tipo}`;
    setTimeout(() => {
        mensaje.textContent = "";
        mensaje.className = "position-absolute mt-0 small";
    }, 5000);
}

// axios.post() consulta el backend para traer los usuarios que ya están guardados en el archivo local (data/usuarios.json), no en la API
async function cargarUsuarios() {
    try {
        const respuesta = await axios.post("/api/usuarios/listar");
        respuesta.data.forEach(usuario => {
            const li = document.createElement("li");
            li.className = "mb-2";
            li.innerHTML = `<span class="fw-bold text-primary">ID: ${usuario.id}</span> — ${usuario.name} (${usuario.email})`;
            listaIds.appendChild(li);
        });
    } catch (error) {
        mostrarMensaje("No se pudieron cargar los usuarios guardados", "warning");
    }
}

cargarUsuarios();