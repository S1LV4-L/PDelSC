import { URL } from 'node:url';

const url = new URL('http://127.0.0.1:3002/ruta?dato=1');

console.log("Host:", url.host);
console.log("Hostname:", url.hostname);
console.log("Puerto:", url.port);
console.log("Path:", url.pathname);
console.log("Protocolo:", url.protocol);
console.log("Query:", url.search);
console.log("URL completa:", url.href);