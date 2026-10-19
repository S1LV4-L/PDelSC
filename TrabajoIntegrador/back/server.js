import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import usuariosRoutes from "./routes/usuarios.js";
import cuentaRoutes from "./routes/cuenta.js";
import academicoRoutes from "./routes/academico.js";
import asistenciasRoutes from "./routes/asistencias.js";

const app = express();
app.use(cors());
app.use(express.json());

// Express 5: req.body es undefined si no llegó JSON. Así las rutas pueden leerlo siempre
app.use((req, res, next) => {
  req.body ??= {};
  next();
});

// Cada router define sus rutas completas (ej: /auth/login), todas bajo /api
app.use("/api", authRoutes);
app.use("/api", usuariosRoutes);
app.use("/api", cuentaRoutes);
app.use("/api", academicoRoutes);
app.use("/api", asistenciasRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));