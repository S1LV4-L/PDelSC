import { initNightDayButton } from "../modules/nightDayButton.js";
initNightDayButton();

const registro = document.getElementById("registro");

// Permite letras y espacios en medio, pero no al principio ni al final (el trim() se encarga de eso)
const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+([a-zA-ZáéíóúÁÉÍÓÚñÑ ]*[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)?$/;

// Form 1: Crea un array vacío y agrega tres frutas usando push().
let frutas = [];
const input1 = document.getElementById("input1");
const btn1 = document.querySelector("#form1 button");

document.getElementById("form1").addEventListener("submit", (e) => {
    e.preventDefault();

    const valor = input1.value.trim();

    if (valor === "") {
        mostrarError("Ingresá una fruta.");
        return;
    }

    if (!soloLetras.test(valor)) {
        mostrarError("La fruta solo puede contener letras.");
        return;
    }

    frutas.push(valor);
    mostrarResultado("frutas[]", frutas);
    input1.value = "";

    if (frutas.length >= 3) {
        input1.disabled = true;
        btn1.disabled = true;
    }
});

// Form 2: Agrega los nombres de tus 3 amigos a un array existente llamado amigos.
let amigos = [];
const input2 = document.getElementById("input2");
const btn2 = document.querySelector("#form2 button");

document.getElementById("form2").addEventListener("submit", (e) => {
    e.preventDefault();

    const valor = input2.value.trim();

    if (valor === "") {
        mostrarError("Ingresá un nombre.");
        return;
    }

    if (!soloLetras.test(valor)) {
        mostrarError("El nombre solo puede contener letras.");
        return;
    }

    amigos.push(valor);
    mostrarResultado("amigos[]", amigos);
    input2.value = "";

    if (amigos.length >= 3) {
        input2.disabled = true;
        btn2.disabled = true;
    }
});

// Form 3: Dado un array de números, agrega un nuevo número solo si es mayor que el último número.
let numeros = [];
const input3 = document.getElementById("input3");

document.getElementById("form3").addEventListener("submit", (e) => {
    e.preventDefault();

    const raw = input3.value.trim();

    if (raw === "") {
        mostrarError("Ingresá un número.");
        return;
    }

    const num = Number(raw);

    if (isNaN(num)) {
        mostrarError("Solo se permiten números.");
        return;
    }

    if (numeros.length === 0) {
        numeros.push(num);
    } else {
        const ultimo = numeros[numeros.length - 1];
        if (num > ultimo) {
            numeros.push(num);
        } else {
            mostrarError(`${num} no es mayor al último número (${ultimo}). No se agregó.`);
            return;
        }
    }

    mostrarResultado("numeros[]", numeros);
    input3.value = "";
});


function mostrarResultado(label, valor) {
    const p = document.createElement("p");
    p.className = "mb-1";

    const etiqueta = document.createElement("strong");
    etiqueta.textContent = label + ": ";

    const contenido = Array.isArray(valor) ? valor.join(", ") : valor; //valor.join(", "): si es array, une todos los elementos con ", "valor: si no es array (string o número), lo usa directamente
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

    // Mueve el scroll automáticamente hacia el fondo
    registro.scrollTop = registro.scrollHeight;

    setTimeout(() => {
        p.remove();
    }, 3000);
}