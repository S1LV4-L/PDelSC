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

// POST /numeros-guardados: recibe un número y lo agrega al archivo numeros.txt
app.post("/numeros-guardados", (req, res) => {
    const { numero } = req.body;

    // path.join construye la ruta absoluta al archivo
    const rutaArchivo = path.join(__dirname, "numeros.txt");
    const contenido = `${numero}\n`;

    // fs.appendFile agrega contenido al final del archivo sin borrar lo existente. Si el archivo no existe, lo crea automáticamente.
    fs.appendFile(rutaArchivo, contenido, "utf-8", (err) => {
        if (err) {
            console.error("Error al escribir en el archivo:", err);
            return res.status(500).json({ error: "Error en el sistema de archivos" });
        }
        res.json({ estatus: "completado" });
    });
});

// DELETE /numeros-guardados: vacía el contenido del archivo numeros.txt
app.delete("/numeros-guardados", (req, res) => {
    const rutaArchivo = path.join(__dirname, "numeros.txt");

    // fs.writeFile sobreescribe el archivo con un string vacío, borrando todo su contenido.
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

app.listen(3020, () => {
    console.log("Servidor corriendo en http://localhost:3020");
});