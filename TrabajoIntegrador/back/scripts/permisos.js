export const PERMISOS_POR_PERFIL = {
  Administrador: [
    "crear_usuario", "editar_usuario", "eliminar_usuario", "ver_usuarios",
    "gestionar_cursos", "asignar_cursos", "ver_estadisticas",
  ],
  Profesor: ["generar_qr", "ver_asistencia"],
  Alumno: ["leer_qr"],
};