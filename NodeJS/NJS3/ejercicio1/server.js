import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir la carpeta scripts y css
app.use("/scripts", express.static(path.join(__dirname, "scripts")));
app.use("/styles", express.static(path.join(__dirname, "styles")));


// Ruta principal → enviar el HTML manualmente
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "pagina1.html"));
});

app.listen(3004, () => {
  console.log("Servidor corriendo en http://localhost:3004");
});