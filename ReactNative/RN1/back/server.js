import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import pool from "./db.js";
import { verificarToken, verificarPermiso } from "./scripts/auth.js";
import { obtenerUrlAutorizacion, obtenerDatosUsuario } from "./scripts/oauth.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const normalizarEmail = (email) => String(email ?? "").trim().toLowerCase();
const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CANTIDAD_CODIGOS = 3;

const normalizarCodigo = (codigo) => String(codigo ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
const hashCodigo = (codigo) =>
    crypto.createHmac("sha256", process.env.JWT_SECRET).update(normalizarCodigo(codigo)).digest("hex");

function generarCodigo() {
    let c = "";
    for (let i = 0; i < 10; i++) c += ALFABETO[crypto.randomInt(ALFABETO.length)];
    return `${c.slice(0, 5)}-${c.slice(5)}`;
}

// Reemplaza todos los códigos anteriores del usuario y devuelve los nuevos en texto plano (se muestran una sola vez)
async function crearCodigosRecuperacion(usuarioId) {
    await pool.query("DELETE FROM codigos_recuperacion WHERE usuario_id = ?", [usuarioId]);
    const codigos = Array.from({ length: CANTIDAD_CODIGOS }, generarCodigo);
    await pool.query(
        "INSERT INTO codigos_recuperacion (usuario_id, codigo_hash) VALUES ?",
        [codigos.map((c) => [usuarioId, hashCodigo(c)])]
    );
    return codigos;
}

// ---------- AUTH ----------

app.post("/api/auth/registro", async (req, res) => {
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

        // Todo usuario que se registra públicamente empieza como Invitado
        const [perfilInvitado] = await pool.query(
            "SELECT id FROM perfiles WHERE nombre = 'Invitado' LIMIT 1"
        );
        const perfilId = perfilInvitado[0]?.id ?? null;

        const [resultado] = await pool.query(
            "INSERT INTO usuarios (nombre, email, password_hash, perfil_id) VALUES (?, ?, ?, ?)",
            [nombre.trim(), emailNorm, passwordHash, perfilId]
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

app.post("/api/auth/login", async (req, res) => {
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
app.post("/api/auth/restablecer", async (req, res) => {
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

// Redirige al proveedor OAuth (Google/GitHub/Jira). Navegación real del navegador, no fetch.
app.get("/api/auth/:proveedor", (req, res) => {
    try {
        res.redirect(obtenerUrlAutorizacion(req.params.proveedor));
    } catch {
        res.status(400).send("Proveedor no soportado");
    }
});

app.get("/api/auth/:proveedor/callback", async (req, res) => {
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
            const [perfilInvitado] = await pool.query(
                "SELECT id FROM perfiles WHERE nombre = 'Invitado' LIMIT 1"
            );
            const nuevoId = await crearUsuarioOAuth(proveedor, proveedorId, nombre, perfilInvitado[0]?.id ?? null);
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
    try {
        const [resultado] = await pool.query(
            "INSERT INTO usuarios (nombre, proveedor, proveedor_id, perfil_id) VALUES (?, ?, ?, ?)",
            [nombreBase, proveedor, proveedorId, perfilId]
        );
        return resultado.insertId;
    } catch (error) {
        if (error.code !== "ER_DUP_ENTRY") throw error;
        const [resultado] = await pool.query(
            "INSERT INTO usuarios (nombre, proveedor, proveedor_id, perfil_id) VALUES (?, ?, ?, ?)",
            [`${nombreBase}_${proveedor}${proveedorId}`, proveedor, proveedorId, perfilId]
        );
        return resultado.insertId;
    }
}

// ---------- USUARIOS (gestión de OTROS usuarios: solo Administrador) ----------

app.post("/api/usuarios/listar", verificarToken, verificarPermiso("ver_usuarios"), async (req, res) => {
    const [rows] = await pool.query(`
        SELECT 
            u.id, 
            u.nombre,
            u.email,
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
                email: row.email,
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

    res.json(Array.from(usuariosMap.values()));
});

app.post("/api/usuarios/crear", verificarToken, verificarPermiso("crear_usuario"), async (req, res) => {
    const { nombre, email, password, perfilId } = req.body;
    const emailNorm = normalizarEmail(email);

    if (!nombre?.trim() || !emailValido(emailNorm) || !password) {
        return res.status(400).json({ error: "Nombre, email válido y contraseña son obligatorios" });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const [resultado] = await pool.query(
            "INSERT INTO usuarios (nombre, email, password_hash, perfil_id) VALUES (?, ?, ?, ?)",
            [nombre.trim(), emailNorm, passwordHash, perfilId]
        );
        // El administrador entrega estos códigos al usuario
        const codigosRecuperacion = await crearCodigosRecuperacion(resultado.insertId);
        res.status(201).json({ mensaje: "Usuario creado", codigosRecuperacion });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "El usuario o el email ya existen" });
        }
        console.error(error);
        res.status(500).json({ error: "Error al crear usuario" });
    }
});

// Último recurso: el administrador define una contraseña nueva y se generan códigos nuevos
app.post("/api/usuarios/resetear-password", verificarToken, verificarPermiso("editar_usuario"), async (req, res) => {
    try {
        const { id, nuevaPassword } = req.body;
        if (!id || !nuevaPassword) {
            return res.status(400).json({ error: "Id y nueva contraseña son obligatorios" });
        }

        const [rows] = await pool.query("SELECT id FROM usuarios WHERE id = ?", [id]);
        if (rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

        await pool.query("UPDATE usuarios SET password_hash = ? WHERE id = ?", [
            await bcrypt.hash(nuevaPassword, 10),
            id,
        ]);
        res.json({ mensaje: "Contraseña actualizada", codigosRecuperacion: await crearCodigosRecuperacion(id) });
    } catch {
        res.status(500).json({ error: "Error al resetear la contraseña" });
    }
});

app.post("/api/usuarios/actualizar", verificarToken, verificarPermiso("editar_usuario"), async (req, res) => {
    try {
        const { id, nombre, email, perfilId } = req.body;
        if (!id || !nombre?.trim()) {
            return res.status(400).json({ error: "Id y nombre son obligatorios" });
        }

        const emailNorm = normalizarEmail(email);
        if (emailNorm && !emailValido(emailNorm)) {
            return res.status(400).json({ error: "Email inválido" });
        }

        // Evita que un administrador se quite su propio perfil y se bloquee
        if (Number(id) === req.usuarioId) {
            const [rows] = await pool.query("SELECT perfil_id FROM usuarios WHERE id = ?", [id]);
            if (rows[0] && rows[0].perfil_id !== Number(perfilId)) {
                return res.status(400).json({ error: "No puedes cambiar tu propio perfil" });
            }
        }

        await pool.query(
            "UPDATE usuarios SET nombre = ?, email = ?, perfil_id = ? WHERE id = ?",
            [nombre.trim(), emailNorm || null, perfilId, id]
        );
        res.json({ mensaje: "Usuario actualizado" });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "El usuario o el email ya existen" });
        }
        res.status(500).json({ error: "Error al actualizar usuario" });
    }
});

app.post("/api/usuarios/eliminar", verificarToken, verificarPermiso("eliminar_usuario"), async (req, res) => {
    try {
        const { id } = req.body;
        if (Number(id) === req.usuarioId) {
            return res.status(400).json({ error: "No puedes eliminar tu propia cuenta desde aquí" });
        }

        await pool.query("DELETE FROM usuarios WHERE id = ?", [id]);
        res.json({ mensaje: "Usuario eliminado" });
    } catch {
        res.status(500).json({ error: "Error al eliminar usuario" });
    }
});

// Nombres de los permisos del perfil del usuario (ej: ["ver_usuarios", "crear_usuario"])
async function obtenerPermisos(usuarioId) {
    const [rows] = await pool.query(
        `SELECT pe.nombre FROM usuarios u
         JOIN perfil_permisos pp ON u.perfil_id = pp.perfil_id
         JOIN permisos pe ON pp.permiso_id = pe.id
         WHERE u.id = ?`,
        [usuarioId]
    );
    return rows.map((r) => r.nombre);
}

// ---------- MI CUENTA ----------

app.post("/api/usuarios/mi-perfil", verificarToken, async (req, res) => {
    const [rows] = await pool.query(
        `SELECT u.id, u.nombre, u.email, u.password_hash, p.id AS perfil_id, p.nombre AS perfil_nombre
         FROM usuarios u JOIN perfiles p ON u.perfil_id = p.id
         WHERE u.id = ?`,
        [req.usuarioId]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({
        id: rows[0].id,
        nombre: rows[0].nombre,
        email: rows[0].email,
        tienePassword: Boolean(rows[0].password_hash),
        permisos: await obtenerPermisos(req.usuarioId),
        perfil: { id: rows[0].perfil_id, nombre: rows[0].perfil_nombre },
    });
});

app.post("/api/usuarios/mi-cuenta", verificarToken, async (req, res) => {
    try {
        const { nombre, email, password, passwordActual } = req.body;

        const campos = [];
        const valores = [];

        if (nombre) {
            campos.push("nombre = ?");
            valores.push(nombre.trim());
        }
        if (email) {
            const emailNorm = normalizarEmail(email);
            if (!emailValido(emailNorm)) return res.status(400).json({ error: "Email inválido" });
            campos.push("email = ?");
            valores.push(emailNorm);
        }
        if (password) {
            // Cambiar la contraseña exige confirmar la actual
            const [rows] = await pool.query("SELECT password_hash FROM usuarios WHERE id = ?", [req.usuarioId]);
            const hashActual = rows[0]?.password_hash;
            if (!hashActual) return res.status(400).json({ error: "Tu cuenta no usa contraseña" });

            const actualValida = await bcrypt.compare(passwordActual ?? "", hashActual);
            if (!actualValida) return res.status(401).json({ error: "La contraseña actual no coincide" });

            campos.push("password_hash = ?");
            valores.push(await bcrypt.hash(password, 10));
        }

        if (campos.length === 0) {
            return res.status(400).json({ error: "No hay datos para actualizar" });
        }

        valores.push(req.usuarioId);
        await pool.query(`UPDATE usuarios SET ${campos.join(", ")} WHERE id = ?`, valores);

        res.json({ mensaje: "Cuenta actualizada" });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "El usuario o el email ya existen" });
        }
        res.status(500).json({ error: "Error al actualizar la cuenta" });
    }
});

// Confirma con la contraseña (los usuarios de OAuth no tienen, para ellos no se pide)
app.post("/api/usuarios/eliminar-mi-cuenta", verificarToken, async (req, res) => {
    try {
        const { password } = req.body;

        const [rows] = await pool.query("SELECT * FROM usuarios WHERE id = ?", [req.usuarioId]);
        const usuario = rows[0];
        if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

        if (usuario.password_hash) {
            const passwordValida = await bcrypt.compare(password ?? "", usuario.password_hash);
            if (!passwordValida) {
                return res.status(401).json({ error: "La contraseña no coincide" });
            }
        }

        await pool.query("DELETE FROM usuarios WHERE id = ?", [req.usuarioId]);

        res.json({ mensaje: "Cuenta eliminada" });
    } catch {
        res.status(500).json({ error: "Error al eliminar la cuenta" });
    }
});

app.post("/api/usuarios/codigos-recuperacion", verificarToken, async (req, res) => {
    try {
        const { password } = req.body;

        const [rows] = await pool.query("SELECT password_hash FROM usuarios WHERE id = ?", [req.usuarioId]);
        const usuario = rows[0];
        if (!usuario?.password_hash) {
            return res.status(400).json({ error: "Tu cuenta no usa contraseña" });
        }

        const passwordValida = await bcrypt.compare(password ?? "", usuario.password_hash);
        if (!passwordValida) return res.status(401).json({ error: "La contraseña no coincide" });

        res.json({ codigosRecuperacion: await crearCodigosRecuperacion(req.usuarioId) });
    } catch {
        res.status(500).json({ error: "Error al generar los códigos" });
    }
});

// ---------- PERFILES ----------

app.post("/api/perfiles/listar", verificarToken, verificarPermiso("crear_usuario"), async (req, res) => {
    const [rows] = await pool.query("SELECT id, nombre FROM perfiles");
    res.json(rows);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));