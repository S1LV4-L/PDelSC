// routes/cuenta.js
import { Router } from "express";
import bcrypt from "bcrypt";
import pool from "../db.js";
import { verificarToken } from "../scripts/auth.js";
import {
    crearCodigosRecuperacion,
    emailValido,
    normalizarEmail,
    obtenerPermisos,
} from "../scripts/helpers.js";

const router = Router();

// Sin body. Datos del usuario logueado (el front lo usa al restaurar la sesión).
// 200 { id, nombre, email, tienePassword, permisos, perfil } | 404 Usuario no encontrado
router.post("/usuarios/mi-perfil", verificarToken, async (req, res) => {
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

// Body: { nombre?, email?, password?, passwordActual? } (al menos un campo).
// Cambiar password exige passwordActual; las cuentas de OAuth no pueden cambiarla.
// 200 { mensaje } | 400 email inválido / cuenta sin contraseña / nada para actualizar
// 401 passwordActual incorrecta | 409 nombre o email duplicado | 500
router.post("/usuarios/mi-cuenta", verificarToken, async (req, res) => {
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
router.post("/usuarios/eliminar-mi-cuenta", verificarToken, async (req, res) => {
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

// Body: { password }. Regenera los 3 códigos de recuperación (los anteriores dejan de valer).
// 200 { codigosRecuperacion } | 400 cuenta sin contraseña | 401 contraseña incorrecta | 500
router.post("/usuarios/codigos-recuperacion", verificarToken, async (req, res) => {
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

export default router;
