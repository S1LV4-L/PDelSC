const registro = document.getElementById("registro");

const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+([a-zA-ZáéíóúÁÉÍÓÚñÑ ]*[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)?$/;

// Form 1: Agrega tres colores al principio de un array vacío.
let colores = [];
const input1 = document.getElementById("input1");

document.getElementById("form1").addEventListener("submit", (e) => {
    e.preventDefault();

    const valor = input1.value.trim();

    if (valor === "") {
        mostrarError("Ingresá un color.");
        return;
    }

    if (!soloLetras.test(valor)) {
        mostrarError("El color solo puede contener letras.");
        return;
    }

    colores.unshift(valor);
    mostrarResultado("colores[]", colores);
    input1.value = "";
});


// Form 2: Dado un array de tareas, agrega una nueva tarea urgente al principio.
let tareas = ["tarea de ejemplo 1", "tarea de ejemplo 2", "tarea de ejemplo 3"];
const input2 = document.getElementById("input2");

function validarString(texto) {
  // Al menos 3 letras y que no sea solo números
  const regex = /^(?!\d+$)(?=(?:.*[a-zA-Z]){3,}).*$/;
  return regex.test(texto);
}

document.getElementById("form2").addEventListener("submit", (e) => {
    e.preventDefault();

    const valor = input2.value.trim();

    if (valor === "") {
        mostrarError("Ingresá una tarea.");
        return;
    }
    if (!validarString(valor)){
        mostrarError("La tarea debe contener por lo menos 3 letras y no ser únicamente números");
        return;
    }

    tareas.unshift(valor);
    mostrarResultado("tareas[]", tareas);
    input2.value = "";
});


// Form 3: Inserta el nombre de un usuario al principio de un array de usuarios conectados.
let usuariosConectados = ["Pedro", "Carlos", "Juan"];
const input3 = document.getElementById("input3");

document.getElementById("form3").addEventListener("submit", (e) => {
    e.preventDefault();

    const valor = input3.value.trim();

    if (valor === "") {
        mostrarError("Ingresá un nombre.");
        return;
    }

    if (!soloLetras.test(valor)) {
        mostrarError("El nombre solo puede contener letras.");
        return;
    }

    usuariosConectados.unshift(valor);
    mostrarResultado("usuariosConectados[]", usuariosConectados);
    input3.value = "";
});


function mostrarResultado(label, valor) {
    const p = document.createElement("p");
    p.className = "mb-1";

    const etiqueta = document.createElement("strong");
    etiqueta.textContent = label + ": ";

    const contenido = Array.isArray(valor) ? valor.join(", ") : valor;
    const span = document.createElement("span");
    span.textContent = "'" + contenido + "'";

    p.appendChild(etiqueta);
    p.appendChild(span);
    registro.appendChild(p);
    registro.scrollTop = registro.scrollHeight;
}

function mostrarError(msg) {
    const p = document.createElement("p");
    p.className = "text-danger mb-1";
    p.textContent = msg;
    registro.appendChild(p);
    registro.scrollTop = registro.scrollHeight;

    setTimeout(() => p.remove(), 3000);
}