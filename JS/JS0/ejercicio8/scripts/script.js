const registro = document.getElementById("registro");

const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+([a-zA-ZáéíóúÁÉÍÓÚñÑ ]*[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)?$/;


// Form 1: Comprueba si un array contiene la palabra "admin".
let usuarios = [];
const input1 = document.getElementById("input1");
const btn1   = document.getElementById("btn1");

document.getElementById("form1").addEventListener("submit", (e) => {
    e.preventDefault();

    const valor = input1.value.trim();

    if (valor === "") {
        mostrarError("Ingresá un usuario.");
        return;
    }

    if (!isNaN(valor)) {
        mostrarError("El usuario no puede contener solo números.");
        return;
    }

    usuarios.push(valor);
    mostrarResultado("usuarios[]", usuarios);
    input1.value = "";
});

btn1.addEventListener("click", () => {
    if (usuarios.length === 0) {
        mostrarError("Agregá al menos un usuario antes de comprobar.");
        return;
    }

    const buscar = "admin";
    const encontrado = usuarios.map(u => u.toLowerCase()).includes(buscar);

    encontrado
        ? mostrarResultado(`usuarios[] sí contiene '${buscar}'`, usuarios)
        : mostrarResultado(`usuarios[] no contiene '${buscar}'`, usuarios);
});


// Form 2: Dado un array de colores, indica si existe "verde".
let colores = [];
const input2 = document.getElementById("input2");
const btn2   = document.getElementById("btn2");

document.getElementById("form2").addEventListener("submit", (e) => {
    e.preventDefault();

    const valor = input2.value.trim();

    if (valor === "") {
        mostrarError("Ingresá un color.");
        return;
    }

    if (!soloLetras.test(valor)) {
        mostrarError("El color solo puede contener letras.");
        return;
    }

    colores.push(valor);
    mostrarResultado("colores[]", colores);
    input2.value = "";
});

btn2.addEventListener("click", () => {
    if (colores.length === 0) {
        mostrarError("Agregá al menos un color antes de buscar.");
        return;
    }

    const buscar = "verde";
    const encontrado = colores.map(c => c.toLowerCase()).includes(buscar);

    encontrado
        ? mostrarResultado(`En colores[] sí existe '${buscar}'`, colores)
        : mostrarResultado(`En colores[] no existe '${buscar}'`, colores);
});


// Form 3: Verifica si un número está presente antes de sumarlo al array.
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

    if (numeros.includes(raw)) {
        mostrarResultado(`numeros[] ya contiene el número ${raw}`, numeros);
        return;
    }
    else{
        numeros.push(raw);
        mostrarResultado("numeros[]", numeros);
    }

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