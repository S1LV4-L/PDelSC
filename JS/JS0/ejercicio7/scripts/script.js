// Btn 1: Encuentra la posición de la palabra "perro" en un array.
document.getElementById("btn1").addEventListener("dblclick", () => {
    const registro = document.getElementById("registro");

    let animales = ["Vaca", "Gato", "Perro", "Caballo", "Cuervo"];
    registro.appendChild(crearMensajeRegistro("animales[]", animales));

    let indicePalabra = animales.indexOf("Perro")

    registro.appendChild(crearMensajeRegistro("Indice de 'Perro'", indicePalabra));
}, { once: true });


// Btn 2: Verifica si el número 50 está en un array y en qué posición.
const btn2 = document.getElementById("btn2");
btn2.addEventListener("mouseover", () => {
    const registro = document.getElementById("registro");

    let numeros = [1, 2, 3, 4, 123, 246325, 9, 50, 0];
    registro.appendChild(crearMensajeRegistro("numeros[]", numeros));
    let indice = numeros.indexOf(50);

    if(indice > -1) registro.appendChild(crearMensajeRegistro("El número 50 si está en el array, su posición es", indice));
    else registro.appendChild(crearMensajeRegistro("El número 50 no se encuentra en el array", numeros));
}, { once: true });


// Btn 3: Dado un array de ciudades, muestra el índice de "Madrid" o un mensaje si no está.
const btn3 = document.getElementById("btn3");
btn3.addEventListener("contextmenu", () => {
    const registro = document.getElementById("registro");

    let ciudades = ["CABA", "Roma", "Londres", "Berlin", "Oslo", "Madrid", "Viena", "Edimburgo"];
    registro.appendChild(crearMensajeRegistro("ciudades[]", ciudades));
    let indice = ciudades.indexOf("Madrid");

    if(indice > -1) registro.appendChild(crearMensajeRegistro("El indice de 'Madrid' es", indice));
    else registro.appendChild(crearMensajeRegistro("'Madrid' no se encuentra en el array", ciudades));
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