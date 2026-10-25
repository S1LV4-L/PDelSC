// routes/auditoria.js
import { Router } from "express";
import pool from "../db.js";
import { verificarToken, verificarPermiso } from "../scripts/auth.js";

const router = Router();
const ver = [verificarToken, verificarPermiso("ver_auditoria")];
const limite = (v) => Math.min(Math.max(Number(v) || 100, 1), 500);

// Body: { resultado?: "exitoso" | "fallido", limite? }
router.post("/auditoria/accesos", ...ver, async (req, res) => {
  const resultado = ["exitoso", "fallido"].includes(req.body.resultado) ? req.body.resultado : null;
  const [rows] = await pool.query(
    `SELECT a.id, DATE_FORMAT(a.fecha, '%Y-%m-%d %H:%i:%s') AS fecha, a.resultado, u.nombre, u.email
     FROM accesos a LEFT JOIN usuarios u ON u.id = a.usuario_id
     WHERE (? IS NULL OR a.resultado = ?)
     ORDER BY a.fecha DESC, a.id DESC LIMIT ?`,
    [resultado, resultado, limite(req.body.limite)]
  );
  res.json(rows);
});

// Body: { accion?, limite? } con accion: qr_regenerado | asistencia_manual | justificacion | comunicado | importacion | promocion
router.post("/auditoria/eventos", ...ver, async (req, res) => {
  const accion = req.body.accion ? String(req.body.accion).slice(0, 40) : null;
  const [rows] = await pool.query(
    `SELECT a.id, DATE_FORMAT(a.creado_en, '%Y-%m-%d %H:%i:%s') AS fecha, a.accion, a.detalle, u.nombre AS usuario
     FROM auditoria a LEFT JOIN usuarios u ON u.id = a.usuario_id
     WHERE (? IS NULL OR a.accion = ?)
     ORDER BY a.id DESC LIMIT ?`,
    [accion, accion, limite(req.body.limite)]
  );
  res.json(rows);
});

export default router;