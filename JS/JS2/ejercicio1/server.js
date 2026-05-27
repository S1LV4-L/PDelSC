import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.use("/scripts", express.static(path.join(__dirname, "scripts")));
app.use("/pages", express.static(path.join(__dirname, "pages")));
app.use("/modules", express.static(path.join(__dirname, "modules")));
app.use("/styles", express.static(path.join(__dirname, "styles")));

// Guardar número en el archivo
app.post("/numeros-guardados", (req, res) => {
    const { numero } = req.body;

    const rutaArchivo = path.join(__dirname, "numeros.txt");
    const contenido = `${numero}\n`;

    fs.appendFile(rutaArchivo, contenido, "utf-8", (err) => {
        if (err) {
            console.error("Error al escribir en el archivo:", err);
            return res.status(500).json({ error: "Error en el sistema de archivos" });
        }
        res.json({ estatus: "completado" });
    });
});

// Eliminar todos los números del archivo
app.delete("/numeros-guardados", (req, res) => {
    const rutaArchivo = path.join(__dirname, "numeros.txt");

    fs.writeFile(rutaArchivo, "", "utf-8", (err) => {
        if (err) {
            console.error("Error al limpiar el archivo:", err);
            return res.status(500).json({ error: "Error al limpiar el archivo" });
        }
        res.json({ estatus: "eliminado" });
    });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "pagina1.html"));
});

app.listen(3019, () => {
    console.log("Servidor corriendo en http://localhost:3019");
});