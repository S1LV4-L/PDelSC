import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { useResponsive } from "../../hooks/useResponsive";
import {
  actualizarUsuario,
  crearUsuario,
  eliminarUsuario,
  listarPerfiles,
  listarUsuarios,
  PerfilItem,
  UsuarioAdmin,
} from "../../services/usuarioService";
import { cursoLabel } from "../../utils/formato";
import AsignacionAlumno from "./AsignacionAlumno";
import RecoveryCodes from "../ui/CodigosRecuperacion";
import Button from "../ui/Button";
import FormularioUsuario from "./FormularioUsuario";
import { DatosForm, Modo } from "./usuariosTypes";

export default function AdminUsuarios() {
  const theme = useTheme();
  const { fs, isDesktop } = useResponsive();
  const { user, token } = useAuth();

  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [perfiles, setPerfiles] = useState<PerfilItem[]>([]);
  const [modo, setModo] = useState<Modo>({ tipo: "lista" });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorForm, setErrorForm] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState<number | null>(null);

  const permisos = user?.permisos ?? [];
  const puedeCrear = permisos.includes("crear_usuario");
  const puedeEditar = permisos.includes("editar_usuario");
  const puedeEliminar = permisos.includes("eliminar_usuario");
  const puedeAsignar = permisos.includes("asignar_cursos");

  const cargar = useCallback(async () => {
    if (!token) return;
    try {
      setError("");
      const [lista, listaPerfiles] = await Promise.all([
        listarUsuarios(token),
        listarPerfiles(token).catch(() => [] as PerfilItem[]),
      ]);
      setUsuarios(lista);
      setPerfiles(listaPerfiles);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar la lista de usuarios");
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const guardar = async (datos: DatosForm) => {
    if (!token) return;
    try {
      setGuardando(true);
      setErrorForm("");
      if (modo.tipo === "crear") {
        const res = await crearUsuario(token, {
          nombre: datos.nombre,
          email: datos.email,
          password: datos.password ?? "",
          perfilId: datos.perfilId,
        });
        await cargar();
        const esAlumno = perfiles.find((p) => p.id === datos.perfilId)?.nombre === "Alumno";
        setModo({
          tipo: "codigos",
          codigos: res.codigosRecuperacion,
          nombre: datos.nombre,
          alumnoId: esAlumno && puedeAsignar ? res.id : undefined,
        });
      } else if (modo.tipo === "editar") {
        await actualizarUsuario(token, {
          id: modo.usuario.id,
          nombre: datos.nombre,
          email: datos.email,
          perfilId: datos.perfilId,
        });
        await cargar();
        setModo({ tipo: "lista" });
      }
    } catch (e) {
      setErrorForm(e instanceof Error ? e.message : "No se pudo guardar el usuario");
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = async (id: number) => {
    if (!token) return;
    try {
      await eliminarUsuario(token, id);
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo eliminar el usuario");
    } finally {
      setEliminando(null);
    }
  };

  const abrirFormulario = (nuevo: Modo) => {
    setErrorForm("");
    setModo(nuevo);
  };

  // --- Pantalla: códigos de recuperación ---
  if (modo.tipo === "codigos") {
    const { alumnoId, nombre } = modo;
    return (
      <View style={styles.bloque}>
        <Text style={[styles.titulo, { color: theme.text, fontSize: fs(20) }]}>
          Usuario creado
        </Text>
        <Text style={{ color: theme.muted, fontSize: fs(15), lineHeight: fs(22) }}>
          Entrega estos códigos de recuperación a {nombre}. No se volverán a mostrar.
        </Text>
        <RecoveryCodes
          codigos={modo.codigos}
          continueLabel={alumnoId ? "Continuar" : "Listo"}
          onContinue={() =>
            setModo(alumnoId ? { tipo: "asignar", id: alumnoId, nombre } : { tipo: "lista" })
          }
        />
      </View>
    );
  }

  // --- Pantalla: asignar curso/materias ---
  if (modo.tipo === "asignar") {
    return (
      <AsignacionAlumno
        alumnoId={modo.id}
        nombre={modo.nombre}
        onTerminar={() => {
          cargar();
          setModo({ tipo: "lista" });
        }}
      />
    );
  }

  // --- Pantalla: crear / editar ---
  if (modo.tipo === "crear" || modo.tipo === "editar") {
    const usuarioEditado = modo.tipo === "editar" ? modo.usuario : undefined;
    return (
      <FormularioUsuario
        key={usuarioEditado?.id ?? "nuevo"}
        usuario={usuarioEditado}
        perfiles={perfiles}
        bloquearPerfil={!!usuarioEditado && usuarioEditado.id === user?.id}
        loading={guardando}
        error={errorForm}
        onGuardar={guardar}
        onCancelar={() => setModo({ tipo: "lista" })}
      />
    );
  }

  // --- Pantalla: lista de usuarios ---
  return (
    <View style={styles.bloque}>
      <View style={styles.encabezado}>
        <Text style={[styles.titulo, styles.tituloLista, { color: theme.text, fontSize: fs(20) }]}>
          Usuarios
        </Text>
        {puedeCrear && (
          <Button style={styles.botonAccion} title="+" onPress={() => abrirFormulario({ tipo: "crear" })} />
        )}
      </View>

      {!!error && <Text style={{ color: theme.error, fontSize: fs(14) }}>{error}</Text>}

      {cargando ? (
        <ActivityIndicator />
      ) : usuarios.length === 0 ? (
        <Text style={{ color: theme.muted, fontSize: fs(15) }}>No hay usuarios.</Text>
      ) : (
        usuarios.map((u) => {
          const esYo = u.id === user?.id;
          const esAlumno = u.perfil.nombre === "Alumno";
          return (
            <View
              key={u.id}
              style={[
                styles.fila,
                isDesktop && styles.filaDesktop,
                { borderColor: theme.border },
              ]}
            >
              <View style={styles.datos}>
                <Text style={{ color: theme.text, fontSize: fs(16), fontWeight: "700" }}>
                  {u.nombre}
                  {esYo ? " (tú)" : ""}
                </Text>
                <Text style={{ color: theme.muted, fontSize: fs(14) }}>
                  {u.email ?? "Sin email"} · {u.perfil.nombre}
                  {esAlumno
                    ? ` · ${u.curso ? `Curso ${cursoLabel(u.curso.anio, u.curso.division)}` : "Sin curso"}`
                    : ""}
                </Text>
              </View>

              {eliminando === u.id ? (
                <View style={styles.acciones}>
                  <Text style={{ color: theme.error, fontSize: fs(14), fontWeight: "600" }}>
                    ¿Eliminar a {u.nombre}?
                  </Text>
                  <Button style={styles.botonAccion} title="Confirmar" onPress={() => confirmarEliminar(u.id)} />
                  <Button variant="link" title="Cancelar" onPress={() => setEliminando(null)} />
                </View>
              ) : (
                <View style={styles.acciones}>
                  {esAlumno && puedeAsignar && (
                    <Button
                      style={styles.botonAccion}
                      variant="outline"
                      title="Asignar"
                      onPress={() => abrirFormulario({ tipo: "asignar", id: u.id, nombre: u.nombre })}
                    />
                  )}
                  {puedeEditar && (
                    <Button
                      style={styles.botonAccion}
                      variant="outline"
                      title="✎"
                      onPress={() => abrirFormulario({ tipo: "editar", usuario: u })}
                    />
                  )}
                  {puedeEliminar && !esYo && (
                    <Button style={styles.botonAccion} variant="outline" title="X" onPress={() => setEliminando(u.id)} />
                  )}
                </View>
              )}
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bloque: { gap: 14 },
  encabezado: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  titulo: { fontWeight: "800", letterSpacing: -0.3 },
  tituloLista: { flex: 1 },
  fila: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 10 },
  filaDesktop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  datos: { flex: 1, gap: 2 },
  acciones: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  botonAccion: { paddingVertical: 10, paddingHorizontal: 10 },
});