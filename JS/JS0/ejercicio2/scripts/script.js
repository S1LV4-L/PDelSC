const registro = document.getElementById("registro");

const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+([a-zA-ZáéíóúÁÉÍÓÚñÑ ]*[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)?$/;

// Form 1: Elimina el último elemento de un array de animales.
let animales = [];
const input1 = document.getElementById("input1");
const sbmt1  = document.getElementById("sbmt1");
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
    if (animales.length === 0) {
        mostrarError("El array de animales ya está vacío.");
        return;
    }

    const eliminado = animales.pop();
    mostrarResultado(`animales[]`, animales);
});


// Form 2: Quita el último producto de una lista de compras y muestra cuál fue eliminado.
let listaDeCompras = [];
const input2 = document.getElementById("input2");
const btn2   = document.getElementById("btn2");

document.getElementById("form2").addEventListener("submit", (e) => {
    e.preventDefault();

    const valor = input2.value.trim();

    if (valor === "") {
        mostrarError("Ingresá un producto.");
        return;
    }

    if (!soloLetras.test(valor)) {
        mostrarError("El producto solo puede contener letras.");
        return;
    }

    listaDeCompras.push(valor);
    mostrarResultado("listaDeCompras[]", listaDeCompras);
    input2.value = "";
});

btn2.addEventListener("click", () => {
    if (listaDeCompras.length === 0) {
        mostrarError("La lista de compras ya está vacía.");
        return;
    }

    const eliminado = listaDeCompras.pop();
    mostrarResultado(`listaDeCompras[] (eliminado: '${eliminado}')`, listaDeCompras);
});


// Form 3: Usa un bucle while para vaciar un array con pop().
let numeros = [];
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

    if (isNaN(num)) {
        mostrarError("Solo se permiten números.");
        return;
    }

    numeros.push(num);
    mostrarResultado("numeros[]", numeros);
    input3.value = "";
});

btn3.addEventListener("click", () => {
    if (numeros.length === 0) {
        mostrarError("El array de números ya está vacío.");
        return;
    }

    mostrarResultado("numeros[] (antes de vaciar)", numeros);

    while (numeros.length > 0) {
        numeros.pop();
    }

    mostrarResultado("numeros[] (después de vaciar)", numeros);
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
    registro.scrollTop = registro.scrollHeight;

    setTimeout(() => p.remove(), 3000);
}