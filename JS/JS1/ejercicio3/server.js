import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/scripts", express.static(path.join(__dirname, "scripts")));
app.use("/pages", express.static(path.join(__dirname, "pages")));
app.use("/modules", express.static(path.join(__dirname, "modules")));
app.use("/styles", express.static(path.join(__dirname, "styles")));


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "pagina1.html"));
});

app.listen(3018, () => {
  console.log("Servidor corriendo en http://localhost:3018");
});