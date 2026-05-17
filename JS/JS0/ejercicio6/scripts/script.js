const registro = document.getElementById("registro");

const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+([a-zA-ZáéíóúÁÉÍÓÚñÑ ]*[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)?$/;

// Form 1: Copia los primeros 3 elementos de un array de números.
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

let flag1 = false;
btn1.addEventListener("click", () => {
    if (numeros.length < 3) {
        mostrarError(`Necesitás al menos 3 números (tenés ${numeros.length}).`);
        return;
    } else if (flag1) return;

    const primerosTres = numeros.slice(0, 3);
    mostrarResultado("numeros[] (original)", numeros);
    mostrarResultado("primeros 3 elementos", primerosTres);
    flag1 = true
});


// Form 2: Crea una copia parcial de un array de películas desde la posición 2 hasta la 4.
let peliculas = [];
const input2 = document.getElementById("input2");
const btn2   = document.getElementById("btn2");

document.getElementById("form2").addEventListener("submit", (e) => {
    e.preventDefault();

    const valor = input2.value.trim();

    if (valor === "") {
        mostrarError("Ingresá una película.");
        return;
    }

    if (!isNaN(valor)) {
        mostrarError("El nombre de la película no puede ser solo números.");
        return;
    }

    peliculas.push(valor);
    mostrarResultado("peliculas[]", peliculas);
    input2.value = "";
});

let flag2 = false;
btn2.addEventListener("click", () => {
    if (peliculas.length < 5) {
        mostrarError(`Necesitás al menos 5 películas para copiar de pos. 2 a 4 (tenés ${peliculas.length}).`);
        return;
    } else if (flag2) return;

    const copiaParcial = peliculas.slice(2, 5);
    mostrarResultado("peliculas[] (original)", peliculas);
    mostrarResultado("copia parcial (pos. 2 a 4)", copiaParcial);
    flag2 = true;
});


// Form 3: Crea un array nuevo con los últimos 3 elementos sin modificarlos.
let numeros3 = [];  // nombre distinto para no chocar con numeros del form 1
const input3 = document.getElementById("input3");
const btn3   = document.getElementById("btn3");

document.getElementById("form3").addEventListener("submit", (e) => {
    e.preventDefault();

    const raw = input3.value.trim();

    if (raw === "") {
        mostrarError("Ingresá un número.");
        return;
    }

    numeros3.push(Number(raw));
    mostrarResultado("numeros3[]", numeros3);
    input3.value = "";
});

btn3.addEventListener("click", () => {
    if (numeros3.length < 3) {
        mostrarError(`Necesitás al menos 3 números (tenés ${numeros3.length}).`);
        return;
    }

    const ultimosTres = numeros3.slice(-3);
    mostrarResultado("numeros3[] (original)", numeros3);
    mostrarResultado("últimos 3 elementos", ultimosTres);
    mostrarResultado("numeros3[] (sin modificar)", numeros3);
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