// Btn 1: Elimina el último elemento de un array de animales.
document.getElementById("btn1").addEventListener("dblclick", () => {
    const registro = document.getElementById("registro");

    let animales = ["perro", "gato", "pez", "pato"];

    animales.pop(animales[animales.length - 1])
    registro.appendChild(crearMensajeRegistro("animales (ahora)", animales));
}, { once: true });


// Btn 2: Quita el último producto de una lista de compras y muestra cuál fue eliminado.
const btn2 = document.getElementById("btn2");
btn2.addEventListener("mouseover", () => {
    const registro = document.getElementById("registro");

    let listaDeCompras = ["pan", "harina", "detergente", "azucar"];
    registro.appendChild(crearMensajeRegistro("listaDeCompras (antes)", listaDeCompras));

    listaDeCompras.pop(listaDeCompras[listaDeCompras.length - 1])
    registro.appendChild(crearMensajeRegistro("listaDeCompras (ahora)", listaDeCompras));
}, { once: true });


// Btn 3: Usa un bucle while para vaciar un array con pop().
const btn3 = document.getElementById("btn3");
btn3.addEventListener("contextmenu", () => {
    const registro = document.getElementById("registro");
    let numeros = [1, 2, 3, 4, 5, 6];
    
    registro.appendChild(crearMensajeRegistro("numeros (antes)", numeros));

    while(numeros.length > 0){
        let i=0;
        numeros.pop(numeros[i]);
        i++;
    }

    registro.appendChild(crearMensajeRegistro("numeros (ahora)", numeros));
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