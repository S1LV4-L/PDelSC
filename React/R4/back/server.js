import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "./db.js";
import { verificarToken } from "./scripts/auth.js"; // Solo importamos verificarToken

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json({ limit: "5mb" }));

// ---------- AUTH ----------

app.post("/api/auth/login", async (req, res) => {
    try {
        const { nombreUsuario, password } = req.body;

        // Verificamos si existe el usuario (asumimos que si existe, es Admin)
        const [rows] = await pool.query(
            `SELECT u.*, p.nombre AS perfil_nombre
             FROM usuarios u JOIN perfiles p ON u.perfil_id = p.id
             WHERE u.nombre = ?`,
            [nombreUsuario]
        );
        const usuario = rows[0];
        
        if (!usuario) return res.status(401).json({ error: "Credenciales inválidas" });

        const passwordValida = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordValida) return res.status(401).json({ error: "Credenciales inválidas" });

        const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: "2h" });
        res.json({
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                perfil: { nombre: usuario.perfil_nombre },
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al iniciar sesión" });
    }
});

app.post("/api/auth/restablecer", async (req, res) => {
    try {
        const { nombreUsuario, respuestaSeguridad, nuevaPassword } = req.body;
        const [rows] = await pool.query("SELECT * FROM usuarios WHERE nombre = ?", [nombreUsuario]);
        const usuario = rows[0];
        if (!usuario) return res.status(400).json({ error: "Usuario no encontrado" });

        const respuestaValida = await bcrypt.compare(
            respuestaSeguridad.toLowerCase(),
            usuario.respuesta_hash
        );
        if (!respuestaValida) return res.status(401).json({ error: "Respuesta incorrecta" });

        const nuevoHash = await bcrypt.hash(nuevaPassword, 10);
        await pool.query("UPDATE usuarios SET password_hash = ? WHERE id = ?", [nuevoHash, usuario.id]);
        res.json({ mensaje: "Contraseña actualizada" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al restablecer contraseña" });
    }
});

// ---------- MI CUENTA (Único usuario existente) ----------

app.post("/api/usuarios/mi-perfil", verificarToken, async (req, res) => {
    const [rows] = await pool.query(
        `SELECT u.id, u.nombre, u.pregunta_seguridad, p.nombre AS perfil_nombre
         FROM usuarios u JOIN perfiles p ON u.perfil_id = p.id
         WHERE u.id = ?`,
        [req.usuarioId]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({
        id: rows[0].id,
        nombre: rows[0].nombre,
        preguntaSeguridad: rows[0].pregunta_seguridad,
        perfil: { nombre: rows[0].perfil_nombre },
    });
});

app.post("/api/usuarios/mi-cuenta", verificarToken, async (req, res) => {
    try {
        const { nombre, password, preguntaSeguridad, respuestaSeguridad } = req.body;
        const campos = [];
        const valores = [];

        if (nombre) { campos.push("nombre = ?"); valores.push(nombre); }
        if (password) {
            campos.push("password_hash = ?");
            valores.push(await bcrypt.hash(password, 10));
        }
        if (preguntaSeguridad) { campos.push("pregunta_seguridad = ?"); valores.push(preguntaSeguridad); }
        if (respuestaSeguridad) {
            campos.push("respuesta_hash = ?");
            valores.push(await bcrypt.hash(respuestaSeguridad.toLowerCase(), 10));
        }

        if (campos.length === 0) return res.status(400).json({ error: "No hay datos para actualizar" });

        valores.push(req.usuarioId);
        await pool.query(`UPDATE usuarios SET ${campos.join(", ")} WHERE id = ?`, valores);
        res.json({ mensaje: "Cuenta actualizada" });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Ese nombre de usuario ya existe" });
        console.error(error);
        res.status(500).json({ error: "Error al actualizar la cuenta" });
    }
});

// ---------- PORTFOLIO (Aquí está el CRUD real de la app) ----------

// POST para LEER
app.post("/api/portfolio", async (req, res) => {
    try {
        const [configRows] = await pool.query("SELECT * FROM portfolio_config WHERE id = 1");
        if (configRows.length === 0) return res.status(404).json({ error: "Configuración no encontrada" });
        const config = configRows[0];

        const [catRows] = await pool.query("SELECT * FROM categorias ORDER BY id");
        const [skillRows] = await pool.query("SELECT * FROM skills ORDER BY id");
        const [proyRows] = await pool.query("SELECT * FROM proyectos ORDER BY id");
        const [linkRows] = await pool.query("SELECT * FROM enlaces_contacto ORDER BY id");

        // Mapeo Relacional a JSON
        const skillsMap = {};
        skillRows.forEach(s => {
            if (!skillsMap[s.categoria_id]) skillsMap[s.categoria_id] = [];
            skillsMap[s.categoria_id].push({
                id: s.id.toString(),
                nombre: s.nombre,
                icono: s.icono
            });
        });

        const categoriasConSkills = catRows.map(c => ({
            id: c.id.toString(),
            titulo: c.titulo,
            icono: c.icono,
            skills: skillsMap[c.id] || []
        }));

        const portfolioData = {
            nombre: config.nombre,
            icono: config.icono || "",
            sobreMi: {
                titulo: config.sobre_mi_titulo,
                subtitulo: config.sobre_mi_subtitulo,
                descripcion: config.sobre_mi_descripcion
            },
            categorias: categoriasConSkills,
            proyectos: proyRows.map(p => ({ id: p.id.toString(), imagen: p.imagen, enlace: p.enlace })),
            contacto: {
                email: config.contacto_email,
                enlaces: linkRows.map(l => ({ id: l.id.toString(), texto: l.texto, url: l.url }))
            }
        };
        res.json(portfolioData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener portfolio" });
    }
});

// POST para GUARDAR (Requiere Token)
app.post("/api/portfolio/guardar", verificarToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { nombre, icono, sobreMi, categorias, proyectos, contacto } = req.body;

        await connection.query(
            `UPDATE portfolio_config SET nombre = ?, icono = ?, sobre_mi_titulo = ?, sobre_mi_subtitulo = ?, sobre_mi_descripcion = ?, contacto_email = ? WHERE id = 1`,
            [nombre, icono || "", sobreMi.titulo, sobreMi.subtitulo, sobreMi.descripcion, contacto.email]
        );

        // Estrategia: Borrar todo y reinsertar (Limpia y simple)
        await connection.query("DELETE FROM categorias"); // Cascade borra skills
        await connection.query("DELETE FROM proyectos");
        await connection.query("DELETE FROM enlaces_contacto");

        // Reinsertar Categorías y Skills
        for (const cat of categorias) {
            const [catResult] = await connection.query("INSERT INTO categorias (titulo, icono) VALUES (?, ?)", [cat.titulo, cat.icono]);
            if (cat.skills && cat.skills.length > 0) {
                const skillValues = cat.skills.map(s => [s.nombre, s.icono, catResult.insertId]);
                await connection.query("INSERT INTO skills (nombre, icono, categoria_id) VALUES ?", [skillValues]);
            }
        }

        if (proyectos && proyectos.length > 0) {
            await connection.query("INSERT INTO proyectos (imagen, enlace) VALUES ?", [proyectos.map(p => [p.imagen, p.enlace])]);
        }
        
        if (contacto.enlaces && contacto.enlaces.length > 0) {
            await connection.query("INSERT INTO enlaces_contacto (texto, url) VALUES ?", [contacto.enlaces.map(l => [l.texto, l.url])]);
        }

        await connection.commit();
        res.json({ mensaje: "Portfolio guardado exitosamente" });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: "Error al guardar portfolio" });
    } finally {
        connection.release();
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));