const registro = document.getElementById("registro");

const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+([a-zA-ZáéíóúÁÉÍÓÚñÑ ]*[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)?$/;


// Form 1: Ordena un array de números de menor a mayor.
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
    if (numeros.length < 2) {
        mostrarError("Agregá al menos 2 números para ordenar.");
        return;
    }

    mostrarResultado("numeros[] (antes)", numeros);
    numeros.sort((a, b) => a - b);
    mostrarResultado("numeros[] (ordenado)", numeros);
});


// Form 2: Ordena un array de palabras alfabéticamente.
let palabras = [];
const input2 = document.getElementById("input2");
const btn2   = document.getElementById("btn2");

document.getElementById("form2").addEventListener("submit", (e) => {
    e.preventDefault();

    const valor = input2.value.trim();

    if (valor === "") {
        mostrarError("Ingresá una palabra.");
        return;
    }

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(valor)) {
        mostrarError("Solo se permite una única palabra, sin espacios ni números.");
        return;
    }

    palabras.push(valor);
    mostrarResultado("palabras[]", palabras);
    input2.value = "";
});

btn2.addEventListener("click", () => {
    if (palabras.length < 2) {
        mostrarError("Agregá al menos 2 palabras para ordenar.");
        return;
    }

    mostrarResultado("palabras[] (antes)", palabras);
    palabras.sort((a, b) => a.localeCompare(b));
    mostrarResultado("palabras[] (ordenado)", palabras);
});


// Form 3: Dado un array de objetos {nombre, edad}, ordénalos por edad.
let usuarios = [];
const input3nombre = document.getElementById("input3nombre");
const input3edad   = document.getElementById("input3edad");
const btn3         = document.getElementById("btn3");

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

    usuarios.push({ nombre, edad: edadNum });
    mostrarResultado("usuarios[]", usuarios.map(u => `${u.nombre} (${u.edad})`));

    input3nombre.value = "";
    input3edad.value   = "";
});

btn3.addEventListener("click", () => {
    if (usuarios.length < 2) {
        mostrarError("Agregá al menos 2 usuarios para ordenar.");
        return;
    }

    mostrarResultado("usuarios[] (antes)", usuarios.map(u => `${u.nombre} (${u.edad})`));
    usuarios.sort((a, b) => a.edad - b.edad);
    mostrarResultado("usuarios[] (ordenado por edad)", usuarios.map(u => `${u.nombre} (${u.edad})`));
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