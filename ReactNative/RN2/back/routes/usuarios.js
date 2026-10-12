import { Router } from "express";
import bcrypt from "bcrypt";
import pool from "../db.js";
import { verificarToken, verificarPermiso } from "../scripts/auth.js";
import { crearCodigosRecuperacion, emailValido, normalizarEmail } from "../scripts/helpers.js";

const router = Router();

router.post("/usuarios/listar", verificarToken, verificarPermiso("ver_usuarios"), async (req, res) => {
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

        if (row.permiso_id) {
            usuariosMap.get(row.id).perfil.permisos.push({
                id: row.permiso_id,
                nombre: row.permiso_nombre
            });
        }
    });

    res.json(Array.from(usuariosMap.values()));
});

router.post("/usuarios/crear", verificarToken, verificarPermiso("crear_usuario"), async (req, res) => {
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
router.post("/usuarios/resetear-password", verificarToken, verificarPermiso("editar_usuario"), async (req, res) => {
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

router.post("/usuarios/actualizar", verificarToken, verificarPermiso("editar_usuario"), async (req, res) => {
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

router.post("/usuarios/eliminar", verificarToken, verificarPermiso("eliminar_usuario"), async (req, res) => {
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

router.post("/perfiles/listar", verificarToken, verificarPermiso("crear_usuario"), async (req, res) => {
    const [rows] = await pool.query("SELECT id, nombre FROM perfiles");
    res.json(rows);
});

export default router;