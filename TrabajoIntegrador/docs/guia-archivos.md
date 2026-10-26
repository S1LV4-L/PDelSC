# Guía de archivos del proyecto Aula+

Aplicación de asistencia escolar con tres perfiles (Administrador, Profesor y Alumno).
El **frontend** es una app React Native con Expo Router y el **backend** es una API Express con MySQL.

---

# Frontend (Expo / React Native)

## `src/app/` — Rutas y pantallas (Expo Router)

| Archivo | Responsabilidades |
|---|---|
| `_layout.tsx` | Layout raíz. Carga las fuentes Manrope, controla el splash, envuelve la app con `ThemeProvider` y `AuthProvider`, y decide con `Stack.Protected` si se muestra el grupo `(app)` (logueado) o `(auth)` (sin sesión). |
| `+not-found.tsx` | Pantalla que se muestra cuando la ruta no existe. |
| `auth-callback.tsx` | Recibe el token al volver del login con OAuth (Google, GitHub, Jira), inicia la sesión y navega a home. |

### `src/app/(auth)/` — Pantallas sin sesión

| Archivo | Responsabilidades |
|---|---|
| `_layout.tsx` | Layout del grupo de autenticación. |
| `index.tsx` | Redirige a `login`. |
| `login.tsx` | Formulario de inicio de sesión con email y contraseña, y botones de OAuth. |
| `register.tsx` | Registro público (siempre crea un Alumno) y muestra los códigos de recuperación. |
| `forgot-password.tsx` | Restablece la contraseña usando un código de recuperación. |

### `src/app/(app)/` — Pantallas con sesión

| Archivo | Responsabilidades |
|---|---|
| `_layout.tsx` | Layout principal. Muestra la navegación (lateral en PC, tabs abajo en móvil) y restringe cada ruta por perfil, redirigiendo a `/home` si no corresponde. |
| `home.tsx` | Muestra `HomeAdmin`, `HomeProfesor` o `HomeAlumno` según el perfil del usuario. |
| `mi-cuenta.tsx` | Cuenta propia: cambiar nombre, email y contraseña, regenerar códigos de recuperación y eliminar la cuenta. |
| `usuarios.tsx` | (Admin) Contenedor de la gestión de usuarios (`AdminUsuarios`). |
| `academico.tsx` | (Admin) Secciones de cursos, materias, dictados, importación de alumnos y cambio de ciclo. |
| `asistencia-admin.tsx` | (Admin) Secciones de correcciones, justificaciones y reportes de asistencia. |
| `auditoria.tsx` | (Admin) Contenedor de la auditoría (`AdminAuditoria`). |
| `comunicados.tsx` | (Admin) Contenedor de los comunicados (`AdminComunicados`). |
| `dictado.tsx` | (Profesor) Pantalla de una materia con pestañas de Asistencia, Calificaciones y Estadísticas. |
| `dictado-alumno.tsx` | (Profesor) Historial de un alumno dentro de un dictado y notas breves en sus ausencias. |
| `evaluaciones.tsx` | (Profesor) Carga rápida de notas de un curso, por grilla o por CSV. |
| `escanear.tsx` | (Alumno) Escanea el QR de la clase para marcar presente. |
| `materia.tsx` | (Alumno) Detalle de asistencia de una materia: presentes, ausentes, porcentaje e historial. |
| `justificar.tsx` | (Alumno) Formulario para pedir la justificación de una falta, con motivo e imagen. |
| `justificaciones.tsx` | (Alumno) Lista de sus pedidos con su estado, y permite editarlos o eliminarlos. |
| `calendario.tsx` | (Alumno) Calendario mensual de asistencia, con la semana desde el domingo. |
| `notas.tsx` | (Alumno) Calificaciones por materia con gráfico de barras y boletín exportable a CSV o PDF. |
| `notificaciones.tsx` | (Profesor y Alumno) Comunicados recibidos y marcado como leído. |

## `src/components/admin/` — Componentes del Administrador

| Archivo | Responsabilidades |
|---|---|
| `AdminAlertas.tsx` | Alumnos por debajo del umbral de presentismo (alertas de ausentismo). |
| `AdminAuditoria.tsx` | Muestra los accesos (exitosos y fallidos) y los eventos auditados. |
| `AdminCiclo.tsx` | Cambio de ciclo lectivo: promueve cursos al año siguiente, con simulación previa. |
| `AdminComunicados.tsx` | Enviar, editar y eliminar comunicados, con alcance global, por curso o por usuario. |
| `AdminCorrecciones.tsx` | Corrección manual de asistencias: marcar presente o justificar una falta. |
| `AdminCursos.tsx` | Alta, edición y baja de cursos (año y división). |
| `AdminDictados.tsx` | Asignación del profesor de cada materia en cada curso. |
| `AdminImportacion.tsx` | Carga masiva de alumnos desde CSV, con modo simulación. |
| `AdminJustificaciones.tsx` | Resolución (aprobar o rechazar) de las justificaciones pendientes. |
| `AdminMaterias.tsx` | Alta, edición y baja de materias (nombre y año). |
| `AdminReportes.tsx` | Planillas de asistencia con filtros, exportables a CSV y PDF. |
| `AdminUsuarios.tsx` | Gestión completa de usuarios: lista (activos y ocultos), alta, edición, códigos de recuperación y asignación de curso y materias. |
| `AsignacionAlumno.tsx` | Asigna curso, materias y recursadas a un alumno. |
| `BarraSeleccion.tsx` | Barra de selección múltiple que exporta a CSV los usuarios elegidos. |
| `FilaUsuario.tsx` | Fila de un usuario con casilla de selección y acciones. |
| `FormularioUsuario.tsx` | Formulario para crear o editar un usuario. |
| `UsuariosOcultos.tsx` | Gestión de usuarios ocultos: reincorporar o eliminar definitivamente. |
| `usuariosTypes.ts` | Tipos de TypeScript de la gestión de usuarios (modos y props de formulario). |

## `src/components/home/`

| Archivo | Responsabilidades |
|---|---|
| `HomeAdmin.tsx` | Panel principal del Administrador, con presentismo por dictado. |
| `HomeProfesor.tsx` | Panel del Profesor con las materias que dicta. |
| `HomeAlumno.tsx` | Panel del Alumno con el resumen de asistencia por materia en colores de semáforo. |

## `src/components/layout/`

| Archivo | Responsabilidades |
|---|---|
| `AuthLayout.tsx` | Estructura visual compartida de login, registro y recuperación (título, subtítulo y contenido). |
| `Bienvenida.tsx` | Saludo con nombre, email y perfil del usuario. |
| `CabeceraUsuario.tsx` | Cabecera con el usuario, acceso a Mi cuenta y cierre de sesión. |
| `Navegacion.tsx` | Menú de navegación por perfil: barra lateral en PC y tabs inferiores en móvil. |
| `Pantalla.tsx` | Contenedor base de las pantallas (scroll, márgenes y botón volver). |

## `src/components/profesor/`

| Archivo | Responsabilidades |
|---|---|
| `DictadoAsistencia.tsx` | Lista de alumnos con su estado de hoy, marcado manual de asistencia y refresco automático mientras escanean. |
| `DictadoCalificaciones.tsx` | Alta, edición y baja de calificaciones (1 a 10) de los alumnos del dictado. |
| `DictadoEstadisticas.tsx` | Estadísticas de presentismo de la materia y alumnos en riesgo. |
| `EvaluacionCsv.tsx` | Importación y exportación de notas por CSV (plantilla, notas y simulación). |
| `EvaluacionGrilla.tsx` | Grilla para cargar la misma evaluación a todos los alumnos del curso. |
| `QrDictado.tsx` | Genera el QR de la clase, lo renueva firmado cada 20 s, muestra la cuenta regresiva, cierra la toma y pide confirmación si ya había uno. |

## `src/components/ui/` — Componentes reutilizables

| Archivo | Responsabilidades |
|---|---|
| `BotonesExportar.tsx` | Botones para exportar una tabla pedida al backend como CSV o PDF. |
| `BotonScrollTop.tsx` | Botón flotante de volver arriba y el hook `useScrollTop`. |
| `BotonTema.tsx` | Alterna entre tema claro y oscuro. |
| `Button.tsx` | Botón estándar de la app. |
| `Chips.tsx` | Selector de opciones tipo pestañas o chips. |
| `ChipsFiltro.tsx` | Chips con la opción "Todos". |
| `CodigosRecuperacion.tsx` | Muestra los códigos de recuperación una única vez. |
| `EstadoTexto.tsx` | Muestra presente, ausente o sin QR del día. |
| `FilaAcciones.tsx` | Fila con botones de editar y eliminar, con confirmación en línea. |
| `FilaItem.tsx` | Fila genérica de lista. |
| `Input.tsx` | Campo de texto con soporte de validación (`validate`) y mensajes de error. |
| `Pct.tsx` | Porcentaje coloreado como semáforo. |
| `Tarjeta.tsx` | Contenedor visual tipo tarjeta. |
| `Texto.tsx` | Texto con tamaño, color y negrita según el tema. |

## Resto de `src/`

| Archivo | Responsabilidades |
|---|---|
| `constants/theme.tsx` | Breakpoints, espaciados, temas claro y oscuro, `ThemeProvider` (guarda la preferencia) y hooks `useTheme` y `useThemeMode`. |
| `context/AuthContext.tsx` | Estado global de sesión: restaura la sesión guardada, la valida contra el backend (el JWT dura 2 h) y expone usuario, login y logout. |
| `hooks/useAuth.ts` | Acceso simplificado al `AuthContext`. |
| `hooks/useCatalogo.ts` | Carga cursos y materias para armar filtros (Administrador). |
| `hooks/useResponsive.ts` | Detecta si el layout es de escritorio o móvil con los breakpoints. |
| `hooks/useSeleccion.ts` | Manejo de selección múltiple de ids. |
| `services/api.ts` | Cliente HTTP base: `API_URL`, clase `ApiError` y `apiPost` con token. |
| `services/authService.ts` | Login, registro, restablecer contraseña, regenerar códigos, perfil, actualizar cuenta y URL de OAuth. |
| `services/oauthService.ts` | Inicia OAuth en web (redirección) y en nativo (navegador y deep link). |
| `services/usuarioService.ts` | CRUD de usuarios, ocultar, reincorporar, listar perfiles y exportar. |
| `services/academicoService.ts` | Cursos, materias y dictados. |
| `services/asistenciaService.ts` | QR, asistencia del dictado, marcado manual, notas, estadísticas, escaneo y historial del alumno. |
| `services/justificacionService.ts` | Pedidos del alumno, resolución del administrador y correcciones de asistencia. |
| `services/calificacionService.ts` | Calificaciones del profesor y del alumno, y planilla de notas. |
| `services/evaluacionService.ts` | Carga rápida, importación y exportación de notas. |
| `services/comunicadoService.ts` | Enviar, editar, eliminar y leer comunicados. |
| `services/estadisticaService.ts` | Presentismo por dictado y por alumno. |
| `services/adminService.ts` | Alertas, reportes, importación de alumnos, cambio de ciclo y auditoría. |
| `storage/secureStorage.ts` | Guardado seguro del token: `SecureStore` en nativo y `localStorage` en web. |
| `types/auth.ts` | Tipos de `Perfil`, `Usuario` y `Session`. |
| `types/academico.ts` | Tipos de cursos, materias, dictados, asistencias y demás datos académicos. |
| `utils/exportar.ts` | Convierte tablas a CSV y PDF y los guarda o comparte. |
| `utils/formato.ts` | Etiquetas de curso, fechas, porcentajes, semáforo de presentismo y nota mínima para aprobar. |
| `utils/validaciones.ts` | Reglas de validación de formularios (nombre, email, contraseña, texto libre, motivo, comunicados y calificaciones). |
| `global.css` | Variables CSS de fuentes. |

---

# Backend (Express + MySQL)

## Raíz

| Archivo | Responsabilidades |
|---|---|
| `server.js` | Arranca Express, activa CORS, el JSON (hasta 8 MB para las imágenes de justificaciones) y el manejo de errores, y monta todas las rutas bajo `/api`. |
| `db.js` | Pool de conexiones MySQL con la zona horaria configurada a -03:00. |
| `schema.sql` | Crea la base y las tablas (perfiles, cursos, materias, usuarios, dictados, inscripciones, clases_qr, asistencias, justificaciones, comunicados, calificaciones, auditoría, accesos) y carga los perfiles iniciales. |

## `routes/` — Endpoints de la API

| Archivo | Responsabilidades |
|---|---|
| `auth.js` | Registro público, login (JWT de 2 h), restablecer contraseña con código y OAuth (autorización y callback). |
| `cuenta.js` | Perfil propio, edición de cuenta, eliminar la propia cuenta y regenerar códigos de recuperación. |
| `usuarios.js` | Administración de usuarios: listar, crear, actualizar, resetear contraseña, ocultar, reincorporar, eliminar, exportar y listar perfiles. |
| `cursos.js` | CRUD de cursos (año 1 a 7 y división). |
| `materias.js` | CRUD de materias (nombre y año). |
| `dictados.js` | Asigna el profesor a cada materia y curso, y `/mis-materias` para la home del profesor y del alumno. |
| `inscripciones.js` | Curso, materias y recursadas de cada alumno, con validación de año. |
| `asistencias.js` | Lado del profesor: generar QR, QR firmado dinámico, cerrar toma, lista de alumnos, historial, marcado manual y notas de ausencia. |
| `asistenciasAlumno.js` | Lado del alumno: escanear QR, historial, resumen por materia y calendario mensual. |
| `justificaciones.js` | Pedidos de justificación del alumno, resolución del preceptor y correcciones manuales de asistencia. |
| `estadisticas.js` | Presentismo por materia (profesor) y por dictado y alumno (administrador). |
| `reportes.js` | Alertas de ausentismo y planillas de asistencia listas para exportar. |
| `calificaciones.js` | CRUD de notas del profesor, planilla y consulta de notas del alumno. |
| `evaluaciones.js` | Carga rápida de notas por curso e importación y exportación por CSV, con todo o nada. |
| `comunicados.js` | Enviar, listar, editar y eliminar comunicados, y notificaciones del usuario con marca de leído. |
| `ciclo.js` | Importación masiva de alumnos por CSV y promoción de cursos al año siguiente. |
| `auditoria.js` | Consulta de accesos y de eventos auditados. |

## `scripts/` — Lógica compartida

| Archivo | Responsabilidades |
|---|---|
| `auth.js` | Middlewares: `verificarToken`, `verificarPermiso`, `verificarProfesorDelDictado` y `verificarAlumnoDelDictado`. |
| `permisos.js` | Permisos de cada perfil (`PERMISOS_POR_PERFIL`). |
| `helpers.js` | Normalizar y validar email, validar enteros, códigos de recuperación, obtener permisos y validar texto libre. |
| `qrFirmado.js` | Crea y valida el QR firmado (`token.timestamp.firma`), con renovación cada 20 s y la expresión SQL de vencimiento. |
| `presentismo.js` | Cálculo del presentismo por alumno y dictado (una clase sin registro cuenta como ausente). |
| `auditoria.js` | Registra eventos en la tabla `auditoria` y genera etiquetas de dictado. |
| `csv.js` | Lectura de CSV (separador coma o punto y coma, comillas y BOM). |
| `fechas.js` | Lectura de fechas (`YYYY-MM-DD` o `DD/MM/YYYY`) y "hoy" según la base de datos. |
| `oauth.js` | URL de autorización y obtención de datos del usuario con los proveedores OAuth. |