import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "./db.js";
import { verificarToken, verificarPermiso } from "./scripts/auth.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ---------- AUTH ----------

app.post("/api/auth/registro", async (req, res) => {
    try {
        const { nombre, password, preguntaSeguridad, respuestaSeguridad } = req.body;

        const [existente] = await pool.query("SELECT id FROM usuarios WHERE nombre = ?", [nombre]);
        if (existente.length > 0) {
            return res.status(409).json({ error: "Ese nombre de usuario ya existe" });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const respuestaHash = await bcrypt.hash(respuestaSeguridad.toLowerCase(), 10);

        // Todo usuario que se registra públicamente empieza como Invitado
        const [perfilInvitado] = await pool.query(
            "SELECT id FROM perfiles WHERE nombre = 'Invitado' LIMIT 1"
        );
        const perfilId = perfilInvitado[0]?.id ?? null;

        await pool.query(
            "INSERT INTO usuarios (nombre, password_hash, pregunta_seguridad, respuesta_hash, perfil_id) VALUES (?, ?, ?, ?, ?)",
            [nombre, passwordHash, preguntaSeguridad, respuestaHash, perfilId]
        );

        res.status(201).json({ mensaje: "Usuario creado" });
    } catch {
        res.status(500).json({ error: "Error al registrar usuario" });
    }
});

app.post("/api/auth/login", async (req, res) => {
    try {
        const { nombreUsuario, password } = req.body;

        const [rows] = await pool.query(
            `SELECT u.*, p.id AS perfil_id, p.nombre AS perfil_nombre
             FROM usuarios u JOIN perfiles p ON u.perfil_id = p.id
             WHERE u.nombre = ?`,
            [nombreUsuario]
        );
        const usuario = rows[0];
        if (!usuario) return res.status(401).json({ error: "Credenciales inválidas" });

        const passwordValida = await bcrypt.compare(password, usuario.password_hash);

        // Se registra el intento
        await pool.query(
            "INSERT INTO accesos (usuario_id, resultado) VALUES (?, ?)",
            [usuario.id, passwordValida ? "exitoso" : "fallido"]
        );

        if (!passwordValida) return res.status(401).json({ error: "Credenciales inválidas" });

        const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: "2h" });
        res.json({
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                perfil: { id: usuario.perfil_id, nombre: usuario.perfil_nombre },
            },
        });
    } catch {
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
    } catch {
        res.status(500).json({ error: "Error al restablecer contraseña" });
    }
});

// ---------- USUARIOS (gestión de OTROS usuarios: solo Administrador) ----------

app.post("/api/usuarios/listar", verificarToken, verificarPermiso("ver_usuarios"), async (req, res) => {
    // Usamos LEFT JOIN para asegurar que traigamos usuarios aunque falten relaciones
    const [rows] = await pool.query(`
        SELECT 
            u.id, 
            u.nombre, 
            p.id AS perfil_id, 
            p.nombre AS perfil_nombre,
            pe.id AS permiso_id, 
            pe.nombre AS permiso_nombre
        FROM usuarios u 
        LEFT JOIN perfiles p ON u.perfil_id = p.id
        LEFT JOIN perfil_permisos pp ON p.id = pp.perfil_id
        LEFT JOIN permisos pe ON pp.permiso_id = pe.id
        ORDER BY u.id
    `);

    const usuariosMap = new Map();

    rows.forEach((row) => {
        if (!usuariosMap.has(row.id)) {
            usuariosMap.set(row.id, {
                id: row.id,
                nombre: row.nombre,
                perfil: {
                    id: row.perfil_id,
                    nombre: row.perfil_nombre || "Sin perfil",
                    permisos: []
                }
            });
        }

        const usuario = usuariosMap.get(row.id);

        if (row.permiso_id) {
            usuario.perfil.permisos.push({
                id: row.permiso_id,
                nombre: row.permiso_nombre
            });
        }
    });

    const usuarios = Array.from(usuariosMap.values());
    res.json(usuarios);
});

// Endpoint ELIMINADO: /api/usuarios/detalle (Ya no se usa, los permisos vienen en listar)

app.post("/api/usuarios/crear", verificarToken, verificarPermiso("crear_usuario"), async (req, res) => {
    const { nombre, perfilId } = req.body;
    
    try {
        // Generamos datos temporales para cumplir con la BD (NOT NULL)
        const passwordHash = await bcrypt.hash("temporal123", 10);
        
        await pool.query(
            "INSERT INTO usuarios (nombre, password_hash, pregunta_seguridad, respuesta_hash, perfil_id) VALUES (?, ?, ?, ?, ?)",
            [nombre, passwordHash, "", "", perfilId]
        );
        res.status(201).json({ mensaje: "Usuario creado" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear usuario" });
    }
});

app.post("/api/usuarios/actualizar", verificarToken, verificarPermiso("editar_usuario"), async (req, res) => {
    const { id, nombre, perfilId } = req.body;
    await pool.query("UPDATE usuarios SET nombre = ?, perfil_id = ? WHERE id = ?", [nombre, perfilId, id]);
    res.json({ mensaje: "Usuario actualizado" });
});

app.post("/api/usuarios/eliminar", verificarToken, verificarPermiso("eliminar_usuario"), async (req, res) => {
    const { id } = req.body;
    await pool.query("DELETE FROM usuarios WHERE id = ?", [id]);
    res.json({ mensaje: "Usuario eliminado" });
});

// ---------- MI CUENTA ----------

app.post("/api/usuarios/mi-perfil", verificarToken, async (req, res) => {
    const [rows] = await pool.query(
        `SELECT u.id, u.nombre, u.pregunta_seguridad, p.id AS perfil_id, p.nombre AS perfil_nombre
         FROM usuarios u JOIN perfiles p ON u.perfil_id = p.id
         WHERE u.id = ?`,
        [req.usuarioId]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({
        id: rows[0].id,
        nombre: rows[0].nombre,
        preguntaSeguridad: rows[0].pregunta_seguridad,
        perfil: { id: rows[0].perfil_id, nombre: rows[0].perfil_nombre },
    });
});

app.post("/api/usuarios/mi-cuenta", verificarToken, async (req, res) => {
    try {
        const { nombre, password, preguntaSeguridad, respuestaSeguridad } = req.body;

        const campos = [];
        const valores = [];

        if (nombre) {
            campos.push("nombre = ?");
            valores.push(nombre);
        }
        if (password) {
            const passwordHash = await bcrypt.hash(password, 10);
            campos.push("password_hash = ?");
            valores.push(passwordHash);
        }
        if (preguntaSeguridad) {
            campos.push("pregunta_seguridad = ?");
            valores.push(preguntaSeguridad);
        }
        if (respuestaSeguridad) {
            const respuestaHash = await bcrypt.hash(respuestaSeguridad.toLowerCase(), 10);
            campos.push("respuesta_hash = ?");
            valores.push(respuestaHash);
        }

        if (campos.length === 0) {
            return res.status(400).json({ error: "No hay datos para actualizar" });
        }

        valores.push(req.usuarioId);
        await pool.query(`UPDATE usuarios SET ${campos.join(", ")} WHERE id = ?`, valores);

        res.json({ mensaje: "Cuenta actualizada" });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "Ese nombre de usuario ya existe" });
        }
        res.status(500).json({ error: "Error al actualizar la cuenta" });
    }
});

app.post("/api/usuarios/eliminar-mi-cuenta", verificarToken, async (req, res) => {
    try {
        const { nombre, password, preguntaSeguridad, respuestaSeguridad } = req.body;

        const [rows] = await pool.query("SELECT * FROM usuarios WHERE id = ?", [req.usuarioId]);
        const usuario = rows[0];
        if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

        if (nombre !== usuario.nombre) {
            return res.status(401).json({ error: "El nombre de usuario no coincide" });
        }

        const passwordValida = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordValida) {
            return res.status(401).json({ error: "La contraseña no coincide" });
        }

        if (preguntaSeguridad !== usuario.pregunta_seguridad) {
            return res.status(401).json({ error: "La pregunta de seguridad no coincide" });
        }

        const respuestaValida = await bcrypt.compare(
            respuestaSeguridad.toLowerCase(),
            usuario.respuesta_hash
        );
        if (!respuestaValida) {
            return res.status(401).json({ error: "La respuesta de seguridad no coincide" });
        }

        await pool.query("DELETE FROM usuarios WHERE id = ?", [req.usuarioId]);

        res.json({ mensaje: "Cuenta eliminada" });
    } catch {
        res.status(500).json({ error: "Error al eliminar la cuenta" });
    }
});

// ---------- PERFILES ----------

app.post("/api/perfiles/listar", verificarToken, verificarPermiso("crear_usuario"), async (req, res) => {
    const [rows] = await pool.query("SELECT id, nombre FROM perfiles");
    res.json(rows);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));