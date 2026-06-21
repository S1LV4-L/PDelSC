import { initNightDayButton } from "../modules/nightDayButton.js";
initNightDayButton();

const registro = document.getElementById("registro");

const soloLetra   = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]$/;
const soloNombres = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+([a-zA-ZáéíóúÁÉÍÓÚñÑ ]*[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)?$/;


// ── Form 1: eliminar 2 elementos desde pos. 1 ─────────────────────────────
let letras = [];
const input1 = document.getElementById("input1");
const btn1   = document.getElementById("btn1");

document.getElementById("form1").addEventListener("submit", (e) => {
    e.preventDefault();

    const valor = input1.value.trim();

    if (valor === "") {
        mostrarError("Ingresá una letra.");
        return;
    }

    if (!soloLetra.test(valor)) {
        mostrarError("Solo se permite una única letra.");
        return;
    }

    letras.push(valor);
    mostrarResultado("letras[]", letras);
    input1.value = "";
});

btn1.addEventListener("click", () => {
    if (letras.length < 3) {
        mostrarError("Necesitás al menos 3 letras para eliminar 2 desde la pos. 1.");
        return;
    }

    const eliminados = letras.splice(1, 2);
    mostrarResultado(`letras[] (eliminados: '${eliminados.join(", ")}')`, letras);
});


// ── Form 2: insertar en pos. 1 sin eliminar nada ──────────────────────────
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

    if (!soloNombres.test(valor)) {
        mostrarError("El nombre solo puede contener letras.");
        return;
    }

    nombres.push(valor);
    mostrarResultado("nombres[]", nombres);
    input2.value = "";
});

btn2.addEventListener("click", () => {
    const valor = input2.value.trim();

    if (valor === "") {
        mostrarError("Ingresá el nombre a insertar.");
        return;
    }

    if (!soloNombres.test(valor)) {
        mostrarError("El nombre solo puede contener letras.");
        return;
    }

    if (nombres.length === 0) {
        mostrarError("Agregá al menos un nombre antes de insertar.");
        return;
    }

    nombres.splice(1, 0, valor);
    mostrarResultado(`nombres[] (insertado '${valor}' en pos. 1)`, nombres);
    input2.value = "";
});


// ── Form 3: reemplazar 2 elementos desde una posición ────────────────────
let numeros = [];
const input3    = document.getElementById("input3");
const input3pos  = document.getElementById("input3pos");
const input3val1 = document.getElementById("input3val1");
const input3val2 = document.getElementById("input3val2");
const btn3      = document.getElementById("btn3");

document.getElementById("form3").addEventListener("submit", (e) => {
    e.preventDefault();

    const raw = input3.value.trim();

    if (raw === "") {
        mostrarError("Ingresá un número.");
        return;
    }

    numeros.push(Number(raw));
    mostrarResultado("numeros[]", numeros);
    input3.value = "";
});

btn3.addEventListener("click", () => {
    if (numeros.length < 2) {
        mostrarError("Necesitás al menos 2 números para poder reemplazar.");
        return;
    }

    const pos  = input3pos.value.trim();
    const val1 = input3val1.value.trim();
    const val2 = input3val2.value.trim();

    if (pos === "" || val1 === "" || val2 === "") {
        mostrarError("Completá la posición y los dos nuevos valores.");
        return;
    }

    const posNum  = Number(pos);
    const val1Num = Number(val1);
    const val2Num = Number(val2);

    if (posNum < 0 || posNum + 1 >= numeros.length) {
        mostrarError(`La posición debe estar entre 0 y ${numeros.length - 2} para poder reemplazar 2 elementos.`);
        return;
    }

    const reemplazados = numeros.splice(posNum, 2, val1Num, val2Num);
    mostrarResultado(`numeros[] (reemplazados desde pos. ${posNum}: '${reemplazados.join(", ")}')`, numeros);

    input3pos.value  = "";
    input3val1.value = "";
    input3val2.value = "";
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