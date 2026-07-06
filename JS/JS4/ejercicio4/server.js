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

// Crea la ruta POST /api/feriados para enviar la lista al frontend
app.post("/api/feriados", (req, res) => {
    // Obtiene el año actual dinámicamente para armar las fechas
    const anio = new Date().getFullYear();

    // Lista estática con los feriados nacionales (día, mes, nombre y tipo)
    const feriados = [
        { dia: 1, mes: 1, nombre: "Año Nuevo", tipo: "inamovible" },
        { dia: 24, mes: 3, nombre: "Día Nacional de la Memoria por la Verdad y la Justicia", tipo: "inamovible" },
        { dia: 2, mes: 4, nombre: "Día del Veterano y de los Caídos en la Guerra de Malvinas", tipo: "inamovible" },
        { dia: 1, mes: 5, nombre: "Día del Trabajador", tipo: "inamovible" },
        { dia: 25, mes: 5, nombre: "Día de la Revolución de Mayo", tipo: "inamovible" },
        { dia: 17, mes: 6, nombre: "Paso a la Inmortalidad del General Güemes", tipo: "trasladable" },
        { dia: 20, mes: 6, nombre: "Día de la Bandera", tipo: "inamovible" },
        { dia: 9, mes: 7, nombre: "Día de la Independencia", tipo: "inamovible" },
        { dia: 17, mes: 8, nombre: "Paso a la Inmortalidad del General San Martín", tipo: "trasladable" },
        { dia: 12, mes: 10, nombre: "Día del Respeto a la Diversidad Cultural", tipo: "trasladable" },
        { dia: 20, mes: 11, nombre: "Día de la Soberanía Nacional", tipo: "trasladable" },
        { dia: 8, mes: 12, nombre: "Inmaculada Concepción de María", tipo: "inamovible" },
        { dia: 25, mes: 12, nombre: "Navidad", tipo: "inamovible" }
    ];

    // Obtiene la fecha de hoy y resetea la hora a 00:00 para comparar solo el día
    const hoy = new Date(); // Date(año, mes, dia)
    hoy.setHours(0, 0, 0, 0);

    // Recorre el array original para formatear la fecha como "dd/mm/aaaa" y agregar el campo numérico "mes"
    const feriadosTodos = feriados.map(f => ({
        fecha: `${String(f.dia).padStart(2, "0")}/${String(f.mes).padStart(2, "0")}/${anio}`,
        nombre: f.nombre,
        tipo: f.tipo,
        mes: f.mes
    }));

    // Filtra el array formateado y descarta los feriados cuya fecha ya haya pasado
    const feriadosRestantes = feriadosTodos.filter(f => {
        const [dia, mes, anioF] = f.fecha.split("/").map(Number);
        return new Date(anioF, mes - 1, dia) >= hoy;
    });

    // Devuelve ambos arrays: el filtrado para el contador y el completo para el selector por mes
    res.json({
        feriados: feriadosRestantes,
        feriadosTodos: feriadosTodos
    });
});

app.listen(3033, () => {
    console.log("Servidor corriendo en http://localhost:3033");
});