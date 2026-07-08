import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2"; 

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

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'alumnosdb'
});

// Conectar a la base de datos
connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a la BD:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

app.post('/api/alumnos', (req, res) => {
    const query = 'SELECT * FROM alumno';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }

        res.json(results);
    });
});

// CREAR ALUMNO
app.post('/api/alumnos/crear', (req, res) => {
    const { nombre, apellido, edad } = req.body;
    const query = 'INSERT INTO alumno (nombre, apellido, edad) VALUES (?, ?, ?)';
    connection.query(query, [nombre, apellido, edad], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al insertar' });
        res.json({ mensaje: 'Creado exitosamente', id: result.insertId });
    });
});

// MODIFICAR ALUMNO
app.put('/api/alumnos/:id', (req, res) => {
    const id = req.params.id;
    const campos = req.body;
    // En un caso real, construirías la query dinámicamente según qué campos lleguen
    const query = 'UPDATE alumno SET nombre = IFNULL(?, nombre), apellido = IFNULL(?, apellido), edad = IFNULL(?, edad) WHERE id = ?';
    connection.query(query, [campos.nombre || null, campos.apellido || null, campos.edad || null, id], (err) => {
        if (err) return res.status(500).json({ error: 'Error al modificar' });
        res.json({ mensaje: 'Modificado exitosamente' });
    });
});

// ELIMINAR ALUMNO
app.delete('/api/alumnos/:id', (req, res) => {
    const id = req.params.id;
    const query = 'DELETE FROM alumno WHERE id = ?';
    connection.query(query, [id], (err) => {
        if (err) return res.status(500).json({ error: 'Error al eliminar' });
        res.json({ mensaje: 'Eliminado exitosamente' });
    });
});

app.listen(3034, () => {
    console.log("Servidor corriendo en http://localhost:3034");
});