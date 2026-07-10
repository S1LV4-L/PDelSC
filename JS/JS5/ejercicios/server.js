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

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'alumnosdb'
});

app.post('/api/alumnos', (req, res) => {
    const query = 'SELECT * FROM alumno';

    pool.query(query, (err, results) => {
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
    pool.query(query, [nombre, apellido, edad], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al insertar' });

        pool.query('SELECT * FROM alumno WHERE id = ?', [result.insertId], (err, rows) => {
            if (err) return res.status(500).json({ error: 'Error al leer el alumno creado' });
            res.json(rows[0]);
        });
    });
});

// MODIFICAR ALUMNO
app.put('/api/alumnos/:id', (req, res) => {
    const id = req.params.id;
    const campos = req.body;
    const query = 'UPDATE alumno SET nombre = IFNULL(?, nombre), apellido = IFNULL(?, apellido), edad = IFNULL(?, edad) WHERE id = ?';
    pool.query(query, [campos.nombre || null, campos.apellido || null, campos.edad || null, id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al modificar' });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Alumno no encontrado' });

        pool.query('SELECT * FROM alumno WHERE id = ?', [id], (err, rows) => {
            if (err) return res.status(500).json({ error: 'Error al leer el alumno modificado' });
            res.json(rows[0]);
        });
    });
});

// ELIMINAR ALUMNO
app.delete('/api/alumnos/:id', (req, res) => {
    const id = req.params.id;
    const query = 'DELETE FROM alumno WHERE id = ?';
    pool.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al eliminar' });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Alumno no encontrado' });
        res.status(204).send();
    });
});

app.listen(3034, () => {
    console.log("Servidor corriendo en http://localhost:3034");
});