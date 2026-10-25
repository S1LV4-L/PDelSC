export const PERMISOS_POR_PERFIL = {
  Administrador: [
    "crear_usuario", "editar_usuario", "eliminar_usuario", "ver_usuarios",
    "gestionar_cursos", "asignar_cursos", "ver_estadisticas",
    "ver_reportes", "corregir_asistencias", "importar_alumnos", "ver_auditoria", "enviar_comunicados",
  ],
  Profesor: ["generar_qr", "ver_asistencia", "marcar_manual", "gestionar_calificaciones"],
  Alumno: ["leer_qr", "pedir_justificacion"],
};
