// Btn 1: Suma todos los elementos de un array.
document.getElementById("btn1").addEventListener("dblclick", () => {
    const registro = document.getElementById("registro");

    let numeros = [1, 2, 3, 4, 5];
    registro.appendChild(crearMensajeRegistro("numeros[]", numeros));

    let resultado = numeros.reduce((sum, current) => sum + current, 0);

    registro.appendChild(crearMensajeRegistro("Resultado", resultado));
}, { once: true });


// Btn 2: Multiplica todos los elementos de un array de enteros.
const btn2 = document.getElementById("btn2");
btn2.addEventListener("mouseover", () => {
    const registro = document.getElementById("registro");

    let numeros = [3, 4, 5, 6, 7];
    registro.appendChild(crearMensajeRegistro("numeros[]", numeros));

    let resultado = numeros.reduce((acumulador, actual) => acumulador * actual, 1);

    registro.appendChild(crearMensajeRegistro("Resultado", resultado));
}, { once: true });


// Btn 3: Dado un array de objetos {precio}, obtiene el total de precios.
const btn3 = document.getElementById("btn3");
btn3.addEventListener("contextmenu", () => {
    const registro = document.getElementById("registro");

    let productos = [
        { nombre: "Laptop", precio: 1500 },
        { nombre: "Mouse", precio: 25 },
        { nombre: "Teclado", precio: 45 },
        { nombre: "Monitor", precio: 300 }
    ];
    registro.appendChild(crearMensajeRegistro("productos[]", productos.map(p => `${p.nombre} ($${p.precio})`)));

    let total = productos.reduce((sum, producto) => sum + producto.precio, 0);
    registro.appendChild(crearMensajeRegistro("Precio total", `$${total}`));
}, { once: true });


function crearMensajeRegistro(label, valor) {
    const mensaje = document.createElement("p");
    const texto1 = document.createElement("strong");
    texto1.textContent = label + ": ";

    const contenido = Array.isArray(valor) ? valor.join(", ") : valor;

    const valorSpan = document.createElement("span");
    valorSpan.textContent = contenido;

    mensaje.appendChild(texto1);
    mensaje.append(" '");
    mensaje.appendChild(valorSpan);
    mensaje.append("'");

    return mensaje;
}