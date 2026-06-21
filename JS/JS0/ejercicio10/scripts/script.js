import { initNightDayButton } from "../modules/nightDayButton.js";
initNightDayButton();

const registro = document.getElementById("registro");

const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+([a-zA-ZáéíóúÁÉÍÓÚñÑ ]*[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)?$/;


// Form 1: Crea un nuevo array con cada número multiplicado por 3.
let numeros = [];
const input1 = document.getElementById("input1");
const btn1   = document.getElementById("btn1");

document.getElementById("form1").addEventListener("submit", (e) => {
    e.preventDefault();

    const raw = input1.value.trim();

    if (raw === "") {
        mostrarError("Ingresá un número.");
        return;
    }

    numeros.push(Number(raw));
    mostrarResultado("numeros[]", numeros);
    input1.value = "";
});

btn1.addEventListener("click", () => {
    if (numeros.length === 0) {
        mostrarError("Agregá al menos un número antes de continuar.");
        return;
    }

    const numerosPorTres = numeros.map(num => num * 3);
    mostrarResultado("numeros[] (original)", numeros);
    mostrarResultado("numeros[] (x3)", numerosPorTres);
});


// Form 2: Convierte un array de nombres en mayúsculas.
let nombres = [];
const input2 = document.getElementById("input2");
const btn2   = document.getElementById("btn2");

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

    nombres.push(valor);
    mostrarResultado("nombres[]", nombres);
    input2.value = "";
});

btn2.addEventListener("click", () => {
    if (nombres.length === 0) {
        mostrarError("Agregá al menos un nombre antes de continuar.");
        return;
    }

    const nombresMayusculas = nombres.map(nombre => nombre.toUpperCase());
    mostrarResultado("nombres[] (antes)", nombres);
    mostrarResultado("nombres[] (mayúsculas)", nombresMayusculas);
});


// Form 3: A un array de precios, agrégale el 21% de IVA y crea un nuevo array.
let precios = [];
const input3 = document.getElementById("input3");
const btn3   = document.getElementById("btn3");

document.getElementById("form3").addEventListener("submit", (e) => {
    e.preventDefault();

    const raw = input3.value.trim();

    if (raw === "") {
        mostrarError("Ingresá un número.");
        return;
    }

    const num = Number(raw);

    if (num <= 0) {
        mostrarError("El precio debe ser mayor a 0.");
        return;
    }

    precios.push(num);
    mostrarResultado("precios[]", precios);
    input3.value = "";
});

btn3.addEventListener("click", () => {
    if (precios.length === 0) {
        mostrarError("Agregá al menos un precio antes de continuar.");
        return;
    }

    const preciosConIva = precios.map(num => parseFloat((num * 1.21).toFixed(2)));
    mostrarResultado("Precios sin IVA", precios);
    mostrarResultado("Precios con IVA (21%)", preciosConIva);
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