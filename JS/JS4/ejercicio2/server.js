import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "data");
const dataFile = path.join(dataDir, "usuarios.json");

// Garantiza que el archivo exista antes de levantar el servidor
async function inicializarDatos() {
    await fs.mkdir(dataDir, { recursive: true });

    try {
        await fs.access(dataFile);
    } catch {
        await fs.writeFile(dataFile, "[]");
    }
}

async function leerUsuarios() {
    const contenido = await fs.readFile(dataFile, "utf-8");
    return JSON.parse(contenido);
}

async function guardarUsuarios(usuarios) {
    await fs.writeFile(dataFile, JSON.stringify(usuarios, null, 2));
}

app.use(express.json());

app.use("/scripts", express.static(path.join(__dirname, "scripts")));
app.use("/pages", express.static(path.join(__dirname, "pages")));
app.use("/modules", express.static(path.join(__dirname, "modules")));
app.use("/styles", express.static(path.join(__dirname, "styles")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "pagina1.html"));
});

// Endpoint que el frontend consulta con axios.post() para traer los usuarios guardados localmente.
app.post("/api/usuarios/listar", async (req, res) => {
    try {
        const usuarios = await leerUsuarios();
        res.json(usuarios); // El body de la respuesta es el que axios recibe en response.data en el frontend
    } catch (error) {
        console.error("Error al leer usuarios:", error);
        res.status(500).json({ error: "No se pudieron leer los usuarios" });
    }
});

// Endpoint que el frontend consulta con axios.post() al enviar el formulario.
// Este servidor actúa como intermediario (proxy): reenvía el body recibido (name, email) a la API externa JSONPlaceholder mediante fetch, y devuelve tal cual lo que esa API responde. El "id" que finalmente ve el usuario es el que genera JSONPlaceholder, no este servidor.
app.post("/api/usuarios", async (req, res) => {
    try {
        // fetch nativo de Node hace el POST real a la API externa
        const respuesta = await fetch("https://jsonplaceholder.typicode.com/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body)
        });

        if (!respuesta.ok) {
            throw new Error(`Error externo: ${respuesta.status}`);
        }

        // como la API es simulada no persiste datos reales, por eso siempre devuelve el mismo id (comportamiento esperado, no un bug)
        const usuarioCreado = await respuesta.json();
        res.json(usuarioCreado); // Esto es lo que axios recibe como response.data en script.js
    } catch (error) {
        console.error("Error al crear usuario:", error);
        res.status(500).json({ error: "No se pudo crear el usuario" });
    }
});

inicializarDatos().then(() => {
    app.listen(3031, () => {
        console.log("Servidor corriendo en http://localhost:3031");
    });
});