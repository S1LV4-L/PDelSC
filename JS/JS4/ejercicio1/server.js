import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.use("/scripts", express.static(path.join(__dirname, "scripts")));
app.use("/pages", express.static(path.join(__dirname, "pages")));
app.use("/modules", express.static(path.join(__dirname, "modules")));
app.use("/styles", express.static(path.join(__dirname, "styles")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "pagina1.html"));
});

// Endpoint POST que obtiene usuarios desde JSONPlaceholder (server-to-server)
app.post("/api/usuarios", async (req, res) => {
    try {
        const respuesta = await fetch("https://jsonplaceholder.typicode.com/users");
        if (!respuesta.ok) {
            throw new Error(`Error externo: ${respuesta.status}`);
        }
        const usuarios = await respuesta.json();
        res.json(usuarios);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ error: "No se pudieron obtener los usuarios" });
    }
});

app.listen(3030, () => {
    console.log("Servidor corriendo en http://localhost:3030");
});