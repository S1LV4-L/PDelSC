import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import usuariosRoutes from "./routes/usuarios.js";
import cuentaRoutes from "./routes/cuenta.js";

const app = express();
app.use(cors());
app.use(express.json());

// Cada router define sus rutas completas (ej: /auth/login), todas bajo /api
app.use("/api", authRoutes);
app.use("/api", usuariosRoutes);
app.use("/api", cuentaRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));