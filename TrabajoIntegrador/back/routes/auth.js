// routes/auth.js
import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import { obtenerUrlAutorizacion, obtenerDatosUsuario } from "../scripts/oauth.js";
import {
    crearCodigosRecuperacion,
    emailValido,
    hashCodigo,
    normalizarEmail,
    obtenerPermisos,
} from "../scripts/helpers.js";

const router = Router();

// Body: { nombre, email, password }. Registro público: siempre crea un Alumno.
// 201 { mensaje, codigosRecuperacion } (los códigos se muestran solo esta vez)
// 400 faltan datos | 409 email o nombre ya existen | 500
router.post("/auth/registro", async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        const emailNorm = normalizarEmail(email);

        if (!nombre?.trim() || !emailValido(emailNorm) || !password) {
            return res.status(400).json({ error: "Nombre, email y contraseña son obligatorios" });
        }

        const [existente] = await pool.query(
            "SELECT email FROM usuarios WHERE nombre = ? OR email = ?",
            [nombre.trim(), emailNorm]
        );
        if (existente.length > 0) {
            const porEmail = existente.some((u) => u.email === emailNorm);
            return res.status(409).json({
                error: porEmail ? "Ese email ya está registrado" : "Ese nombre de usuario ya existe",
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        // Todo usuario que se registra públicamente empieza como Alumno
        const [perfilAlumno] = await pool.query(
            "SELECT id FROM perfiles WHERE nombre = 'Alumno' LIMIT 1"
        );

        const [resultado] = await pool.query(
            "INSERT INTO usuarios (nombre, email, password_hash, perfil_id) VALUES (?, ?, ?, ?)",
            [nombre.trim(), emailNorm, passwordHash, perfilAlumno[0]?.id ?? null]
        );
        const codigosRecuperacion = await crearCodigosRecuperacion(resultado.insertId);

        res.status(201).json({ mensaje: "Usuario creado", codigosRecuperacion });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "El usuario o el email ya existen" });
        }
        res.status(500).json({ error: "Error al registrar usuario" });
    }
});

// Body: { email, password }. Las cuentas de OAuth no tienen contraseña y no entran por acá.
// Registra el acceso (exitoso o fallido) en `accesos` solo si el email existe.
// 200 { token (JWT, 2 h), usuario: { id, nombre, email, tienePassword, permisos, perfil } }
// 401 Credenciales inválidas (mismo mensaje para email inexistente y contraseña incorrecta) | 500
router.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const [rows] = await pool.query(
            `SELECT u.*, p.nombre AS perfil_nombre
             FROM usuarios u JOIN perfiles p ON u.perfil_id = p.id
             WHERE u.email = ?`,
            [normalizarEmail(email)]
        );
        const usuario = rows[0];
        // Los usuarios creados por OAuth no tienen contraseña
        if (!usuario || !usuario.password_hash) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        const passwordValida = await bcrypt.compare(password ?? "", usuario.password_hash);

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
                email: usuario.email,
                tienePassword: true,
                permisos: await obtenerPermisos(usuario.id),
                perfil: { id: usuario.perfil_id, nombre: usuario.perfil_nombre },
            },
        });
    } catch {
        res.status(500).json({ error: "Error al iniciar sesión" });
    }
});

// Verifica uno de los códigos de recuperación y cambia la contraseña. Cada código se usa una sola vez.
router.post("/auth/restablecer", async (req, res) => {
    try {
        const { email, codigo, nuevaPassword } = req.body;
        if (!email || !codigo || !nuevaPassword) {
            return res.status(400).json({ error: "Email, código y nueva contraseña son obligatorios" });
        }

        const [rows] = await pool.query(
            `SELECT c.id, c.usuario_id
             FROM codigos_recuperacion c JOIN usuarios u ON u.id = c.usuario_id
             WHERE u.email = ? AND c.codigo_hash = ? AND c.usado = FALSE`,
            [normalizarEmail(email), hashCodigo(codigo)]
        );
        const registro = rows[0];
        // Mismo mensaje para email inexistente y código incorrecto: no revela qué emails existen
        if (!registro) return res.status(400).json({ error: "Email o código de recuperación inválido" });

        const nuevoHash = await bcrypt.hash(nuevaPassword, 10);
        await pool.query("UPDATE usuarios SET password_hash = ? WHERE id = ?", [nuevoHash, registro.usuario_id]);
        await pool.query("UPDATE codigos_recuperacion SET usado = TRUE WHERE id = ?", [registro.id]);

        const [restantes] = await pool.query(
            "SELECT COUNT(*) AS n FROM codigos_recuperacion WHERE usuario_id = ? AND usado = FALSE",
            [registro.usuario_id]
        );
        res.json({ mensaje: "Contraseña actualizada", codigosRestantes: restantes[0].n });
    } catch {
        res.status(500).json({ error: "Error al restablecer contraseña" });
    }
});

// ---------- OAuth (Google/GitHub/Jira) ----------
// Estas dos rutas son GET porque son redirecciones del navegador: el proveedor siempre vuelve al callback por GET.

// GET /auth/:proveedor (google | github | jira). Redirige a la autorización del proveedor.
// 302 redirect | 400 texto plano "Proveedor no soportado"
router.get("/auth/:proveedor", (req, res) => {
    try {
        res.redirect(obtenerUrlAutorizacion(req.params.proveedor));
    } catch {
        res.status(400).send("Proveedor no soportado");
    }
});

// GET /auth/:proveedor/callback?code=... Canjea el code, busca o crea el usuario (perfil Alumno)
// y redirige al frontend.
// 302 ${FRONTEND_URL}/auth-callback?token=<jwt> | 302 ${FRONTEND_URL}/?error=oauth si falla
router.get("/auth/:proveedor/callback", async (req, res) => {
    const { proveedor } = req.params;
    const { code } = req.query;

    try {
        const { proveedorId, nombre } = await obtenerDatosUsuario(proveedor, code);

        let [rows] = await pool.query(
            "SELECT * FROM usuarios WHERE proveedor = ? AND proveedor_id = ?",
            [proveedor, proveedorId]
        );

        let usuario = rows[0];
        if (!usuario) {
            const [perfilAlumno] = await pool.query(
                "SELECT id FROM perfiles WHERE nombre = 'Alumno' LIMIT 1"
            );
            const nuevoId = await crearUsuarioOAuth(proveedor, proveedorId, nombre, perfilAlumno[0]?.id ?? null);
            [rows] = await pool.query("SELECT * FROM usuarios WHERE id = ?", [nuevoId]);
            usuario = rows[0];
        }

        const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: "2h" });
        res.redirect(`${process.env.FRONTEND_URL}/auth-callback?token=${token}`);
    } catch (error) {
        console.error(error);
        res.redirect(`${process.env.FRONTEND_URL}/?error=oauth`);
    }
});

// nombre tiene UNIQUE NOT NULL: si choca con uno existente, le agrego un sufijo
async function crearUsuarioOAuth(proveedor, proveedorId, nombreBase, perfilId) {
    const sql = "INSERT INTO usuarios (nombre, proveedor, proveedor_id, perfil_id) VALUES (?, ?, ?, ?)";
    try {
        const [resultado] = await pool.query(sql, [nombreBase, proveedor, proveedorId, perfilId]);
        return resultado.insertId;
    } catch (error) {
        if (error.code !== "ER_DUP_ENTRY") throw error;
        const [resultado] = await pool.query(sql, [`${nombreBase}_${proveedor}${proveedorId}`, proveedor, proveedorId, perfilId]);
        return resultado.insertId;
    }
}

export default router;
