import { initNightDayButton } from "../modules/nightDayButton.js";
initNightDayButton();

// Referencias a elementos del DOM
const form = document.getElementById("formulario");
const contenedor = document.getElementById("contenedor");
const mensaje = document.getElementById("mensaje");

// Se recupera el registro desde localStorage, o se inicializa como array vacío si no existe
const registro = JSON.parse(localStorage.getItem("registro")) || [];

renderizarTodo();

// Botón Guardar: descarga los números registrados como archivo .txt
document.getElementById("btnGuardar").addEventListener("click", () => {
    if (registro.length < 10) {
        document.getElementById("errorNumero").textContent = "Ingresá al menos 10 números.";
        return;
    }

    // Se une el array en un string con saltos de línea y se crea un archivo descargable en memoria mediante la API blob
    const contenido = registro.join("\n");
    const blob = new Blob([contenido], { type: "text/plain" }); // Blob: objeto binario que representa el archivo
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "numeros.txt";
    link.click();
    URL.revokeObjectURL(url);

    mostrarMensaje("Archivo descargado", "success");
});

// Botón Eliminar: borra todos los registros de localStorage y del servidor
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

// Botón "Enviar" del formulario
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
    }
    else if (registro.length >= 20) {
        document.getElementById("errorNumero").textContent = "Se ha alcanzado el máximo de 20 números.";
        hayErrores = true;
    }

    if (hayErrores) {
        mostrarMensaje("Guardado incorrecto", "danger");
        return;
    }

    registro.push(numeroRaw); // Se guarda como String para preservar el valor original ingresado por el usuario
    localStorage.setItem("registro", JSON.stringify(registro));

    renderizarTodo();
    form.reset();

    // Se sincroniza el nuevo número con el servidor mediante POST
    try {
        const respuesta = await fetch("/numeros-guardados", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ numero: numeroRaw })
        });

        if (respuesta.ok) {
            mostrarMensaje("Ingresado y sincronizado correctamente", "success");
        } else {
            mostrarMensaje("Ingresado localmente, pero falló en el servidor", "warning");
        }
    } catch (error) {
        mostrarMensaje("Ingresado localmente (servidor fuera de línea)", "warning");
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