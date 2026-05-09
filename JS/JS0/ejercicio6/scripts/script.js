// Btn 1: Copia los primeros 3 elementos de un array de números
document.getElementById("btn1").addEventListener("dblclick", () => {
    const registro = document.getElementById("registro");

    let numeros = [10, 20, 30, 40, 50];
    registro.appendChild(crearMensajeRegistro("numeros[] (original)", numeros));

    let primerosTres = numeros.slice(0, 3);

    registro.appendChild(crearMensajeRegistro("primeros 3 elementos", primerosTres));
}, { once: true });


// Btn 2: Copia parcial de un array de películas desde la posición 2 hasta la 4
const btn2 = document.getElementById("btn2");
btn2.addEventListener("mouseover", () => {
    const registro = document.getElementById("registro");

    let peliculas = ["Inception", "Matrix", "Interstellar", "Avatar", "Dune"];
    registro.appendChild(crearMensajeRegistro("peliculas[] (original)", peliculas));

    let copiaParcial = peliculas.slice(2, 5);

    registro.appendChild(crearMensajeRegistro("copia parcial (pos. 2 a 4)", copiaParcial));
}, { once: true });


// Btn 3: Nuevo array con los últimos 3 elementos sin modificar el original
const btn3 = document.getElementById("btn3");
btn3.addEventListener("contextmenu", () => {
    const registro = document.getElementById("registro");

    let numeros = [5, 15, 25, 35, 45, 55];
    registro.appendChild(crearMensajeRegistro("numeros[] (original)", numeros));

    let ultimosTres = numeros.slice(-3);

    registro.appendChild(crearMensajeRegistro("últimos 3 elementos", ultimosTres));
    registro.appendChild(crearMensajeRegistro("numeros[] (sin modificar)", numeros));
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