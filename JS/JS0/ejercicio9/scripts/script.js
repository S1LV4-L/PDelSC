import { initNightDayButton } from "../modules/nightDayButton.js";
initNightDayButton();

const registro = document.getElementById("registro");

const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+([a-zA-ZáéíóúÁÉÍÓÚñÑ ]*[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)?$/;


// Form 1: Muestra todos los nombres de un array con un saludo.
let nombres = [];
const input1 = document.getElementById("input1");
const btn1   = document.getElementById("btn1");

document.getElementById("form1").addEventListener("submit", (e) => {
    e.preventDefault();

    const valor = input1.value.trim();

    if (valor === "") {
        mostrarError("Ingresá un nombre.");
        return;
    }

    if (!soloLetras.test(valor)) {
        mostrarError("El nombre solo puede contener letras.");
        return;
    }

    nombres.push(valor);
    mostrarResultado("nombres[]", nombres);
    input1.value = "";
});

btn1.addEventListener("click", () => {
    if (nombres.length === 0) {
        mostrarError("Agregá al menos un nombre antes de mostrar.");
        return;
    }

    nombres.forEach(nombre => {
        mostrarResultado("Hola", nombre);
    });
});


// Form 2: Imprime el doble de cada número de un array con forEach()
let numeros = [];
const input2 = document.getElementById("input2");
const btn2   = document.getElementById("btn2");

document.getElementById("form2").addEventListener("submit", (e) => {
    e.preventDefault();

    const raw = input2.value.trim();

    if (raw === "") {
        mostrarError("Ingresá un número.");
        return;
    }

    numeros.push(Number(raw));
    mostrarResultado("numeros[]", numeros);
    input2.value = "";
});

btn2.addEventListener("click", () => {
    if (numeros.length === 0) {
        mostrarError("Agregá al menos un número antes de continuar.");
        return;
    }

    numeros.forEach(numero => {
        mostrarResultado(`Doble de ${numero}`, numero * 2);
    });
});


// Form 3: Dado un array de objetos {nombre, edad}, muestra cada nombre con su edad.
let personas = [];
const input3nombre = document.getElementById("input3nombre");
const input3edad = document.getElementById("input3edad");
const btn3 = document.getElementById("btn3");

document.getElementById("form3").addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = input3nombre.value.trim();
    const edad   = input3edad.value.trim();

    if (nombre === "" || edad === "") {
        mostrarError("Completá el nombre y la edad.");
        return;
    }

    if (!soloLetras.test(nombre)) {
        mostrarError("El nombre solo puede contener letras.");
        return;
    }

    const edadNum = Number(edad);

    if (!Number.isInteger(edadNum) || edadNum < 0 || edadNum > 120) {
        mostrarError("Ingresá una edad válida (0-120).");
        return;
    }

    personas.push({ nombre: nombre, edad: edadNum });
    mostrarResultado("personas[]", personas.map(p => `${p.nombre} (${p.edad})`));

    input3nombre.value = "";
    input3edad.value   = "";
});

btn3.addEventListener("click", () => {
    if (personas.length === 0) {
        mostrarError("Agregá al menos una persona antes de mostrar.");
        return;
    }

    personas.forEach(persona => {
        mostrarResultado(persona.nombre, `${persona.edad} años`);
    });
});


// ── Helpers ────────────────────────────────────────────────────────────────
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