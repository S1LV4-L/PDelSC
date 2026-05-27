import { initNightDayButton } from "../modules/nightDayButton.js";
initNightDayButton();

const form = document.getElementById("formulario");
const contenedor = document.getElementById("contenedor");
const mensaje = document.getElementById("mensaje");

const registro = JSON.parse(localStorage.getItem("registro")) || [];

renderizarTodo();

document.getElementById("btnGuardar").addEventListener("click", () => {
    if (registro.length < 10) {
        document.getElementById("errorNumero").textContent = "Ingresá al menos 10 números.";
        return;
    }
    localStorage.setItem("registro", JSON.stringify(registro));
    mostrarMensaje("Guardado localmente", "success");
});

document.getElementById("btnEliminar").addEventListener("click", async () => {
    localStorage.removeItem("registro");
    registro.length = 0;
    renderizarTodo();

    try {
        const respuesta = await fetch("/numeros-guardados", {
            method: "DELETE"
        });

        if (respuesta.ok) {
            mostrarMensaje("Registros eliminados", "success");
        } else {
            mostrarMensaje("Eliminado localmente, pero falló en el servidor", "warning");
        }
    } catch (error) {
        mostrarMensaje("Eliminado localmente (servidor fuera de línea)", "warning");
    }
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    document.querySelectorAll(".error-msg").forEach(el => el.textContent = "");
    document.getElementById("errorNumero").textContent = "";

    const numeroRaw = form.elements["numero"].value.trim();
    const numero = Number(numeroRaw);

    let hayErrores = false;

    if (numeroRaw === "" || isNaN(numero)) {
        document.getElementById("errorNumero").textContent = "Ingresá un número válido.";
        hayErrores = true;
    } else if (registro.length >= 20) {
        document.getElementById("errorNumero").textContent = "Se ha alcanzado el máximo de 20 números.";
        hayErrores = true;
    }

    if (hayErrores) {
        mostrarMensaje("Guardado incorrecto", "danger");
        return;
    }

    registro.push(numeroRaw); //se guarda como String
    localStorage.setItem("registro", JSON.stringify(registro));

    renderizarTodo();
    form.reset();

    try {
        const respuesta = await fetch("/numeros-guardados", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ numero: numeroRaw })
        });

        if (respuesta.ok) {
            mostrarMensaje("Guardado y sincronizado correctamente", "success");
        } else {
            mostrarMensaje("Guardado localmente, pero falló en el servidor", "warning");
        }
    } catch (error) {
        mostrarMensaje("Guardado localmente (servidor fuera de línea)", "warning");
    }
});

function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = `mt-3 text-${tipo}`;
    setTimeout(() => {
        mensaje.textContent = "";
        mensaje.className = "mt-3";
    }, 5000);
}

function renderizarTodo() {
    contenedor.innerHTML = "";

    if (registro.length === 0) return;

    contenedor.insertAdjacentHTML("beforeend", `<h4 class="mb-2"><strong>Números ingresados:</strong></h4>`);

    const lista = registro.join(", ");
    contenedor.insertAdjacentHTML("beforeend", `<p>${lista}</p>`);
}