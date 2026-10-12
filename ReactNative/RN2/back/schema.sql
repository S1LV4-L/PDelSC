CREATE DATABASE IF NOT EXISTS pdeisc_rn2;
USE pdeisc_rn2;

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
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  perfil_id INT,
  proveedor VARCHAR(20),
  proveedor_id VARCHAR(100),
  FOREIGN KEY (perfil_id) REFERENCES perfiles(id) ON DELETE SET NULL,
  UNIQUE KEY uq_oauth (proveedor, proveedor_id)
);

-- Códigos de recuperación: se guarda el hash, nunca el código
CREATE TABLE codigos_recuperacion (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  codigo_hash CHAR(64) NOT NULL,
  usado BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_usuario (usuario_id)
);

CREATE TABLE accesos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  resultado ENUM('exitoso', 'fallido'),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Primero los perfiles y permisos, después la relación entre ellos
INSERT INTO perfiles (nombre) VALUES ('Administrador'), ('Invitado');

INSERT INTO permisos (nombre) VALUES ('crear_usuario'), ('editar_usuario'), ('eliminar_usuario'), ('ver_usuarios');

-- Administrador: todos los permisos
INSERT INTO perfil_permisos (perfil_id, permiso_id)
SELECT p.id, pe.id FROM perfiles p CROSS JOIN permisos pe WHERE p.nombre = 'Administrador';