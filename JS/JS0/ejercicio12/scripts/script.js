const registro = document.getElementById("registro");

const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+([a-zA-ZáéíóúÁÉÍÓÚñÑ ]*[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)?$/;


// Form 1: Suma todos los elementos de un array.
let numeros1 = [];
const input1 = document.getElementById("input1");
const btn1   = document.getElementById("btn1");

document.getElementById("form1").addEventListener("submit", (e) => {
    e.preventDefault();

    const raw = input1.value.trim();

    if (raw === "") {
        mostrarError("Ingresá un número.");
        return;
    }

    numeros1.push(Number(raw));
    mostrarResultado("numeros[]", numeros1);
    input1.value = "";
});

btn1.addEventListener("click", () => {
    if (numeros1.length === 0) {
        mostrarError("Agregá al menos un número antes de sumar.");
        return;
    }

    const resultado = numeros1.reduce((sum, current) => sum + current, 0);
    mostrarResultado("numeros[]", numeros1);
    mostrarResultado("Resultado (suma)", resultado);
});


// Form 2: Multiplica todos los elementos de un array de enteros.
let numeros2 = [];
const input2 = document.getElementById("input2");
const btn2   = document.getElementById("btn2");

document.getElementById("form2").addEventListener("submit", (e) => {
    e.preventDefault();

    const raw = input2.value.trim();

    if (raw === "") {
        mostrarError("Ingresá un número.");
        return;
    }

    numeros2.push(Number(raw));
    mostrarResultado("numeros[]", numeros2);
    input2.value = "";
});

btn2.addEventListener("click", () => {
    if (numeros2.length === 0) {
        mostrarError("Agregá al menos un número antes de multiplicar.");
        return;
    }

    const resultado = numeros2.reduce((acumulador, actual) => acumulador * actual, 1);
    mostrarResultado("numeros[]", numeros2);
    mostrarResultado("Resultado (multiplicación)", resultado);
});


// Form 3: Dado un array de objetos {precio}, obtiene el total de precios.
let productos = [];
const input3nombre = document.getElementById("input3nombre");
const input3precio = document.getElementById("input3precio");
const btn3         = document.getElementById("btn3");

document.getElementById("form3").addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = input3nombre.value.trim();
    const precio = input3precio.value.trim();

    if (nombre === "" || precio === "") {
        mostrarError("Completá el nombre y el precio.");
        return;
    }

    if (!soloLetras.test(nombre)) {
        mostrarError("El nombre del producto solo puede contener letras.");
        return;
    }

    const precioNum = Number(precio);

    if (precioNum <= 0) {
        mostrarError("El precio debe ser mayor a 0.");
        return;
    }

    productos.push({ nombre, precio: precioNum });
    mostrarResultado("productos[]", productos.map(p => `${p.nombre} ($${p.precio})`));

    input3nombre.value = "";
    input3precio.value = "";
});

btn3.addEventListener("click", () => {
    if (productos.length === 0) {
        mostrarError("Agregá al menos un producto antes de calcular.");
        return;
    }

    const total = productos.reduce((sum, producto) => sum + producto.precio, 0);
    mostrarResultado("productos[]", productos.map(p => `${p.nombre} ($${p.precio})`));
    mostrarResultado("Precio total", `$${total}`);
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