import { createServer } from 'node:http';
import { readFile } from 'node:fs';

export function crearServidor() {
    return createServer((req, res) => {
        let file = './pages/pagina_ejemplo.html';
        let contentType = "text/html";

        readFile(file, (error, data) => {
            if (error) {
                res.writeHead(404);
                res.end("Archivo no encontrado");
                return;
            }

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    });
}