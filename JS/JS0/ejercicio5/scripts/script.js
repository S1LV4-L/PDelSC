// Btn 1: Elimina dos elementos desde la posición 1 de un array de letras.
document.getElementById("btn1").addEventListener("dblclick", () => {
    const registro = document.getElementById("registro");

    let letras = ["a", "b", "c", "d", "e"];
    registro.appendChild(crearMensajeRegistro("letras[] (antes)", letras));

    letras.splice(1, 2);

    registro.appendChild(crearMensajeRegistro("letras[] (ahora)", letras));
}, { once: true });

// Btn 2: Inserta un nuevo nombre en la segunda posición sin eliminar nada.
const btn2 = document.getElementById("btn2");
btn2.addEventListener("mouseover", () => {
    const registro = document.getElementById("registro");

    let nombres = ["Pedro", "Carlos", "Juan", "Felipe"];

    registro.appendChild(
        crearMensajeRegistro("nombres[] (antes)", nombres)
    );

    nombres.splice(1, 0, "Diego");

    registro.appendChild(
        crearMensajeRegistro("nombres[] (ahora)", nombres)
    );
}, { once: true });

// Btn 3: Reemplaza dos elementos por otros nuevos desde una posición determinada.
const btn3 = document.getElementById("btn3");
btn3.addEventListener("contextmenu", () => {
    const registro = document.getElementById("registro");

    let nombres = ["Pedro", "Carlos", "Juan"];

    registro.appendChild(
        crearMensajeRegistro("nombres[] (antes)", nombres)
    );

    nombres.splice(1, 2, "Diego", "Felipe");

    registro.appendChild(
        crearMensajeRegistro("nombres[] (ahora)", nombres)
    );
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