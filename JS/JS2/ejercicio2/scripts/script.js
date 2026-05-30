import { initNightDayButton } from "../modules/nightDayButton.js";
initNightDayButton();

// Referencias a elementos del DOM
const form = document.getElementById("formulario");
const contenedor = document.getElementById("contenedor");
const mensaje = document.getElementById("mensaje");

// Se recupera el registro desde localStorage, o se inicializa como array vacío si no existe
const registro = JSON.parse(localStorage.getItem("registro")) || [];

renderizarTodo();

// Botón Cargar: carga un archivo .txt ya existente, reemplaza el almacenamiento local y sincroniza el servidor
document.getElementById("btnCargar").addEventListener("click", () => {
    const inputArchivo = document.createElement("input"); // elemento <input type="file"> de forma invisible
    inputArchivo.type = "file";
    inputArchivo.accept = ".txt";

    inputArchivo.addEventListener("change", (evento) => {  // evento que escucha cuándo el usuario selecciona efectivamente un archivo
        const archivo = evento.target.files[0];
        if (!archivo) return;

        const lector = new FileReader(); // FileReader para leer el contenido del .txt elegido
        
        lector.onload = async (e) => {
            const contenido = e.target.result;
            const lineas = contenido.split(/\r?\n/).map(linea => linea.trim()).filter(linea => linea !== "");

            if (lineas.length > 20) {
                mostrarMensaje("El archivo contiene más de 20 números.", "danger");
                return;
            }

            // Validación de cada línea
            const formatoValido = /^-?[1-9]\d*$/; // entero con o sin signo negativo, sin ceros a la izquierda
            for (const linea of lineas) {
                if (!formatoValido.test(linea)) {
                    mostrarMensaje(`Formato inválido en el archivo: "${linea}"`, "danger");
                    return;
                }
                if (linea.replace("-", "").length > 20) {
                    mostrarMensaje(`Número demasiado largo en el archivo: "${linea}"`, "danger");
                    return;
                }
            }

            // Reemplazo de los datos del array en memoria y en localStorage
            registro.length = 0;
            registro.push(...lineas);
            localStorage.setItem("registro", JSON.stringify(registro));

            renderizarTodo();

            // Sincronización con el servidor
            try {
                await fetch("/numeros-guardados", { method: "DELETE" }); //limpiar los registros viejos

                for (const num of registro) {
                    await fetch("/numeros-guardados", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ numero: num })
                    });
                }
                
                mostrarMensaje("Archivo cargado y sincronizado", "success");
            } catch (error) {
                mostrarMensaje("Cargado localmente (servidor fuera de línea)", "warning");
            }
        };

        lector.readAsText(archivo);
    });

    inputArchivo.click();
});

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

// Botón Guardar Filtrados: descarga en .txt la lista de números que empiezan y terminan con el mismo número
document.getElementById("btnGuardarFiltrados").addEventListener("click", () => {
    if (obtenerFiltrados().length < 1) {
        document.getElementById("errorNumero").textContent = "No hay números que comiencen y terminen con el mismo dígito.";
        return;
    }

    // Se une el array en un string con saltos de línea y se crea un archivo descargable en memoria mediante la API blob
    const listaFiltrados = obtenerFiltrados().join("\n");
    const blob = new Blob([listaFiltrados], { type: "text/plain" }); // Blob: objeto binario que representa el archivo
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "numeros-filtrados.txt";
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
        setTimeout(() => {
            document.getElementById("errorNumero").textContent = ""
        }, 5000);
        hayErrores = true;
    }
    else if (registro.length >= 20) {
        document.getElementById("errorNumero").textContent = "Se ha alcanzado el máximo de 20 números.";
        setTimeout(() => {
            document.getElementById("errorNumero").textContent = ""
        }, 5000);
        hayErrores = true;
    }
    else if (numeroRaw.length > 20){
        document.getElementById("errorNumero").textContent = "El número puede tener como máximo 20 dígitos."
        setTimeout(() => {
            document.getElementById("errorNumero").textContent = ""
        }, 5000);
        hayErrores = true;
    }
    else if(numeroRaw.startsWith("0") || numeroRaw.startsWith("-0")){
        document.getElementById("errorNumero").textContent = "El número no puede comenzar con 0."
        setTimeout(() => {
            document.getElementById("errorNumero").textContent = ""
        }, 5000);
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


function obtenerFiltrados() {
    return registro.filter(num => {
        const strNum = num.startsWith("-") ? num.slice(1) : num; //Quitar el símbolo negativo para
        return strNum.at(0) === strNum.at(-1);
    });
}


function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = `position-absolute start-0 mt-1 ps-4 small text-${tipo}`;
    setTimeout(() => {
        mensaje.textContent = "";
        mensaje.className = "position-absolute start-0 mt-1 ps-4 small";
    }, 5000);
}

function renderizarTodo() {
    contenedor.innerHTML = "";
    const contenedorFiltrados = document.getElementById("contenedorFiltrados");
    contenedorFiltrados.innerHTML = "";

    const cantUtiles = document.getElementById("cantUtiles");
    const cantNoUtiles = document.getElementById("cantNoUtiles");
    const porcentajeUtiles = document.getElementById("porcentajeUtiles");

    if (registro.length === 0) {
        cantUtiles.textContent = "-";
        cantNoUtiles.textContent = "-";
        porcentajeUtiles.textContent = "-";
        return;
    }

    contenedor.insertAdjacentHTML("beforeend", `<h3 class="mb-0 mt-0"><strong>Números ingresados:</strong></h3>`);
    contenedor.insertAdjacentHTML("beforeend", `<h5>${registro.join(", ")}</h5>`);

    const filtrados = obtenerFiltrados();
    if (filtrados.length > 0) {
        const filtradosOrdenados = [...filtrados].sort((a, b) => {
            const bigA = BigInt(a.startsWith("-") ? a : a.replace(/^0+/, "") || "0");
            const bigB = BigInt(b.startsWith("-") ? b : b.replace(/^0+/, "") || "0");
            return bigA < bigB ? -1 : bigA > bigB ? 1 : 0;
        }).join(", ");

        contenedorFiltrados.insertAdjacentHTML("beforeend",
            `<p class="mb-0">Números Filtrados: ${filtradosOrdenados}</p>`
        );
    }

    const total = registro.length;
    const utiles = filtrados.length;
    const noUtiles = total - utiles;
    const porcentaje = ((utiles / total) * 100).toFixed(1);

    cantUtiles.textContent = utiles;
    cantNoUtiles.textContent = noUtiles;
    porcentajeUtiles.textContent = `${porcentaje}%`;
}