const registro = document.getElementById("registro");

const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+([a-zA-ZáéíóúÁÉÍÓÚñÑ ]*[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)?$/;

// Form 1: Quita el primer número de un array de enteros.
let numeros = [];
const input1 = document.getElementById("input1");
const btn1   = document.getElementById("btn1");

document.getElementById("form1").addEventListener("submit", (e) => {
    e.preventDefault();

    const raw = input1.value.trim();

    if (raw === "") {
        mostrarError("Ingresá un número entero.");
        return;
    }

    const num = Number(raw);

    if (!Number.isInteger(num)) {
        mostrarError("Solo se permiten números enteros.");
        return;
    }

    numeros.push(num);
    mostrarResultado("numeros[]", numeros);
    input1.value = "";
});

btn1.addEventListener("click", () => {
    if (numeros.length === 0) {
        mostrarError("El array de números ya está vacío.");
        return;
    }

    const eliminado = numeros.shift();
    mostrarResultado(`numeros[] (eliminado: '${eliminado}')`, numeros);
});


// Form 2: Elimina el primer mensaje de un array de mensajes de chat.
let mensajesDelChat = [];
const input2 = document.getElementById("input2");
const btn2   = document.getElementById("btn2");

document.getElementById("form2").addEventListener("submit", (e) => {
    e.preventDefault();

    const valor = input2.value.trim();

    if (valor === "") {
        mostrarError("Ingresá un mensaje.");
        return;
    }

    mensajesDelChat.push(valor);
    mostrarResultado("mensajesDelChat[]", mensajesDelChat);
    input2.value = "";
});

btn2.addEventListener("click", () => {
    if (mensajesDelChat.length === 0) {
        mostrarError("El chat ya está vacío.");
        return;
    }

    const eliminado = mensajesDelChat.shift();
    mostrarResultado(`mensajesDelChat[] (eliminado: '${eliminado}')`, mensajesDelChat);
});


// Form 3: Usa shift() para simular una cola de atención al cliente.
let colaClientes = [];
const input3 = document.getElementById("input3");
const btn3   = document.getElementById("btn3");

document.getElementById("form3").addEventListener("submit", (e) => {
    e.preventDefault();

    const valor = input3.value.trim();

    if (valor === "") {
        mostrarError("Ingresá un cliente.");
        return;
    }

    if (!soloLetras.test(valor)) {
        mostrarError("El nombre solo puede contener letras.");
        return;
    }

    colaClientes.push(valor);
    mostrarResultado("colaClientes[]", colaClientes);
    input3.value = "";
});

btn3.addEventListener("click", () => {
    if (colaClientes.length === 0) {
        mostrarError("La cola de clientes ya está vacía.");
        return;
    }

    const atendido = colaClientes.shift();
    mostrarResultado(`Cliente atendido`, atendido);
    mostrarResultado(`colaClientes[]`, colaClientes);
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