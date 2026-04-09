// server.mjs

// Importa el módulo HTTP nativo de Node (para crear el servidor web)
import { createServer } from 'node:http';

// Importa función para leer archivos del sistema (index.html, script.js y styles.css)
import { readFile } from 'node:fs/promises';

const server = createServer(async (req, res) => {

  // req.url contiene la ruta que pide el navegador, por ejemplo:
  // "/" es index.html
  // "/script.js": archivo JS
  // "/styles.css": archivo CSS
  // para que funcione el terminal tiene que estar en la carpeta donde estan esos archivos, antes de ejecutar node server.js

  try {
    let file = "index.html";
    let contentType = "text/html";

    if (req.url === "/script.js") {
      file = "script.js";
      contentType = "application/javascript";
    }

    if (req.url === "/styles.css") {
      file = "styles.css";
      contentType = "text/css";
    }

    const data = await readFile(file); // Lee el archivo desde el disco
    res.writeHead(200, { 'Content-Type': contentType }); // Envía respuesta HTTP correcta
    res.end(data); // Envía el contenido del archivo al navegador

  } catch (error) { // Si el archivo no existe o hay error
    res.writeHead(404);
    res.end("Archivo no encontrado");
  }
});

server.listen(3001, '127.0.0.1', () => { //Inicia el servidor en localhost:3001
  console.log('Servidor en http://127.0.0.1:3001');
});