import { Router } from "express";
import bcrypt from "bcrypt";
import pool from "../db.js";
import { verificarToken, verificarPermiso } from "../scripts/auth.js";
import { crearCodigosRecuperacion, emailValido, normalizarEmail } from "../scripts/helpers.js";
import { PERMISOS_POR_PERFIL } from "../scripts/permisos.js";
import { registrarAuditoria } from "../scripts/auditoria.js";

const MAX_IDS = 500;

// Lista de ids enteros positivos sin repetir (o null si es inválida)
const leerIds = (v) => {
    if (!Array.isArray(v) || v.length === 0 || v.length > MAX_IDS) return null;
    const ids = [...new Set(v.map(Number))];
    return ids.every((i) => Number.isInteger(i) && i > 0) ? ids : null;
};

const MATERIAS = (desde, donde) => `
    (SELECT GROUP_CONCAT(CONCAT(m.nombre, ' ', dc.anio, '°', dc.division, '°')
                         ORDER BY dc.anio, dc.division, m.nombre SEPARATOR ' | ')
     FROM ${desde}
     JOIN materias m ON m.id = d.materia_id
     JOIN cursos dc ON dc.id = d.curso_id
     WHERE ${donde})`;

const router = Router();

// 200 [{ id, nombre, email, perfil: { id, nombre, permisos }, curso: { id, anio, division } | null }]
// Body opcional: { ocultos: true } lista los ocultos. Por defecto solo los activos
router.post("/usuarios/listar", verificarToken, verificarPermiso("ver_usuarios"), async (req, res) => {
    const ocultos = req.body.ocultos === true;
    const [rows] = await pool.query(`
        SELECT u.id, u.nombre, u.email, DATE_FORMAT(u.oculto_en, '%Y-%m-%d') AS oculto_en,
               p.id AS perfil_id, p.nombre AS perfil_nombre,
               c.id AS curso_id, c.anio AS curso_anio, c.division AS curso_division
        FROM usuarios u
        LEFT JOIN perfiles p ON u.perfil_id = p.id
        LEFT JOIN cursos c ON u.curso_id = c.id
        WHERE u.oculto_en IS ${ocultos ? "NOT NULL" : "NULL"}
        ORDER BY u.id
    `);

    res.json(rows.map((r) => ({
        id: r.id,
        nombre: r.nombre,
        email: r.email,
        ocultoEn: r.oculto_en,
        perfil: {
            id: r.perfil_id,
            nombre: r.perfil_nombre || "Sin perfil",
            permisos: (PERMISOS_POR_PERFIL[r.perfil_nombre] ?? []).map((nombre) => ({ nombre })),
        },
        curso: r.curso_id
            ? { id: r.curso_id, anio: r.curso_anio, division: r.curso_division }
            : null,
    })));
});

// Body: { nombre, email, password, perfilId }. Auth: crear_usuario.
// perfilId no se valida: si falta, el usuario queda sin perfil.
// 201 { mensaje, id, codigosRecuperacion } | 400 faltan datos | 409 nombre o email duplicado | 500
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
        res.status(201).json({ mensaje: "Usuario creado", id: resultado.insertId, codigosRecuperacion });
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

// Body: { id, nombre, email?, perfilId }. Auth: editar_usuario.
// Si falta email o perfilId se guarda NULL. Un administrador no puede cambiar su propio perfil.
// 200 { mensaje } | 400 faltan datos / email inválido / cambio del propio perfil | 409 duplicado | 500
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


// 200 { mensaje } | 400 propia cuenta | 500
// Body: { id, confirmado: true }. Solo elimina usuarios ocultos (primero hay que ocultarlos)
router.post("/usuarios/eliminar", verificarToken, verificarPermiso("eliminar_usuario"), async (req, res) => {
    try {
        const id = Number(req.body.id);
        if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "Id inválido" });
        if (req.body.confirmado !== true) return res.status(400).json({ error: "Falta la confirmación" });
        if (id === req.usuarioId) {
            return res.status(400).json({ error: "No puedes eliminar tu propia cuenta desde aquí" });
        }

        const [[usuario]] = await pool.query("SELECT nombre FROM usuarios WHERE id = ? AND oculto_en IS NOT NULL", [id]);
        if (!usuario) {
            return res.status(409).json({ error: "El usuario no existe o no está oculto. Ocultalo primero" });
        }

        await pool.query("DELETE FROM usuarios WHERE id = ?", [id]);
        await registrarAuditoria(req.usuarioId, "usuario_eliminado", { id, nombre: usuario.nombre });
        res.json({ mensaje: "Usuario eliminado" });
    } catch {
        res.status(500).json({ error: "Error al eliminar usuario" });
    }
});

// Body: { ids }. Oculta usuarios: conservan sus datos, pero no ingresan ni aparecen en listas, estadísticas ni reportes
router.post("/usuarios/ocultar", verificarToken, verificarPermiso("editar_usuario"), async (req, res) => {
    try {
        const ids = leerIds(req.body.ids);
        if (!ids) return res.status(400).json({ error: `ids debe ser una lista de usuarios (máximo ${MAX_IDS})` });
        if (ids.includes(req.usuarioId)) return res.status(400).json({ error: "No puedes ocultar tu propia cuenta" });

        const [r] = await pool.query(
            "UPDATE usuarios SET oculto_en = NOW() WHERE id IN (?) AND oculto_en IS NULL", [ids]);
        await registrarAuditoria(req.usuarioId, "usuarios_ocultados", { cantidad: r.affectedRows, ids });
        res.json({ mensaje: "Usuarios ocultados", cantidad: r.affectedRows });
    } catch {
        res.status(500).json({ error: "Error al ocultar usuarios" });
    }
});

// Body: { ids }. Vuelve a dejar activos a usuarios ocultos
router.post("/usuarios/reincorporar", verificarToken, verificarPermiso("editar_usuario"), async (req, res) => {
    try {
        const ids = leerIds(req.body.ids);
        if (!ids) return res.status(400).json({ error: `ids debe ser una lista de usuarios (máximo ${MAX_IDS})` });

        const [r] = await pool.query(
            "UPDATE usuarios SET oculto_en = NULL WHERE id IN (?) AND oculto_en IS NOT NULL", [ids]);
        await registrarAuditoria(req.usuarioId, "usuarios_reincorporados", { cantidad: r.affectedRows, ids });
        res.json({ mensaje: "Usuarios reincorporados", cantidad: r.affectedRows });
    } catch {
        res.status(500).json({ error: "Error al reincorporar usuarios" });
    }
});

// Body: { ids }. Datos de uno o varios usuarios (activos u ocultos) como tabla lista para CSV
router.post("/usuarios/exportar", verificarToken, verificarPermiso("ver_usuarios"), async (req, res) => {
    try {
        const ids = leerIds(req.body.ids);
        if (!ids) return res.status(400).json({ error: `ids debe ser una lista de usuarios (máximo ${MAX_IDS})` });

        const [rows] = await pool.query(
            `SELECT u.id, u.nombre, u.email, p.nombre AS perfil, c.anio, c.division,
                    DATE_FORMAT(u.oculto_en, '%d/%m/%Y') AS oculto_en,
                    ${MATERIAS("inscripciones i JOIN dictados d ON d.id = i.dictado_id", "i.alumno_id = u.id")} AS cursa,
                    ${MATERIAS("dictados d", "d.profesor_id = u.id")} AS dicta
             FROM usuarios u
             LEFT JOIN perfiles p ON p.id = u.perfil_id
             LEFT JOIN cursos c ON c.id = u.curso_id
             WHERE u.id IN (?)
             ORDER BY u.nombre`,
            [ids]
        );
        res.json({
            titulo: "Usuarios",
            subtitulo: `${rows.length} usuario(s)`,
            columnas: ["ID", "Nombre", "Email", "Perfil", "Curso", "Materias", "Estado", "Oculto desde"],
            filas: rows.map((r) => [
                r.id, r.nombre, r.email ?? "", r.perfil ?? "Sin perfil",
                r.anio ? `${r.anio}°${r.division}°` : "",
                r.cursa ?? r.dicta ?? "",
                r.oculto_en ? "Oculto" : "Activo",
                r.oculto_en ?? "",
            ]),
        });
    } catch {
        res.status(500).json({ error: "Error al exportar usuarios" });
    }
});

// Sin body. Auth: crear_usuario. Perfiles para el formulario de alta. 200 [{ id, nombre }]
router.post("/perfiles/listar", verificarToken, verificarPermiso("crear_usuario"), async (req, res) => {
    const [rows] = await pool.query("SELECT id, nombre FROM perfiles");
    res.json(rows);
});

export default router;
