document.getElementById("btn1").addEventListener("click", () => {
    const enlaces = document.getElementById("Enlaces");

    if (enlaces.children.length === 0) {
        const urls = ["https://google.com", "https://youtube.com", "https://wikipedia.org", "https://getbootstrap.com", "https://wordreference.com"];

        urls.forEach((url, i) => {
            const enlace = document.createElement("a");
            enlace.href = url;
            enlace.textContent = `Enlace ${i + 1}`;
            enlace.target = "_blank";
            enlace.id = `enlace${i + 1}`;
            enlace.setAttribute("class", "link-offset-2");

            enlaces.appendChild(enlace);
            enlaces.appendChild(document.createElement("br"));
        });
    }
});

const sitios = [
    { url1: "https://google.com/",        url2: "https://microsoft.com/",     nombre1: "Google",        nombre2: "Microsoft" },
    { url1: "https://youtube.com/",       url2: "https://stackoverflow.com/", nombre1: "Youtube",       nombre2: "StackOverflow" },
    { url1: "https://wikipedia.org/",     url2: "https://apple.com/",         nombre1: "Wikipedia",     nombre2: "Apple" },
    { url1: "https://getbootstrap.com/",  url2: "https://nodejs.org/",        nombre1: "Bootstrap",     nombre2: "NodeJS" },
    { url1: "https://wordreference.com/", url2: "https://openai.com/",        nombre1: "Wordreference", nombre2: "OpenAI" },
];

let cambiado = false;
const btn2 = document.getElementById("btn2");

btn2.addEventListener("click", () => {
    const links = document.getElementById("Enlaces").querySelectorAll("a"); // Obtiene todos los enlaces creados

    const registro = document.getElementById("registro");
    registro.innerHTML = "";

    links.forEach((link, i) => {
        const sitio = sitios[i];
        const antes = link.href;
        let esEnlaceOriginal;

        link.href = cambiado ? sitio.url1 : sitio.url2; //if(cambiado) link.href = sitio.url1; else link.href = sitio.url2;

        // Verifica si el texto es el original ("Enlace N")
        if (link.textContent.trim() === `Enlace ${i + 1}`) esEnlaceOriginal = true;
        else esEnlaceOriginal = false;

        // Si el texto ya fue modificado antes, lo actualiza con el nombre correspondiente
        if (!esEnlaceOriginal) {
            link.textContent = cambiado ? sitio.nombre1 : sitio.nombre2;
        }

        registro.appendChild(crearMensajeRegistro("href", antes, link.href));
    });

    cambiado = !cambiado;
});


const btn3 = document.getElementById("btn3");
let mostrandoNombres = false;

btn3.addEventListener("click", () => {
    const links = document.getElementById("Enlaces").querySelectorAll("a");

    const registro = document.getElementById("registro");
    registro.innerHTML = "";

    links.forEach((link, i) => {
        const sitio = sitios[i];
        const antes = link.textContent;

        if (mostrandoNombres) {
            // Si ya se estaban mostrando nombres, vuelve al formato original
            link.textContent = `Enlace ${i + 1}`;
        } 
        else {
            // Si no, asigna el nombre según la URL actual del enlace
            if (link.href === sitio.url1) {
                link.textContent = sitio.nombre1;
            } 
            else if (link.href === sitio.url2) {
                link.textContent = sitio.nombre2;
            }
        }

        registro.appendChild(
            crearMensajeRegistro("textContent", antes, link.textContent)
        );
    });

    mostrandoNombres = !mostrandoNombres;
});

const estilos = [
    "link-primary link-offset-3 link-underline-opacity-25 link-underline-opacity-100-hover",
    "link-success link-offset-3 link-underline-opacity-25 link-underline-opacity-100-hover",
    "link-danger link-offset-3 link-underline-opacity-25 link-underline-opacity-100-hover",
    "link-warning link-offset-3 link-underline-opacity-25 link-underline-opacity-100-hover",
    "link-secondary link-offset-3 link-underline-opacity-25 link-underline-opacity-100-hover"
];

const btn4 = document.getElementById("btn4");

btn4.addEventListener("click", () => {
    const links = document.getElementById("Enlaces").querySelectorAll("a");
    const registro = document.getElementById("registro");
    registro.innerHTML = "";

    links.forEach((link, i) => {
        const antes = link.getAttribute("class");

        if (!antes.includes("hover")) {
            link.setAttribute("class", estilos[i]);
        }
        else {
            link.setAttribute("class", "link-offset-2");
        }

        registro.appendChild(crearMensajeRegistro("class", antes, link.getAttribute("class")));
    });
});

function crearMensajeRegistro(label, antes, despues) {
    const mensaje = document.createElement("p");
    const texto1 = document.createElement("strong");
    texto1.textContent = label + ":";

    const antesSpan = document.createElement("span");
    antesSpan.textContent = antes;
    antesSpan.style.textDecoration = "underline";

    const despuesSpan = document.createElement("span");
    despuesSpan.textContent = despues;
    despuesSpan.style.textDecoration = "underline";

    mensaje.appendChild(texto1);
    mensaje.append(" '");
    mensaje.appendChild(antesSpan);
    mensaje.append("' cambió a '");
    mensaje.appendChild(despuesSpan);
    mensaje.append("'");

    return mensaje;
}