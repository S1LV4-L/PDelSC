import bcrypt from "bcrypt";
import pool from "./db.js";
import dotenv from "dotenv";

dotenv.config();

const crearAdmin = async () => {
    // Configuración del Administrador
    const nombre = "admin";
    const password = "admin123"; // Contraseña deseada
    const pregunta = "¿Nombre de tu primera mascota?";
    const respuesta = "Firulais"; // Respuesta deseada
    const perfilId = 1;

    try {
        console.log("Generando hashes...");
        // Mismo factor de coste (10) en tu server.js
        const passwordHash = await bcrypt.hash(password, 10);
        
        const respuestaHash = await bcrypt.hash(respuesta.toLowerCase(), 10);

        const sql = `
            INSERT INTO usuarios (nombre, password_hash, pregunta_seguridad, respuesta_hash, perfil_id)
            VALUES (?, ?, ?, ?, ?)
        `;

        await pool.query(sql, [nombre, passwordHash, pregunta, respuestaHash, perfilId]);
        
        console.log("------------------------------------------------");
        console.log("Usuario Administrador creado exitosamente.");
        console.log(`Usuario: ${nombre}`);
        console.log(`Contraseña: ${password}`);
        console.log("------------------------------------------------");

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            console.log("El usuario 'admin' ya existe.");
        } else {
            console.error("Error al crear el administrador:", error.message);
        }
    } finally {
        // Cerramos la conexión al pool para que el script termine
        await pool.end();
    }
};

crearAdmin();