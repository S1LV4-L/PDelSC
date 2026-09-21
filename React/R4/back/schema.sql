CREATE DATABASE IF NOT EXISTS portfolio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE portfolio_db;

-- ======================= USUARIOS ===========================

-- Tabla Perfiles: Solo existirá el Administrador.
CREATE TABLE perfiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla Usuarios: Contiene los datos de login y recuperación
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) UNIQUE NOT NULL, -- Username
  password_hash VARCHAR(255) NOT NULL, -- Contraseña hasheada (bcrypt)
  pregunta_seguridad VARCHAR(255),    -- Para recuperación de contraseña
  respuesta_hash VARCHAR(255),        -- Respuesta hasheada
  perfil_id INT NOT NULL,
  FOREIGN KEY (perfil_id) REFERENCES perfiles(id) ON DELETE RESTRICT
);

-- =============== CONTENIDO DEL PORTFOLIO ====================

-- Configuración General (Singleton - Solo una fila con ID 1)
CREATE TABLE portfolio_config (
  id INT PRIMARY KEY, 
  nombre VARCHAR(100) NOT NULL,
  icono MEDIUMTEXT,
  sobre_mi_titulo VARCHAR(100),
  sobre_mi_subtitulo VARCHAR(100),
  sobre_mi_descripcion TEXT,
  contacto_email VARCHAR(100)
);

-- Categorías y Skills (Relación 1:N)
CREATE TABLE categorias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  titulo VARCHAR(50) NOT NULL,
  icono MEDIUMTEXT
);

CREATE TABLE skills (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  icono MEDIUMTEXT,
  categoria_id INT NOT NULL,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
);

-- Proyectos
CREATE TABLE proyectos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  imagen MEDIUMTEXT,
  enlace VARCHAR(255)
);

-- Enlaces de Contacto (Redes Sociales)
CREATE TABLE enlaces_contacto (
  id INT PRIMARY KEY AUTO_INCREMENT,
  texto VARCHAR(50) NOT NULL,
  url VARCHAR(255) NOT NULL
);

-- =================== DATOS INICIALES ESENCIALES ========================

-- 1. Insertar el Perfil 'Administrador' (Necesario para que el script crear_admin.js funcione)
INSERT INTO perfiles (id, nombre) VALUES (1, 'Administrador');

-- 2. Configuración base del Portfolio (Fila vacía estructurada)
-- Se inserta una fila con ID 1 para que exista el registro, pero sin contenido de ejemplo.
INSERT IGNORE INTO portfolio_config (id, nombre, sobre_mi_titulo, sobre_mi_subtitulo, sobre_mi_descripcion, contacto_email)
VALUES (1, '', '', '', '', '');