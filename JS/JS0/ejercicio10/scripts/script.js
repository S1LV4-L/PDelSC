// Btn 1: Crea un nuevo array con cada número multiplicado por 3.
document.getElementById("btn1").addEventListener("dblclick", () => {
    const registro = document.getElementById("registro");

    let numeros = [11, 22, 33, 44, 55, 66].map(num => num * 3);
    registro.appendChild(crearMensajeRegistro("numeros[]", numeros));
}, { once: true });


// Btn 2: Convierte un array de nombres en mayúsculas.
const btn2 = document.getElementById("btn2");
btn2.addEventListener("mouseover", () => {
    const registro = document.getElementById("registro");

    let nombres = ["pedro", "juan", "diego", "julian"];
    registro.appendChild(crearMensajeRegistro("nombres[] (antes)", nombres));

    let nombresMayusculas = nombres.map(nombre => nombre.toUpperCase());
    registro.appendChild(crearMensajeRegistro("nombres[] (ahora)", nombresMayusculas));
}, { once: true });


// Btn 3: A un array de precios, agrégale el 21% de IVA y crea un nuevo array.
const btn3 = document.getElementById("btn3");
btn3.addEventListener("contextmenu", () => {
    const registro = document.getElementById("registro");

    let precios = [11, 22, 33, 44, 55, 66];
    registro.appendChild(crearMensajeRegistro("Precios sin IVA", precios));

    let preciosConIva = precios.map(num => parseFloat((num * 1.21).toFixed(2)));
    registro.appendChild(crearMensajeRegistro("Precios con IVA", preciosConIva));
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