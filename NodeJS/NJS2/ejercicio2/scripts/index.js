import { crearServidor } from '../server.js';

const server = crearServidor();

server.listen(3002, () => {
    console.log("Servidor en http://localhost:3002");
});