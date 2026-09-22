CREATE DATABASE IF NOT EXISTS pdeisc_r5;
USE pdeisc_r5;

CREATE TABLE perfiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL
);

CREATE TABLE permisos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL
);

CREATE TABLE perfil_permisos (
  perfil_id INT,
  permiso_id INT,
  PRIMARY KEY (perfil_id, permiso_id),
  FOREIGN KEY (perfil_id) REFERENCES perfiles(id) ON DELETE CASCADE,
  FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE CASCADE
);

CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  pregunta_seguridad VARCHAR(255),
  respuesta_hash VARCHAR(255),
  perfil_id INT,
  proveedor VARCHAR(20),
  proveedor_id VARCHAR(100),
  FOREIGN KEY (perfil_id) REFERENCES perfiles(id) ON DELETE SET NULL,
  UNIQUE KEY uq_oauth (proveedor, proveedor_id)
);

CREATE TABLE accesos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  resultado ENUM('exitoso', 'fallido'),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Perfiles del sistema
INSERT INTO perfiles (nombre) VALUES ('Administrador'), ('Invitado');

-- Permisos: TODOS son sobre gestionar OTROS usuarios (exclusivos de Administrador)
INSERT INTO permisos (nombre) VALUES ('crear_usuario'), ('editar_usuario'), ('eliminar_usuario'), ('ver_usuarios');

-- Administrador: todos los permisos
INSERT INTO perfil_permisos (perfil_id, permiso_id)
SELECT 1, id FROM permisos;

-- Invitado: ningún permiso de gestión de otros usuarios.
-- Editar su propia cuenta y ver la galería no requieren permisos especiales.