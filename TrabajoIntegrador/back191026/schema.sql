CREATE DATABASE IF NOT EXISTS pdeisc_integrador;
USE pdeisc_integrador;

-- ---------- Perfiles ----------
-- Los permisos de cada perfil estan en scripts/permisos.js

CREATE TABLE perfiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL UNIQUE
);

-- ---------- Estructura académica (base) ----------

-- Curso = año (1° a 7°) + división (1°3°, 1°4°, ...)
CREATE TABLE cursos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  anio TINYINT UNSIGNED NOT NULL,
  division TINYINT UNSIGNED NOT NULL,
  CONSTRAINT chk_cursos_anio CHECK (anio BETWEEN 1 AND 7),
  CONSTRAINT chk_cursos_division CHECK (division >= 1),
  UNIQUE KEY uq_anio_division (anio, division)
);

-- Materia = nombre + año (matemática de 1° y matemática de 2° son filas distintas)
CREATE TABLE materias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  anio TINYINT UNSIGNED NOT NULL,
  CONSTRAINT chk_materias_anio CHECK (anio BETWEEN 1 AND 7),
  UNIQUE KEY uq_nombre_anio (nombre, anio)
);

-- ---------- Usuarios ----------

-- curso_id solo se usa para alumnos (cada alumno pertenece a un solo curso)
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  perfil_id INT,
  curso_id INT NULL,
  proveedor VARCHAR(20),
  proveedor_id VARCHAR(100),
  FOREIGN KEY (perfil_id) REFERENCES perfiles(id) ON DELETE SET NULL,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE SET NULL,
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

-- ---------- Dictados e inscripciones ----------

-- Dictado = una materia dada en un curso por un profesor.
-- La clave natural es (materia, curso): una misma materia puede tener un profesor distinto en cada curso.
CREATE TABLE dictados (
  id INT PRIMARY KEY AUTO_INCREMENT,
  materia_id INT NOT NULL,
  curso_id INT NOT NULL,
  profesor_id INT NOT NULL,
  UNIQUE KEY uq_materia_curso (materia_id, curso_id),
  FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  FOREIGN KEY (profesor_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Inscripción del alumno a un dictado. Materias de su año: dictado de su propio curso.
-- Recursadas: dictado de un curso de un año anterior. El back valida año y que no repita materia.
CREATE TABLE inscripciones (
  alumno_id INT NOT NULL,
  dictado_id INT NOT NULL,
  PRIMARY KEY (alumno_id, dictado_id),
  FOREIGN KEY (alumno_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (dictado_id) REFERENCES dictados(id) ON DELETE CASCADE
);

-- ---------- Asistencias ----------

-- Una fila por clase. UNIQUE (dictado_id, fecha) garantiza un solo QR por día y dictado.
-- Expira en: TIMESTAMP(fecha, hora_inicio) + duracion_min minutos
CREATE TABLE clases_qr (
  id INT PRIMARY KEY AUTO_INCREMENT,
  dictado_id INT NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  duracion_min TINYINT UNSIGNED NOT NULL,
  token CHAR(48) UNIQUE NOT NULL,
  CONSTRAINT chk_duracion CHECK (duracion_min IN (15, 30, 60)),
  UNIQUE KEY uq_dictado_fecha (dictado_id, fecha),
  FOREIGN KEY (dictado_id) REFERENCES dictados(id) ON DELETE CASCADE
);

-- Al generar el QR se crea una fila 'ausente' por alumno inscripto; al escanear pasa a 'presente'
CREATE TABLE asistencias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  clase_id INT NOT NULL,
  alumno_id INT NOT NULL,
  estado ENUM('presente', 'ausente') NOT NULL DEFAULT 'ausente',
  nota VARCHAR(255),
  UNIQUE KEY uq_clase_alumno (clase_id, alumno_id),
  FOREIGN KEY (clase_id) REFERENCES clases_qr(id) ON DELETE CASCADE,
  FOREIGN KEY (alumno_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ---------- Datos iniciales ----------

INSERT INTO perfiles (nombre) VALUES ('Administrador'), ('Profesor'), ('Alumno');