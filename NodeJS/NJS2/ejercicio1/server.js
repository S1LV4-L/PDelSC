import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { exec } from "child_process";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.use("/scripts", express.static(path.join(__dirname, "scripts")));
app.use("/modules", express.static(path.join(__dirname, "modules")));

app.get("/", (req, res) => {
    const scriptPath = path.join(__dirname, "scripts", "script.js");
    
        // Ejecuta "node [ruta_del_script]" en la terminal de forma interna
        exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
            // Muestra los console.log en la terminal del servidor
            console.log(stdout);
        });
});

app.listen(3020, () => {
    console.log("Servidor corriendo en http://localhost:3020");
});