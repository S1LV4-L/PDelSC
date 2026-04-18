import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { cargarInicio, cargarPronostico, cargarMapa, cargarRadar, cargarDatosExtra, cargarAcercaDe } from "./main.js";

const server = createServer(async (req, res) => {
    try {
        const url = req.url.split("?")[0];
        let file;
        let cargar;

        if (url === "/" || url === "/inicio.html") {
            file = "./pages/inicio.html";
            cargar = cargarInicio;
        } else if (url === "/pronostico.html") {
            file = "./pages/pronostico.html";
            cargar = cargarPronostico;
        } else if (url === "/mapa.html") {
            file = "./pages/mapa.html";
            cargar = cargarMapa;
        } else if (url === "/radar.html") {
            file = "./pages/radar.html";
            cargar = cargarRadar;
        } else if (url === "/datos-extra.html") {
            file = "./pages/datos-extra.html";
            cargar = cargarDatosExtra;
        } else if (url === "/acerca-de.html") {
            file = "./pages/acerca-de.html";
            cargar = cargarAcercaDe;
        } else {
            res.writeHead(404);
            res.end("Página no encontrada");
            return;
        }

        let data = await readFile(file, "utf-8");
        data = cargar(data);

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
    } catch (error) {
        console.error(error);
        res.writeHead(404);
        res.end("Archivo no encontrado");
    }
});

server.listen(3003, () => console.log("Servidor en http://localhost:3003"));