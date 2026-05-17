const registro = document.getElementById("registro");

const soloLetra  = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]$/;


// Form 1: Invierte un array de letras.
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
    if (letras.length < 2) {
        mostrarError("Agregá al menos 2 letras para invertir.");
        return;
    }

    mostrarResultado("letras[] (antes)", letras);
    letras.reverse();
    mostrarResultado("letras[] (invertido)", letras);
});


// Form 2: Invierte el orden de un array de números.
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
    if (numeros.length < 2) {
        mostrarError("Agregá al menos 2 números para invertir.");
        return;
    }

    mostrarResultado("numeros[] (antes)", numeros);
    numeros.reverse();
    mostrarResultado("numeros[] (invertido)", numeros);
});


// Form 3: Dado un string, conviertelo en array y revierte el texto.
let frase = "";
const input3 = document.getElementById("input3");
const btn3   = document.getElementById("btn3");

document.getElementById("form3").addEventListener("submit", (e) => {
    e.preventDefault();

    const valor = input3.value.trim();

    if (valor === "") {
        mostrarError("Ingresá una frase.");
        return;
    }

    if (!isNaN(valor)) {
        mostrarError("La frase no puede ser solo números.");
        return;
    }

    frase = valor;
    mostrarResultado("frase", frase);
    input3.value = "";
});

btn3.addEventListener("click", () => {
    if (frase === "") {
        mostrarError("Ingresá una frase antes de invertir.");
        return;
    }

    const arrayFrase = frase.split("");
    mostrarResultado("arrayFrase[]", arrayFrase);

    arrayFrase.reverse();
    mostrarResultado("arrayFrase[] (invertido)", arrayFrase);
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