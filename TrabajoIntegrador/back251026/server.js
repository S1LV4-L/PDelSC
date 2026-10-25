import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import usuariosRoutes from "./routes/usuarios.js";
import cuentaRoutes from "./routes/cuenta.js";
import cursosRoutes from "./routes/cursos.js";
import materiasRoutes from "./routes/materias.js";
import dictadosRoutes from "./routes/dictados.js";
import inscripcionesRoutes from "./routes/inscripciones.js";
import asistenciasRoutes from "./routes/asistencias.js";
import asistenciasAlumnoRoutes from "./routes/asistenciasAlumno.js";
import estadisticasRoutes from "./routes/estadisticas.js";
import reportesRoutes from "./routes/reportes.js";
import justificacionesRoutes from "./routes/justificaciones.js";
import cicloRoutes from "./routes/ciclo.js";
import auditoriaRoutes from "./routes/auditoria.js";
import comunicadosRoutes from "./routes/comunicados.js";
import calificacionesRoutes from "./routes/calificaciones.js";

const app = express();
app.use(cors());
// 8 MB: las justificaciones viajan con la imagen del certificado en base64
app.use(express.json({ limit: "8mb" }));

// Express 5: req.body es undefined si no llegó JSON. Así las rutas pueden leerlo siempre
app.use((req, res, next) => {
  req.body ??= {};
  next();
});

app.use("/api", authRoutes);
app.use("/api", usuariosRoutes);
app.use("/api", cuentaRoutes);
app.use("/api", cursosRoutes);
app.use("/api", materiasRoutes);
app.use("/api", dictadosRoutes);
app.use("/api", inscripcionesRoutes);
app.use("/api", asistenciasRoutes);
app.use("/api", asistenciasAlumnoRoutes);
app.use("/api", estadisticasRoutes);
app.use("/api", reportesRoutes);
app.use("/api", justificacionesRoutes);
app.use("/api", cicloRoutes);
app.use("/api", auditoriaRoutes);
app.use("/api", comunicadosRoutes);
app.use("/api", calificacionesRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
