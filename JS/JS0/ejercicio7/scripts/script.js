const registro = document.getElementById("registro");

const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+([a-zA-ZáéíóúÁÉÍÓÚñÑ ]*[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)?$/;


// Form 1: Encuentra la posición de la palabra "perro" en un array.
let animales = [];
const input1 = document.getElementById("input1");
const btn1   = document.getElementById("btn1");

document.getElementById("form1").addEventListener("submit", (e) => {
    e.preventDefault();

    const valor = input1.value.trim();

    if (valor === "") {
        mostrarError("Ingresá un animal.");
        return;
    }

    if (!soloLetras.test(valor)) {
        mostrarError("El animal solo puede contener letras.");
        return;
    }

    animales.push(valor);
    mostrarResultado("animales[]", animales);
    input1.value = "";
});

btn1.addEventListener("click", () => {
    const valor = "Perro";

    if (animales.length === 0) {
        mostrarError("Agregá al menos un animal antes de buscar.");
        return;
    }

    // Búsqueda case-insensitive: compara todo en minúsculas
    const indice = animales.findIndex(a => a.toLowerCase() === valor.toLowerCase());

    if (indice > -1) {
        mostrarResultado(`Índice de '${valor}'`, indice);
    } else {
        mostrarResultado(`'${valor}' no se encuentra en animales[]`, animales);
    }

    input1.value = "";
});


// Form 2: Verifica si el número 50 está en un array y en qué posición.
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
        mostrarError("Agregá al menos un número antes de verificar.");
        return;
    }

    const num = 50;
    const indice = numeros.indexOf(num);

    if (indice > -1) {
        mostrarResultado(`El número ${num} está en el array, su posición es`, indice);
    } else {
        mostrarResultado(`El número ${num} no se encuentra en numeros[]`, numeros);
    }

    input2.value = "";
});


// Form 3: Dado un array de ciudades, muestra el índice de "Madrid" o un mensaje si no está.
let ciudades = [];
const input3 = document.getElementById("input3");
const btn3   = document.getElementById("btn3");

document.getElementById("form3").addEventListener("submit", (e) => {
    e.preventDefault();

    const valor = input3.value.trim();

    if (valor === "") {
        mostrarError("Ingresá una ciudad.");
        return;
    }

    if (!soloLetras.test(valor)) {
        mostrarError("La ciudad solo puede contener letras.");
        return;
    }

    ciudades.push(valor);
    mostrarResultado("ciudades[]", ciudades);
    input3.value = "";
});

btn3.addEventListener("click", () => {
    const valor = "Madrid";

    if (ciudades.length === 0) {
        mostrarError("Agregá al menos una ciudad antes de buscar.");
        return;
    }

    const indice = ciudades.findIndex(c => c.toLowerCase() === valor.toLowerCase());

    if (indice > -1) {
        mostrarResultado(`Índice de 'Madrid'`, indice);
    } else {
        mostrarResultado(`'Madrid' no se encuentra en ciudades[]`, ciudades);
    }

    input3.value = "";
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