import { createServer } from 'node:http';
import { readFile, realpathSync } from 'node:fs';

const base = realpathSync('..');

const server = createServer((req, res) => {
    let file = `${base}/pages/pagina1.html`;
    let contentType = "text/html";

    if (req.url === "/estilos.css") {
        file = `${base}/styles/estilos.css`;
        contentType = "text/css";
    }

    readFile(file, (error, data) => {
        if (error) {
            console.error('Error:', error.message);
            res.writeHead(404);
            res.end("Archivo no encontrado");
            return;
        }

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(3002, '127.0.0.1', () => {
  console.log('Listening on 127.0.0.1:3002');
});