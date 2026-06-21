import { createServer } from 'node:http';
import { readFile } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function crearServidor() {
    return createServer((req, res) => {
        let file;
        let contentType;

        if (req.url === '/scripts/script.js') {
            file = path.join(__dirname, 'scripts', 'script.js');
            contentType = 'text/javascript';
        } else if (req.url === '/modules/nightDayButton.js') {
            file = path.join(__dirname, 'modules', 'nightDayButton.js');
            contentType = 'text/javascript';
        } else {
            file = path.join(__dirname, 'pages', 'pagina_ejemplo.html');
            contentType = 'text/html';
        }

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