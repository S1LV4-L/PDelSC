# API · Sistema de Asistencias

Backend del sistema de gestión de asistencias, calificaciones y comunicados escolares.
Implementado en **Node.js + Express 5** con **MySQL** (mysql2/promise) y **JWT** para autenticación.

- **Base URL**: `http://localhost:3000/api` (o el dominio configurado en producción)
- **Huso horario**: cada conexión MySQL fija `time_zone = '-03:00'` (Argentina). "Hoy" (`CURDATE()`) y los horarios de los QR se calculan con ese huso
- **CORS**: habilitado para cualquier origen
- **Límite de body**: `8 MB` (las justificaciones viajan con imagen del certificado en base64)

---

## Convenciones generales

### Método HTTP

Todos los endpoints de negocio son **`POST`**. Las únicas excepciones son las rutas de **OAuth** (`GET /auth/:proveedor` y `GET /auth/:proveedor/callback`), porque son redirecciones del navegador.

### Content-Type

Las peticiones y respuestas usan `application/json`, salvo las rutas de OAuth (redirecciones; el `400` de `GET /auth/:proveedor` es texto plano). El servidor siempre inicializa `req.body` a `{}` si no llega JSON, así que los parámetros son siempre legibles.

### Autenticación

Casi todos los endpoints exigen un **JWT** en el header:

```
Authorization: Bearer <token>
```

El token se obtiene en `POST /api/auth/login` o vía OAuth (redirect con `?token=...`). Dura **2 horas**. Si se omite o está vencido, el servidor responde `401`.

### Permisos por perfil

Los permisos se definen en `scripts/permisos.js` y se asocian al perfil del usuario:

| Permiso                    | Administrador | Profesor | Alumno |
|----------------------------|---------------|----------|--------|
| `crear_usuario`            | ✓             |          |        |
| `editar_usuario`           | ✓             |          |        | 
| `eliminar_usuario`         | ✓             |          |        | 
| `ver_usuarios`             | ✓             |          |        | 
| `gestionar_cursos`         | ✓             |          |        | 
| `asignar_cursos`           | ✓             |          |        | 
| `ver_estadisticas`         | ✓             |          |        | 
| `ver_reportes`             | ✓             |          |        | 
| `corregir_asistencias`     | ✓             |          |        | 
| `importar_alumnos`         | ✓             |          |        | 
| `ver_auditoria`            | ✓             |          |        | 
| `enviar_comunicados`       | ✓             |          |        | 
| `generar_qr`               |               | ✓        |        |
| `ver_asistencia`           |               | ✓        |        |
| `marcar_manual`            |               | ✓        |        |
| `gestionar_calificaciones` |               | ✓        |        |
| `leer_qr`                  |               |          | ✓      | 
| `pedir_justificacion`      |               |          | ✓      |

Algunos endpoints además validan **pertenencia**:

- `verificarProfesorDelDictado`: el `dictadoId` del body debe pertenecer a un dictado cuyo `profesor_id` sea el usuario logueado.
- `verificarAlumnoDelDictado`: el `dictadoId` del body debe estar en las `inscripciones` del usuario logueado.

Si `dictadoId` falta o es inválido, ambos responden `400 dictadoId es obligatorio`; si no corresponde, `403` (`No dictás esta materia en este curso` / `No cursás esta materia`). Los endpoints que reciben el `id` de una asistencia o calificación (`/asistencias/nota`, `/calificaciones/actualizar`, `/calificaciones/eliminar`) no usan `dictadoId`: validan la pertenencia dentro de la consulta y responden `404` si el registro no es de un dictado del profesor logueado.

### Formato de errores

Todos los errores siguen la misma forma:

```json
{ "error": "Mensaje en español, dirigido al usuario final" }
```

A veces se incluyen campos extra (ej: `requiereConfirmacion: true` en `409` de regeneración de QR).

### Códigos de estado HTTP usados

| Código | Significado |
|---|---|
| `200` | OK (respuesta con JSON) |
| `201` | Recurso creado (usuario, curso, materia, calificación, comunicado, QR, justificación, importación ejecutada) |
| `400` | Validación de entrada fallida (parámetro faltante, formato inválido, etc.) |
| `401` | Token ausente, inválido o expirado; o contraseña actual incorrecta |
| `403` | El usuario está autenticado pero no tiene el permiso requerido, o no es el profesor/alumno del dictado |
| `404` | Recurso referenciado no encontrado (curso, materia, dictado, alumno, asistencia, calificación, comunicado, justificación) |
| `409` | Conflicto de unicidad (curso/materia/usuario/email duplicado), o estado conflictivo (ya hay QR hoy, ya hay justificación pendiente, etc.) |
| `410` | Gone — el QR escaneado ya venció, o la toma de asistencia ya está cerrada |
| `500` | Error interno del servidor (catch-all del middleware de errores) |

---

## 1. Autenticación y OAuth

### `POST /api/auth/registro`

Registra un usuario público. Siempre se le asigna el perfil **Alumno**. Devuelve los códigos de recuperación (solo se muestran esta vez).

- **Auth**: pública
- **Body**:

| Campo | Tipo | Reglas |
|---|---|---|
| `nombre` | string | Obligatorio, único, se recortan espacios en los extremos, máx. 100 chars (límite de la columna) |
| `email` | string | Obligatorio, formato email, único (normalizado a minúsculas) |
| `password` | string | Obligatorio, hasheado con bcrypt |

- **201 Created**:
  ```json
  {
    "mensaje": "Usuario creado",
    "codigosRecuperacion": ["ABCDE-FGHJK", "LMNOP-QRSTU", "VWXYZ-12345"]
  }
  ```
- **400** `Nombre, email y contraseña son obligatorios`
- **409** `Ese email ya está registrado` / `Ese nombre de usuario ya existe` / `El usuario o el email ya existen` (si dos registros llegan a la vez)
- **500** `Error al registrar usuario`

---

### `POST /api/auth/login`

Inicia sesión con email y contraseña. Registra el intento en `accesos` (exitoso o fallido) solo si el email existe y tiene contraseña. Los usuarios de OAuth no tienen `password_hash`, por lo que nunca podrán loguearse por acá.

- **Auth**: pública
- **Body**: `{ "email": string, "password": string }`
- **200 OK**:
  ```json
  {
    "token": "<jwt>",
    "usuario": {
      "id": 1,
      "nombre": "Ana",
      "email": "ana@mail.com",
      "tienePassword": true,
      "permisos": ["leer_qr", "pedir_justificacion"],
      "perfil": { "id": 3, "nombre": "Alumno" }
    }
  }
  ```
- **401** `Credenciales inválidas` (mismo mensaje para email inexistente y password incorrecta)
- **500** `Error al iniciar sesión`

---

### `POST /api/auth/restablecer`

Restablece la contraseña usando uno de los códigos de recuperación. El código se marca como `usado = true` (cada código se usa una sola vez). El mensaje de error no revela si el email existe o no.

- **Auth**: pública
- **Body**:

| Campo | Tipo | Reglas |
|---|---|---|
| `email` | string | Obligatorio |
| `codigo` | string | Obligatorio, formato `ABCDE-FGHJK` (case-insensitive) |
| `nuevaPassword` | string | Obligatorio |

- **200 OK**:
  ```json
  { "mensaje": "Contraseña actualizada", "codigosRestantes": 2 }
  ```
- **400** `Email, código y nueva contraseña son obligatorios` / `Email o código de recuperación inválido`
- **500** `Error al restablecer contraseña`

---

### `GET /api/auth/:proveedor`

Inicia el flujo de OAuth redirigiendo al proveedor. Soportados: `google`, `github`, `jira`.

- **Auth**: pública
- **Path param**: `proveedor` ∈ `{ google, github, jira }`
- **302** Redirect a la URL de autorización del proveedor
- **400** `Proveedor no soportado` como **texto plano** (no JSON), si el path param no es uno de los soportados

---

### `GET /api/auth/:proveedor/callback`

Vuelve del proveedor con `?code=...`. Intercambia el code por un access token, obtiene los datos del usuario, lo crea si no existe (perfil Alumno; si el nombre ya está en uso se le agrega el sufijo `_<proveedor><id>`) y redirige al frontend con el JWT.

- **Auth**: pública
- **Query param**: `code` (devuelto por el proveedor)
- **302** Redirect a `${FRONTEND_URL}/auth-callback?token=<jwt>`
- **302** (error) Redirect a `${FRONTEND_URL}/?error=oauth`

---

## 2. Cuenta propia (autoservicio)

### `POST /api/usuarios/mi-perfil`

Devuelve el usuario logueado. Lo usa el frontend al restaurar la sesión.

- **Auth**: `verificarToken` (cualquier usuario autenticado)
- **Body**: vacío
- **200 OK**:
  ```json
  {
    "id": 1,
    "nombre": "Ana",
    "email": "ana@mail.com",
    "tienePassword": true,
    "permisos": ["leer_qr", "pedir_justificacion"],
    "perfil": { "id": 3, "nombre": "Alumno" }
  }
  ```
- **404** `Usuario no encontrado`
- **401** `Token no provisto` / `Token inválido o expirado`

---

### `POST /api/usuarios/mi-cuenta`

Actualiza nombre, email o contraseña del usuario logueado. Cambiar la contraseña exige confirmar la actual. Los usuarios de OAuth no tienen contraseña: para ellos no se puede cambiar.

- **Auth**: `verificarToken`
- **Body** (todos los campos opcionales, pero al menos uno debe estar presente):

| Campo | Tipo | Reglas |
|---|---|---|
| `nombre` | string | Si viene, se trimea |
| `email` | string | Si viene, formato email válido, normalizado a minúsculas |
| `password` | string | Si viene, se exige `passwordActual` correcto |
| `passwordActual` | string | Exigido solo si viene `password` |

- **200 OK**: `{ "mensaje": "Cuenta actualizada" }`
- **400** `Email inválido` / `Tu cuenta no usa contraseña` / `No hay datos para actualizar`
- **401** `La contraseña actual no coincide`
- **409** `El usuario o el email ya existen`
- **500** `Error al actualizar la cuenta`

---

### `POST /api/usuarios/eliminar-mi-cuenta`

Elimina la propia cuenta. Si la cuenta tiene contraseña, hay que confirmarla; los usuarios de OAuth pueden eliminar sin confirmar.

- **Auth**: `verificarToken`
- **Body**: `{ "password"?: string }` (obligatorio si `tienePassword === true`)
- **200 OK**: `{ "mensaje": "Cuenta eliminada" }`
- **401** `La contraseña no coincide`
- **404** `Usuario no encontrado`
- **500** `Error al eliminar la cuenta`

---

### `POST /api/usuarios/codigos-recuperacion`

Regenera los 3 códigos de recuperación del usuario. Reemplaza los anteriores (dejan de funcionar). Exige confirmar la contraseña.

- **Auth**: `verificarToken`
- **Body**: `{ "password": string }`
- **200 OK**:
  ```json
  { "codigosRecuperacion": ["ABCDE-FGHJK", "LMNOP-QRSTU", "VWXYZ-12345"] }
  ```
- **400** `Tu cuenta no usa contraseña`
- **401** `La contraseña no coincide`
- **500** `Error al generar los códigos`

---

## 3. Usuarios (administración)

### `POST /api/usuarios/listar`

Lista todos los usuarios con su perfil y curso (si es alumno).

- **Auth**: `ver_usuarios`
- **Body**: vacío
- **200 OK**:
  ```json
  [
    {
      "id": 1,
      "nombre": "Ana",
      "email": "ana@mail.com",
      "perfil": {
        "id": 3,
        "nombre": "Alumno",
        "permisos": [{ "nombre": "leer_qr" }, { "nombre": "pedir_justificacion" }]
      },
      "curso": { "id": 5, "anio": 1, "division": 3 }   // o null
    }
  ]
  ```

---

### `POST /api/usuarios/crear`

Crea un usuario con cualquier perfil. Genera códigos de recuperación para entregar al usuario.

- **Auth**: `crear_usuario`
- **Body**:

| Campo | Tipo | Reglas |
|---|---|---|
| `nombre` | string | Obligatorio, único |
| `email` | string | Obligatorio, formato email |
| `password` | string | Obligatorio |
| `perfilId` | int | Id de `/perfiles/listar`. El backend no lo valida: si se omite se guarda `NULL` y el usuario queda sin perfil |

- **201 Created**:
  ```json
  {
    "mensaje": "Usuario creado",
    "id": 42,
    "codigosRecuperacion": ["...", "...", "..."]
  }
  ```
- **400** `Nombre, email válido y contraseña son obligatorios`
- **409** `El usuario o el email ya existen`
- **500** `Error al crear usuario`

---

### `POST /api/usuarios/resetear-password`

Último recurso: el administrador define una contraseña nueva y regenera los códigos de recuperación.

- **Auth**: `editar_usuario`
- **Body**: `{ "id": int, "nuevaPassword": string }`
- **200 OK**: `{ "mensaje": "Contraseña actualizada", "codigosRecuperacion": [...] }`
- **400** `Id y nueva contraseña son obligatorios`
- **404** `Usuario no encontrado`
- **500** `Error al resetear la contraseña`

---

### `POST /api/usuarios/actualizar`

Modifica nombre, email o perfil de un usuario. Un administrador **no puede cambiar su propio perfil** (se bloquearía a sí mismo).

- **Auth**: `editar_usuario`
- **Body**:

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | int | Obligatorio |
| `nombre` | string | Obligatorio |
| `email` | string | Opcional; si viene debe ser válido. Si se omite o va vacío se guarda `NULL` (caso de usuarios OAuth) |
| `perfilId` | int | Enviarlo siempre: si se omite se guarda `NULL` y el usuario queda sin perfil |

- **200 OK**: `{ "mensaje": "Usuario actualizado" }`
- **400** `Id y nombre son obligatorios` / `Email inválido` / `No puedes cambiar tu propio perfil`
- **409** `El usuario o el email ya existen`
- **500** `Error al actualizar usuario`

---

### `POST /api/usuarios/eliminar`

Elimina un usuario. No se puede eliminar a uno mismo desde acá (usar `/usuarios/eliminar-mi-cuenta`). Borra en cascada sus datos asociados (accesos, inscripciones, asistencias, calificaciones y, si es profesor, sus dictados).

- **Auth**: `eliminar_usuario`
- **Body**: `{ "id": int }`
- **200 OK**: `{ "mensaje": "Usuario eliminado" }`
- **400** `No puedes eliminar tu propia cuenta desde aquí`
- **500** `Error al eliminar usuario`

---

### `POST /api/perfiles/listar`

Lista los perfiles disponibles (para armar el formulario de creación de usuario).

- **Auth**: `crear_usuario`
- **Body**: vacío
- **200 OK**: `[ { "id": 1, "nombre": "Administrador" }, { "id": 2, "nombre": "Profesor" }, { "id": 3, "nombre": "Alumno" } ]`

---

## 4. Cursos

### `POST /api/cursos/listar`

- **Auth**: `gestionar_cursos`
- **Body**: vacío
- **200 OK**:
  ```json
  [
    { "id": 1, "anio": 1, "division": 3, "alumnos": 24 }
  ]
  ```

---

### `POST /api/cursos/crear`

- **Auth**: `gestionar_cursos`
- **Body**: `{ "anio": int (1-7), "division": int (1-99) }`
- **201 Created**: `{ "id": 10, "anio": 1, "division": 3 }`
- **400** `Año (1 a 7) y división inválidos`
- **409** `Ese curso ya existe`

---

### `POST /api/cursos/actualizar`

- **Auth**: `gestionar_cursos`
- **Body**: `{ "id": int, "anio": int (1-7), "division": int (1-99) }`
- **200 OK**: `{ "ok": true }`
- **400** `Id, año (1 a 7) y división son obligatorios`
- **404** `Curso no encontrado`
- **409** `Ese curso ya existe` / `El curso tiene materias dictadas: no se puede cambiar el año`

---

### `POST /api/cursos/eliminar`

Elimina el curso y, en cascada, sus dictados (con sus clases, asistencias y calificaciones). Los alumnos quedan sin curso.

- **Auth**: `gestionar_cursos`
- **Body**: `{ "id": int }`
- **200 OK**: `{ "ok": true }`
- **400** `Id inválido`
- **404** `Curso no encontrado`

---

## 5. Materias

### `POST /api/materias/listar`

- **Auth**: `gestionar_cursos`
- **Body**: `{ "anio"?: int (1-7) }` (opcional, filtra por año)
- **200 OK**: `[ { "id": 1, "nombre": "Matemática", "anio": 1 } ]`

---

### `POST /api/materias/crear`

- **Auth**: `gestionar_cursos`
- **Body**: `{ "nombre": string, "anio": int (1-7) }`
- **201 Created**: `{ "id": 5, "nombre": "Matemática", "anio": 1 }`
- **400** `Nombre y año (1 a 7) son obligatorios`
- **409** `Esa materia ya existe para ese año`

---

### `POST /api/materias/actualizar`

- **Auth**: `gestionar_cursos`
- **Body**: `{ "id": int, "nombre": string, "anio": int (1-7) }`
- **200 OK**: `{ "ok": true }`
- **400** `Id, nombre y año (1 a 7) son obligatorios`
- **404** `Materia no encontrada`
- **409** `Esa materia ya existe para ese año` / `La materia tiene dictados asignados: no se puede cambiar el año`

---

### `POST /api/materias/eliminar`

Elimina la materia y, en cascada, sus dictados (con sus clases, asistencias y calificaciones).

- **Auth**: `gestionar_cursos`
- **Body**: `{ "id": int }`
- **200 OK**: `{ "ok": true }`
- **400** `Id inválido`
- **404** `Materia no encontrada`

---

## 6. Dictados

### `POST /api/dictados/listar`

Lista todos los dictados (materia + curso + profesor). Se puede filtrar por curso.

- **Auth**: `asignar_cursos`
- **Body**: `{ "cursoId"?: int }`
- **200 OK**:
  ```json
  [
    {
      "id": 1, "materia_id": 3, "materia": "Matemática",
      "curso_id": 5, "anio": 1, "division": 3,
      "profesor_id": 8, "profesor": "Prof. García"
    }
  ]
  ```

---

### `POST /api/dictados/asignar`

Asigna un profesor a una materia en un curso. Si el dictado ya existía, cambia el profesor (UPSERT).

- **Auth**: `asignar_cursos`
- **Body**: `{ "materiaId": int, "cursoId": int, "profesorId": int }`
- **Reglas**: la materia y el curso deben ser del mismo año; el profesor debe tener perfil `Profesor`.
- **200 OK**: `{ "ok": true }`
- **400** `materiaId, cursoId y profesorId son obligatorios` / `La materia y el curso deben ser del mismo año` / `El usuario no tiene el perfil Profesor`
- **404** `Materia o curso no encontrado`

---

### `POST /api/dictados/eliminar`

Elimina el dictado y, en cascada, sus inscripciones, clases, asistencias y calificaciones.

- **Auth**: `asignar_cursos`
- **Body**: `{ "id": int }`
- **200 OK**: `{ "ok": true }`
- **400** `Id inválido`
- **404** `Dictado no encontrado`

---

### `POST /api/mis-materias`

Pantalla principal de profesor y alumno. Devuelve los dictados del usuario:

- Si tiene permiso `generar_qr` → dictados donde es profesor.
- Si tiene permiso `leer_qr` → dictados donde está inscripto.
- Si no (administrador) → array vacío.

- **Auth**: `verificarToken`
- **Body**: vacío
- **200 OK**: `[ { "id": 1, "materia": "Matemática", "anio": 1, "division": 3 } ]`

---

## 7. Inscripciones (curso y materias del alumno)

### `POST /api/alumnos/asignaciones`

Devuelve el curso actual y las materias inscriptas de un alumno.

- **Auth**: `asignar_cursos`
- **Body**: `{ "id": int }` (id del alumno)
- **200 OK**:
  ```json
  {
    "curso": { "id": 5, "anio": 1, "division": 3 },  // o null
    "dictados": [ { "id": 1, "materia": "Matemática", "anio": 1, "division": 3 } ]
  }
  ```
- **400** `Id inválido`

---

### `POST /api/alumnos/asignar-curso`

Cambia el curso del alumno. Al hacerlo, se eliminan automáticamente las inscripciones que ya no corresponden: las de años superiores y las del mismo año pero de otra división. Las **recursadas** (años anteriores) se conservan.

- **Auth**: `asignar_cursos`
- **Body**: `{ "id": int, "cursoId": int }`
- **200 OK**: `{ "ok": true }`
- **400** `id y cursoId son obligatorios`
- **404** `Alumno no encontrado` / `Curso no encontrado`

---

### `POST /api/alumnos/asignar-dictados`

Reemplaza todas las inscripciones del alumno. Reglas:

- Solo materias de su propio curso (mismo año, misma división), o recursadas de años anteriores.
- Nunca materias de años superiores.
- No se puede repetir una materia (incluso en diferentes cursos).

- **Auth**: `asignar_cursos`
- **Body**: `{ "id": int, "dictadoIds": int[] }`
- **200 OK**: `{ "ok": true }`
- **400** `id y dictadoIds (lista) son obligatorios` / `dictadoIds inválido` / `Asignale primero un curso al alumno` / `Hay dictados inexistentes` / `Solo se permiten materias de su curso o recursadas de años anteriores` / `No se puede repetir una materia`

---

## 8. Asistencias — Profesor

### `POST /api/asistencias/generar-qr`

Genera el QR de la clase de hoy para un dictado. Crea una fila `ausente` por cada alumno inscripto. Si ya existe un QR hoy y no se pasa `reemplazar: true`, devuelve `409` pidiendo confirmación. Con `reemplazar: true` se borra el QR anterior (y sus asistencias y notas) y se genera uno nuevo — queda registrado en auditoría.

- **Auth**: `generar_qr` + `verificarProfesorDelDictado`
- **Body**:

| Campo | Tipo | Reglas |
|---|---|---|
| `dictadoId` | int | Obligatorio, debe ser del profesor logueado |
| `duracion` | int | Obligatorio, ∈ `{ 15, 30, 60 }` (minutos) |
| `reemplazar` | boolean | Opcional, default `false`. `true` = sobrescribe el QR de hoy |

- **201 Created**:
  ```json
  { "id": 123, "duracion_min": 15, "segundos_restantes": 900, "reemplazado": false }
  ```
- **400** `La duración debe ser 15, 30 o 60 minutos`
- **403** `No dictás esta materia en este curso`
- **409** `Ya generaste el QR de hoy. Volver a generarlo sobrescribirá las asistencias` (con `requiereConfirmacion: true`)

---

### `POST /api/asistencias/qr-hoy`

Devuelve el estado de la toma de hoy (sin el token, que se pide firmado en `/asistencias/qr-dinamico`).

- **Auth**: `generar_qr` + `verificarProfesorDelDictado`
- **Body**: `{ "dictadoId": int }`
- **200 OK**:
  ```json
  { "id": 123, "duracion_min": 15, "segundos_restantes": 743 }
  ```
  O `null` si todavía no se generó el QR de hoy.

---

### `POST /api/asistencias/alumnos`

Lista los alumnos inscriptos con su estado de **hoy**. `estado` y `asistencia_id` son `null` mientras no se haya generado el QR del día.

- **Auth**: `ver_asistencia` + `verificarProfesorDelDictado`
- **Body**: `{ "dictadoId": int }`
- **200 OK**:
  ```json
  [
    {
      "alumno_id": 12,
      "nombre": "Ana Pérez",
      "asistencia_id": 555,   // o null
      "estado": "presente",   // "presente" | "ausente" | null
      "nota": null
    }
  ]
  ```

---

### `POST /api/asistencias/historial-alumno`

Historial de un alumno en el dictado (una fila por clase dada). El campo `id` es el id de la asistencia, para usar en `/asistencias/nota`. Es `null` si el alumno no tiene registro en esa clase (la clase existió pero el alumno no estaba inscripto en ese momento).

- **Auth**: `ver_asistencia` + `verificarProfesorDelDictado`
- **Body**: `{ "dictadoId": int, "alumnoId": int }`
- **200 OK**:
  ```json
  {
    "alumno": { "id": 12, "nombre": "Ana Pérez" },
    "asistencias": [
      { "id": 555, "fecha": "2026-10-25", "estado": "presente", "nota": null },
      { "id": null, "fecha": "2026-10-18", "estado": "ausente", "nota": null }
    ]
  }
  ```
- **400** `alumnoId es obligatorio`
- **404** `El alumno no cursa esta materia`

---

### `POST /api/asistencias/lista`

Lista de alumnos con su presente/ausente de una fecha específica (default: hoy).

- **Auth**: `ver_asistencia` + `verificarProfesorDelDictado`
- **Body**: `{ "dictadoId": int, "fecha"?: "YYYY-MM-DD" }`
- **200 OK**: `[ { "id": 555, "alumno_id": 12, "nombre": "Ana", "estado": "presente", "nota": null } ]`
- **400** `La fecha debe tener formato YYYY-MM-DD`

---

### `POST /api/asistencias/nota`

Agrega o reemplaza la nota breve en una ausencia. Solo funciona sobre asistencias de dictados del profesor logueado.

- **Auth**: `ver_asistencia`
- **Body**: `{ "id": int (asistencia), "nota"?: string (máx. 255 chars, o null para borrar) }`
- **200 OK**: `{ "ok": true }`
- **400** `Id inválido`
- **404** `Ausencia no encontrada`

---

### `POST /api/asistencias/qr-dinamico`

Devuelve el QR firmado que vale 20 segundos. El front lo vuelve a pedir cada 20 s. Si no hay toma abierta o venció, devuelve `payload: null`.

- **Auth**: `generar_qr` + `verificarProfesorDelDictado`
- **Body**: `{ "dictadoId": int }`
- **200 OK**:
  ```json
  {
    "payload": "abc123...def.1730000000.firmaHex24",  // o null
    "segundos_restantes": 743,
    "ventana": 20
  }
  ```

---

### `POST /api/asistencias/cerrar`

Cierra la toma de hoy: el QR deja de valer inmediatamente. Internamente se setea `hora_inicio` a `00:00:00`, con lo cual la fecha + hora_inicio + duración ya pasó.

- **Auth**: `generar_qr` + `verificarProfesorDelDictado`
- **Body**: `{ "dictadoId": int }`
- **200 OK**: `{ "ok": true }`
- **404** `Hoy no hay una toma abierta`

---

### `POST /api/asistencias/marcar-manual`

Marca presente a mano a un alumno (sin celular, sin batería, cámara rota, etc.). Crea o actualiza la asistencia a `presente`. Requiere que ya exista el QR de hoy. Queda registrado en auditoría con `accion = "asistencia_manual"`, `origen = "profesor"`.

- **Auth**: `marcar_manual` + `verificarProfesorDelDictado`
- **Body**: `{ "dictadoId": int, "alumnoId": int }`
- **200 OK**: `{ "ok": true }`
- **400** `alumnoId es obligatorio`
- **404** `El alumno no cursa esta materia`
- **409** `Primero genera el QR de hoy`

---

## 9. Asistencias — Alumno

### `POST /api/asistencias/escanear`

Escanea un QR. El payload se verifica (firma HMAC + frescura de 20 s). Si la toma sigue vigente y el alumno cursa el dictado, se marca presente.

- **Auth**: `leer_qr`
- **Body**: `{ "token": string }` (el payload del QR, formato `token.timestamp.firma`)
- **200 OK**: `{ "ok": true, "dictado_id": 1 }`
- **400** `QR inválido` (formato incorrecto o firma inválida)
- **403** `No cursás esta materia`
- **404** `QR inválido` (token no encontrado en `clases_qr`)
- **410** `La toma de asistencia ya está cerrada o venció` / `Ese QR ya venció. Escaneá el que se muestra ahora`

---

### `POST /api/asistencias/historial`

Historial propio del alumno en un dictado. Incluye el estado de la justificación si la hubo.

- **Auth**: `leer_qr` + `verificarAlumnoDelDictado`
- **Body**: `{ "dictadoId": int }`
- **200 OK**:
  ```json
  [
    {
      "id": 555,
      "fecha": "2026-10-25",
      "estado": "presente",
      "nota": null,
      "justificacion": null          // "pendiente" | "aprobada" | "rechazada" | null
    }
  ]
  ```

---

### `POST /api/asistencias/resumen`

Resumen propio por materia (el porcentaje global lo suma el front). `porcentaje` es `null` si todavía no hubo clases.

- **Auth**: `leer_qr`
- **Body**: vacío
- **200 OK**:
  ```json
  [
    {
      "dictado_id": 1,
      "materia": "Matemática",
      "anio": 1,
      "division": 3,
      "clases": 12,
      "presentes": 10,
      "justificadas": 1,
      "porcentaje": 83.3
    }
  ]
  ```

---

### `POST /api/asistencias/calendario`

Por día del mes: clases dadas y a cuántas asistió (ej: `2/3`).

- **Auth**: `leer_qr`
- **Body**: `{ "mes": "YYYY-MM" }`
- **200 OK**:
  ```json
  [
    { "fecha": "2026-10-01", "total": 3, "presentes": 3 },
    { "fecha": "2026-10-02", "total": 2, "presentes": 1 }
  ]
  ```
- **400** `El mes debe tener formato YYYY-MM`

---

## 10. Justificaciones

### `POST /api/justificaciones/pedir`

Crea un pedido de justificación sobre una ausencia propia. Si ya existe un pedido en estado `rechazada`, se reabre (vuelve a `pendiente`). Si existe uno `pendiente` o `aprobada`, se rechaza con `409`.

- **Auth**: `pedir_justificacion`
- **Body**:

| Campo | Tipo | Reglas |
|---|---|---|
| `asistenciaId` | int | Obligatorio, debe ser del alumno logueado |
| `motivo` | string | Obligatorio, 5-500 chars |
| `adjuntoBase64` | string | Opcional. Si viene, se exige `adjuntoMime` válido |
| `adjuntoMime` | string | Opcional, ∈ `{ image/jpeg, image/png, image/webp }`. Máx. 4 MB |

- **201 Created**: `{ "ok": true }`
- **400** `asistenciaId es obligatorio` / `Indica el motivo (mínimo 5 caracteres)` / `La imagen debe ser JPG, PNG o WEBP` / `La imagen debe pesar menos de 4 MB` / `Solo se justifican ausencias`
- **404** `Falta no encontrada`
- **409** `Esa falta ya tiene una justificación pendiente|aprobada`

---

### `POST /api/justificaciones/mias`

Lista los pedidos propios del alumno.

- **Auth**: `pedir_justificacion`
- **Body**: vacío
- **200 OK**:
  ```json
  [
    {
      "id": 7,
      "asistencia_id": 555,
      "fecha": "2026-10-18",
      "materia": "Matemática",
      "anio": 1,
      "division": 3,
      "motivo": "Fui al médico",
      "estado": "pendiente",      // "pendiente" | "aprobada" | "rechazada"
      "respuesta": null,
      "tiene_adjunto": false
    }
  ]
  ```

---

### `POST /api/justificaciones/editar`

Edita un pedido propio, solo si está `pendiente`. Sin imagen nueva se conserva el certificado actual, salvo que venga `quitarAdjunto: true`.

- **Auth**: `pedir_justificacion`
- **Body**:

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | int | Obligatorio, debe ser del alumno logueado |
| `motivo` | string | Obligatorio, 5-500 chars |
| `adjuntoBase64` | string | Opcional |
| `adjuntoMime` | string | Opcional |
| `quitarAdjunto` | boolean | Opcional, quita el certificado actual |

- **200 OK**: `{ "ok": true }`
- **400** `Id inválido` / `Indica el motivo (mínimo 5 caracteres)` / `La imagen debe ser JPG, PNG o WEBP` / `La imagen debe pesar menos de 4 MB`
- **404** `Pedido no encontrado`
- **409** `Solo se pueden modificar pedidos pendientes`

---

### `POST /api/justificaciones/eliminar`

Elimina un pedido propio, solo si está `pendiente`. La falta queda sin justificación y se puede volver a pedir.

- **Auth**: `pedir_justificacion`
- **Body**: `{ "id": int }`
- **200 OK**: `{ "ok": true }`
- **400** `Id inválido`
- **404** `Pedido no encontrado`
- **409** `Solo se pueden eliminar pedidos pendientes`

---

### `POST /api/justificaciones/adjunto`

Devuelve el certificado adjunto en base64. Lo puede ver el dueño del pedido o un administrador con permiso `corregir_asistencias`.

- **Auth**: `verificarToken` (cualquier usuario autenticado)
- **Body**: `{ "id": int }`
- **200 OK**: `{ "mime": "image/jpeg", "base64": "..." }`
- **400** `Id inválido`
- **403** `No tenés permiso para ver esta imagen`
- **404** `No hay imagen adjunta`

---

### `POST /api/justificaciones/pendientes`

Lista los pedidos por estado (default: pendientes). Lo usa el preceptor para resolver. Devuelve como máximo 200, los más recientes primero.

- **Auth**: `corregir_asistencias`
- **Body**: `{ "estado"?: "pendiente" | "aprobada" | "rechazada" }` (default `"pendiente"`)
- **200 OK**: igual que `/mias` pero incluye `alumno` (nombre).

---

### `POST /api/justificaciones/resolver`

Aprueba o rechaza un pedido. Queda registrado en auditoría con `accion = "justificacion"`.

- **Auth**: `corregir_asistencias`
- **Body**:

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | int | Obligatorio |
| `aprobar` | boolean | Obligatorio |
| `respuesta` | string | Opcional, máx. 255 chars (motivo del rechazo o comentario) |

- **200 OK**: `{ "ok": true }`
- **400** `id y aprobar son obligatorios`
- **404** `El pedido no existe o ya fue resuelto`

---

## 11. Correcciones manuales (administrador / preceptor)

### `POST /api/admin/asistencias/clases`

Fechas con clase dada en un dictado (más recientes primero, máx. 60).

- **Auth**: `corregir_asistencias`
- **Body**: `{ "dictadoId": int }`
- **200 OK**: `[ "2026-10-25", "2026-10-18", ... ]`
- **400** `dictadoId es obligatorio`

---

### `POST /api/admin/asistencias/lista`

Lista de alumnos con su estado en una fecha específica.

- **Auth**: `corregir_asistencias`
- **Body**: `{ "dictadoId": int, "fecha": "YYYY-MM-DD" }`
- **200 OK**:
  ```json
  [
    {
      "asistencia_id": 555,
      "alumno_id": 12,
      "nombre": "Ana",
      "estado": "ausente",
      "justificacion": "pendiente",   // o null
      "motivo": "Fui al médico"        // o null
    }
  ]
  ```
- **400** `dictadoId y fecha son obligatorios`

---

### `POST /api/admin/asistencias/marcar-presente`

Marca presente una asistencia específica (corrige un ausente erróneo). Auditoría con `origen = "administrador"`.

- **Auth**: `corregir_asistencias`
- **Body**: `{ "asistenciaId": int }`
- **200 OK**: `{ "ok": true }`
- **400** `asistenciaId es obligatorio`
- **404** `Asistencia no encontrada`

---

### `POST /api/admin/asistencias/justificar`

Justifica una ausencia a nombre del preceptor. Queda `estado = "aprobada"` y `respuesta = "Cargada por preceptoría"`. Solo se puede sobre asistencias en estado `ausente`. Si la falta ya tenía un pedido (en cualquier estado) se sobrescribe. Auditoría con `origen = "administrador"`.

- **Auth**: `corregir_asistencias`
- **Body**: `{ "asistenciaId": int, "motivo": string (5-500 chars) }`
- **200 OK**: `{ "ok": true }`
- **400** `Indica el motivo (mínimo 5 caracteres)` (también si falta `asistenciaId`) / `Solo se justifican ausencias`
- **404** `Asistencia no encontrada`

---

## 12. Calificaciones

### `POST /api/calificaciones/listar`

Lista los alumnos y todas las calificaciones del dictado.

- **Auth**: `gestionar_calificaciones` + `verificarProfesorDelDictado`
- **Body**: `{ "dictadoId": int }`
- **200 OK**:
  ```json
  {
    "alumnos": [ { "id": 12, "nombre": "Ana" } ],
    "calificaciones": [
      { "id": 7, "alumno_id": 12, "titulo": "Parcial 1", "nota": 8.5, "fecha": "2026-10-01" }
    ]
  }
  ```

---

### `POST /api/calificaciones/crear`

- **Auth**: `gestionar_calificaciones` + `verificarProfesorDelDictado`
- **Body**:

| Campo | Tipo | Reglas |
|---|---|---|
| `dictadoId` | int | Obligatorio, debe ser del profesor |
| `alumnoId` | int | Obligatorio, debe cursar el dictado |
| `titulo` | string | Obligatorio; se recorta a 100 chars |
| `nota` | number | Obligatorio, entre 1 y 10, un decimal como máximo (ej: `8.5`; también acepta coma, `8,5`) |
| `fecha` | "YYYY-MM-DD" | Opcional, default hoy |

- **201 Created**: `{ "id": 7 }`
- **400** `Alumno y título son obligatorios` / `La nota debe estar entre 1 y 10`
- **404** `El alumno no cursa esta materia`

---

### `POST /api/calificaciones/actualizar`

- **Auth**: `gestionar_calificaciones` (solo sobre calificaciones de dictados del profesor logueado)
- **Body**: `{ "id": int, "titulo": string, "nota": number, "fecha"?: "YYYY-MM-DD" }`
- **200 OK**: `{ "ok": true }`
- **400** `Id y título son obligatorios` / `La nota debe estar entre 1 y 10`
- **404** `Calificación no encontrada`

---

### `POST /api/calificaciones/eliminar`

- **Auth**: `gestionar_calificaciones` (solo sobre calificaciones de dictados del profesor logueado)
- **Body**: `{ "id": int }`
- **200 OK**: `{ "ok": true }`
- **400** `Id inválido`
- **404** `Calificación no encontrada`

---

### `POST /api/calificaciones/planilla`

Devuelve una tabla lista para exportar a CSV/PDF: una fila por calificación, con fila de "Promedio" por alumno. Los alumnos sin notas aparecen con una fila `Sin calificaciones`.

- **Auth**: `gestionar_calificaciones` + `verificarProfesorDelDictado`
- **Body**: `{ "dictadoId": int }`
- **200 OK**:
  ```json
  {
    "titulo": "Planilla de notas · Matemática 1°3°",
    "columnas": ["Alumno", "Fecha", "Título", "Nota"],
    "filas": [
      ["Ana", "01/10/2026", "Parcial 1", 8.5],
      ["Ana", "", "Promedio", "8.50"]
    ]
  }
  ```

---

### `POST /api/calificaciones/mias`

Calificaciones propias del alumno en un dictado.

- **Auth**: `leer_qr` + `verificarAlumnoDelDictado`
- **Body**: `{ "dictadoId": int }`
- **200 OK**: `[ { "id": 7, "titulo": "Parcial 1", "nota": 8.5, "fecha": "2026-10-01" } ]`

---

## 13. Estadísticas

### `POST /api/estadisticas/materia`

Estadísticas de un dictado: presentismo por clase, por alumno, y alumnos en riesgo (por debajo del umbral).

- **Auth**: `ver_asistencia` + `verificarProfesorDelDictado`
- **Body**: `{ "dictadoId": int, "umbral"?: number (default 75) }`
- **200 OK**:
  ```json
  {
    "umbral": 75,
    "porClase": [
      { "fecha": "2026-10-25", "total": 30, "presentes": 28, "porcentaje": 93 }
    ],
    "porAlumno": [
      { "alumno_id": 12, "nombre": "Ana", "dictado_id": 1, "materia": "Matemática",
        "anio": 1, "division": 3, "clases": 10, "presentes": 9, "justificadas": 1, "porcentaje": 90 }
    ],
    "enRiesgo": [ /* subconjunto de porAlumno con clases > 0 y porcentaje < umbral, de menor a mayor */ ]
  }
  ```

---

### `POST /api/estadisticas/dictados`

Presentismo agregado por dictado (para el home del administrador).

- **Auth**: `ver_estadisticas`
- **Body**: vacío
- **200 OK**:
  ```json
  [
    {
      "id": 1, "materia": "Matemática", "anio": 1, "division": 3,
      "clases": 12, "presentes": 280, "ausentes": 80, "porcentaje_presentismo": 77.8
    }
  ]
  ```

---

### `POST /api/estadisticas/dictados/alumnos`

Presentismo por alumno de un dictado específico (para desplegar el detalle en el home del admin).

- **Auth**: `ver_estadisticas`
- **Body**: `{ "dictadoId": int }`
- **200 OK**: `[ { "id": 12, "nombre": "Ana", "clases": 10, "presentes": 9, "ausentes": 1, "porcentaje_presentismo": 90 } ]`
- **400** `dictadoId es obligatorio`

---

## 14. Reportes

### `POST /api/ausentismo/alertas`

Alumnos con presentismo por debajo del umbral, opcionalmente filtrados por curso y materia.

- **Auth**: `ver_estadisticas`
- **Body**:

| Campo | Tipo | Reglas |
|---|---|---|
| `umbral` | number | Opcional, default 75, mayor que 0 y hasta 100 |
| `cursoId` | int | Opcional |
| `materiaId` | int | Opcional |

- **200 OK**: igual forma que `estadisticas/materia` → `porAlumno`, pero solo los que tienen clases y están por debajo del umbral, de menor a mayor porcentaje.
- **400** `El umbral debe estar entre 1 y 100`

---

### `POST /api/reportes/asistencia`

Genera una planilla de asistencia lista para exportar a CSV/PDF. Dos modos:

- `tipo = "resumen"`: una fila por (alumno, materia), con presentes/ausentes/justificadas/% (columnas: `Curso, Materia, Alumno, Clases, Presentes, Ausentes, Justificadas, % presentismo`).
- `tipo = "detalle"`: una fila por (alumno, clase), con estado y justificación.

- **Auth**: `ver_reportes`
- **Body**:

| Campo | Tipo | Reglas |
|---|---|---|
| `tipo` | "detalle" \| "resumen" | Opcional, default `detalle` (cualquier valor distinto de `resumen` genera el detalle) |
| `cursoId` | int | Opcional |
| `materiaId` | int | Opcional |
| `dictadoId` | int | Opcional |
| `alumnoId` | int | Opcional |
| `desde` | "YYYY-MM-DD" | Opcional |
| `hasta` | "YYYY-MM-DD" | Opcional |

- **200 OK**:
  ```json
  {
    "titulo": "Planilla de asistencia",
    "subtitulo": "Período: 01/09/2026 al 25/10/2026",
    "columnas": ["Fecha", "Curso", "Materia", "Alumno", "Estado", "Justificada", "Nota"],
    "filas": [["25/10/2026", "1°3°", "Matemática", "Ana", "Presente", "", ""]]
  }
  ```
  El modo `detalle` se limita a 20.000 filas. Sin `desde`/`hasta`, `subtitulo` es `Todo el ciclo`. En `detalle`, la columna `Justificada` vale `Sí` (aprobada), `Pendiente` o queda vacía.

---

## 15. Comunicados

### `POST /api/comunicados/enviar`

Envía un comunicado a todos (global), a uno o varios cursos (alumnos del curso + profesores que dictan en él), o a personas específicas (solo alumnos y profesores).

- **Auth**: `enviar_comunicados`
- **Body**:

| Campo | Tipo | Reglas |
|---|---|---|
| `titulo` | string | Obligatorio; se recorta a 120 chars |
| `mensaje` | string | Obligatorio; se recorta a 2000 chars |
| `alcance` | "global" \| "curso" \| "usuario" | Obligatorio |
| `cursoIds` | int[] | Exigido si `alcance = "curso"` |
| `usuarioIds` | int[] | Exigido si `alcance = "usuario"`, deben ser Alumno o Profesor |

- **201 Created**: `{ "id": 15 }`
- **400** `El título y el mensaje son obligatorios` / `Alcance inválido` / `Elige al menos un curso` / `Elige al menos un destinatario` / `Hay cursos inexistentes` / `Solo puedes escribirle a alumnos y profesores`

---

### `POST /api/comunicados/enviados`

Lista los últimos 50 comunicados enviados, con cantidad de destinos y lecturas. `destinos` suma los cursos y usuarios elegidos (es 0 en los globales).

- **Auth**: `enviar_comunicados`
- **Body**: vacío
- **200 OK**:
  ```json
  [
    {
      "id": 15, "titulo": "Reunión de padres", "mensaje": "...",
      "alcance": "curso", "fecha": "2026-10-25 14:30",
      "destinos": 4, "lecturas": 23
    }
  ]
  ```

---

### `POST /api/comunicados/eliminar`

- **Auth**: `enviar_comunicados`
- **Body**: `{ "id": int }`
- **200 OK**: `{ "ok": true }`
- **400** `Id inválido`
- **404** `Comunicado no encontrado`

---

### `POST /api/comunicados/mios`

Notificaciones del usuario logueado: globales, de su curso (alumno) o de los cursos donde dicta (profesor), y las dirigidas a él específicamente. Máx. 100.

- **Auth**: `verificarToken`
- **Body**: vacío
- **200 OK**:
  ```json
  [
    {
      "id": 15, "titulo": "Reunión de padres", "mensaje": "...",
      "alcance": "curso", "fecha": "2026-10-25 14:30",
      "autor": "Preceptoría", "leido": false
    }
  ]
  ```

---

### `POST /api/comunicados/leer`

Marca un comunicado como leído por el usuario logueado. Idempotente (`INSERT IGNORE`).

- **Auth**: `verificarToken`
- **Body**: `{ "id": int }`
- **200 OK**: `{ "ok": true }`
- **400** `Id inválido`

---

## 16. Auditoría

### `POST /api/auditoria/accesos`

Lista los accesos (exitosos o fallidos). Los accesos fallidos solo se registran sobre emails que existen (para no revelar qué emails están registrados).

- **Auth**: `ver_auditoria`
- **Body**:

| Campo | Tipo | Reglas |
|---|---|---|
| `resultado` | "exitoso" \| "fallido" | Opcional, filtra |
| `limite` | int | Opcional, default 100. Si se pasa de rango se ajusta a 1-500 (no da error) |

- **200 OK**:
  ```json
  [
    { "id": 1, "fecha": "2026-10-25 14:30:01", "resultado": "exitoso", "nombre": "Ana", "email": "ana@mail.com" }
  ]
  ```

---

### `POST /api/auditoria/eventos`

Lista los eventos auditados. `detalle` se devuelve siempre como objeto (si era JSON string, se parsea; si era texto, se devuelve como `{ detalle: "..." }`).

Acciones registradas:

| `accion` | Cuándo se registra |
|---|---|
| `qr_regenerado` | El profesor regenera el QR del día (con `reemplazar: true`) |
| `asistencia_manual` | Marcar presente a mano (profesor o administrador) |
| `justificacion` | Resolver un pedido de justificación, o justificar como preceptor |
| `comunicado` | Enviar un comunicado |
| `importacion` | Importar alumnos por CSV |
| `promocion` | Promover un curso al año siguiente |

- **Auth**: `ver_auditoria`
- **Body**:

| Campo | Tipo | Reglas |
|---|---|---|
| `accion` | string | Opcional, filtra por esa acción (máx. 40 chars; no se valida contra la lista de arriba) |
| `limite` | int | Opcional, default 100. Si se pasa de rango se ajusta a 1-500 (no da error) |

- **200 OK**:
  ```json
  [
    {
      "id": 5,
      "fecha": "2026-10-25 14:30:01",
      "accion": "qr_regenerado",
      "detalle": { "dictadoId": 1, "dictado": "Matemática · 1°3°" },
      "usuario": "Prof. García"
    }
  ]
  ```

---

## 17. Ciclo lectivo (importación y promoción)

### `POST /api/importacion/alumnos`

Carga masiva de alumnos por CSV. Soporta BOM, separador `,` o `;` (se detecta por la cabecera), y comillas para escapar.

**Columnas del CSV**: `nombre, email, anio, division, materias (separadas por |, opcional), password (opcional)`. Sin `materias` → se inscribe en todos los dictados del curso. Sin `password` → se genera una temporal.

La cabecera no distingue mayúsculas ni tildes y acepta alias: `correo` (email), `ano` (anio), `materia` (materias), `contrasena` (password). Se detectan nombres (sin tildes) y emails repetidos, también dentro del mismo archivo.

**Modo simulación** (`simular: true`): valida todo y devuelve qué se crearía, sin tocar la base de datos.

- **Auth**: `importar_alumnos`
- **Body**: `{ "csv": string, "simular"?: boolean }`
- **200 OK** (simulación):
  ```json
  {
    "simulado": true,
    "total": 10,
    "validos": 8,
    "creados": [],
    "errores": [ { "linea": 3, "error": "El email ya existe" } ]
  }
  ```
- **201 Created** (importación real):
  ```json
  {
    "simulado": false,
    "total": 10,
    "validos": 8,
    "creados": [
      {
        "linea": 2, "id": 42, "nombre": "Ana", "email": "ana@mail.com",
        "password": "abc123", "codigos": ["ABCDE-FGHJK", "...", "..."]
      }
    ],
    "errores": [...]
  }
  ```
- **400** `El archivo no tiene filas de datos` / `Máximo 500 alumnos por archivo` / `Faltan columnas: nombre, email, anio y division son obligatorias`
- **500** `No existe el perfil Alumno`

---

### `POST /api/ciclo/promover`

Pasa todo un curso al año siguiente (misma división). 7° egresa: los alumnos quedan sin curso. Si el curso destino no existe, se crea al ejecutar. Se borran las inscripciones viejas y, si `inscribir !== false`, se inscribe a cada alumno en todos los dictados del curso nuevo. El historial de asistencias se conserva.

- **Auth**: `importar_alumnos`
- **Body**:

| Campo | Tipo | Reglas |
|---|---|---|
| `cursoId` | int | Obligatorio |
| `simular` | boolean | Opcional, default `false` |
| `inscribir` | boolean | Opcional, default `true`. Si `false`, no inscribe en el nuevo curso |

- **200 OK** (simulación o curso sin alumnos; en el segundo caso `simulado` es `false` y no se modifica nada):
  ```json
  {
    "simulado": true,
    "curso": "1°3°",
    "destino": "2°3°",       // o null si egresan
    "crearaDestino": false,  // true si el curso destino no existe todavía
    "egresan": false,
    "alumnos": 24
  }
  ```
- **200 OK** (ejecución real): igual forma con `simulado: false`.
- **400** `cursoId es obligatorio`
- **404** `Curso no encontrado`

---

## Apéndice · Tipos de datos comunes

### `EstadoAsistencia`
`"presente" | "ausente"`

### `EstadoJustificacion`
`"pendiente" | "aprobada" | "rechazada"`

### `AlcanceComunicado`
`"global" | "curso" | "usuario"`

### `Tabla` (para exportar)
```typescript
{
  titulo: string;
  subtitulo?: string;
  columnas: string[];
  filas: (string | number | null)[][];
}
```

### `QrClase`
```typescript
{
  id: number;
  duracion_min: 15 | 30 | 60;
  segundos_restantes: number;
  reemplazado?: boolean;
}
```

### `QrDinamico`
```typescript
{
  payload: string | null;   // formato: "token.timestamp.firma24"
  segundos_restantes: number;
  ventana: 20;              // constante: el QR se renueva cada 20 s
}
```

---

## Apéndice · Modelo de datos (resumen)

| Tabla | Uso |
|---|---|
| `perfiles` | Administrador / Profesor / Alumno |
| `usuarios` | Datos de cuenta. `curso_id` solo aplica a alumnos. `proveedor`/`proveedor_id` para OAuth |
| `codigos_recuperacion` | Hash HMAC-SHA256, 3 activos por usuario, se usan una sola vez |
| `accesos` | Bitácora de logins (exitosos y fallidos sobre emails existentes) |
| `cursos` | Año (1-7) + división. UNIQUE(anio, division) |
| `materias` | Nombre + año. UNIQUE(nombre, anio) |
| `dictados` | (materia, curso) → profesor. UNIQUE(materia_id, curso_id) |
| `inscripciones` | (alumno, dictado). PK compuesta |
| `clases_qr` | Una fila por (dictado, fecha). UNIQUE(dictado_id, fecha). Vence en `fecha + hora_inicio + duracion_min` |
| `asistencias` | (clase, alumno) → estado. UNIQUE(clase_id, alumno_id) |
| `justificaciones` | Una por asistencia. UNIQUE(asistencia_id) |
| `calificaciones` | (dictado, alumno, nota). `nota` DECIMAL(3,1) entre 1 y 10 |
| `comunicados` + `comunicado_cursos` + `comunicado_usuarios` + `comunicado_lecturas` | Comunicados oficiales y lecturas por usuario |
| `auditoria` | Eventos con detalle JSON |

---

## Apéndice · Variables de entorno

```env
# Servidor
PORT=3000
FRONTEND_URL=http://localhost:8081

# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=pdeisc_integrador

# Auth
JWT_SECRET=tu-secreto
QR_SECRET=            # opcional: firma de los QR; si falta se usa JWT_SECRET

# OAuth (uno por proveedor)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=
JIRA_CLIENT_ID=
JIRA_CLIENT_SECRET=
JIRA_CALLBACK_URL=
```