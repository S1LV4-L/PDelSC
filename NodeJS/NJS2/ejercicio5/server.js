import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { mostrarClima, crearPronostico, mostrarDatosExtra } from "./modules/clima.js";
import { crearMenu } from "./modules/menu.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.use("/scripts", express.static(path.join(__dirname, "scripts")));
app.use("/modules", express.static(path.join(__dirname, "modules")));
app.use("/styles", express.static(path.join(__dirname, "styles")));

// Lee un HTML, reemplaza el menú y los placeholders dados, y lo envía
function renderPagina(res, nombreArchivo, datos = {}) {
    const ruta = path.join(__dirname, "pages", nombreArchivo);

    fs.readFile(ruta, "utf-8", (error, html) => {
        if (error) {
            res.status(404).send("Página no encontrada");
            return;
        }

        let resultado = html.replace("<div id=\"menu\"></div>", crearMenu());

        for (const clave in datos) {
            resultado = resultado.replaceAll(`{{${clave}}}`, datos[clave]);
        }

        res.send(resultado);
    });
}

const emojisEstado = { Soleado: "☀️", Nublado: "☁️", Lluvioso: "🌧", Tormenta: "⛈", Ventoso: "💨" };

app.get("/", (req, res) => {
    const clima = mostrarClima();
    renderPagina(res, "inicio.html", {
        estado: clima.estado,
        emoji_estado: emojisEstado[clima.estado],
        temperatura: clima.temperatura,
        humedad: clima.humedad,
        presion: clima.presion
    });
});

app.get("/pronostico.html", (req, res) => {
    renderPagina(res, "pronostico.html", {
        pronostico: crearPronostico()
    });
});

app.get("/mapa.html", (req, res) => {
    renderPagina(res, "mapa.html");
});

app.get("/radar.html", (req, res) => {
    renderPagina(res, "radar.html");
});

app.get("/datos-extra.html", (req, res) => {
    const datos = mostrarDatosExtra();
    renderPagina(res, "datos-extra.html", {
        uv: datos.uv,
        uv_descripcion: "Nivel " + datos.uv,
        viento_velocidad: datos.vientoVelocidad,
        viento_direccion: datos.vientoDireccion,
        sensacion_termica: datos.sensacionTermica,
        visibilidad: datos.visibilidad,
        nubosidad: datos.nubosidad
    });
});

app.get("/acerca-de.html", (req, res) => {
    renderPagina(res, "acerca-de.html");
});

app.listen(3303, () => {
    console.log("Servidor corriendo en http://localhost:3303");
});