import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { useResponsive } from "../../hooks/useResponsive";
import { useSeleccion } from "../../hooks/useSeleccion";
import {
  actualizarUsuario,
  crearUsuario,
  listarPerfiles,
  listarUsuarios,
  ocultarUsuarios,
  PerfilItem,
  UsuarioAdmin,
} from "../../services/usuarioService";
import AsignacionAlumno from "./AsignacionAlumno";
import RecoveryCodes from "../ui/CodigosRecuperacion";
import Button from "../ui/Button";
import BarraSeleccion from "./BarraSeleccion";
import FilaUsuario from "./FilaUsuario";
import FormularioUsuario from "./FormularioUsuario";
import UsuariosOcultos from "./UsuariosOcultos";
import { DatosForm, Modo } from "./usuariosTypes";

type Vista = "activos" | "ocultos";

export default function AdminUsuarios() {
  const theme = useTheme();
  const { fs } = useResponsive();
  const { user, token } = useAuth();
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [perfiles, setPerfiles] = useState<PerfilItem[]>([]);
  const [modo, setModo] = useState<Modo>({ tipo: "lista" });
  const [vista, setVista] = useState<Vista>("activos");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorForm, setErrorForm] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [trabajando, setTrabajando] = useState(false);
  const [ocultandoId, setOcultandoId] = useState<number | null>(null);
  const [ocultandoVarios, setOcultandoVarios] = useState(false);
  
  const seleccion = useSeleccion();
  const permisos = user?.permisos ?? [];
  const puedeCrear = permisos.includes("crear_usuario");
  const puedeEditar = permisos.includes("editar_usuario");
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
  
  const cambiarVista = (nueva: Vista) => {
    seleccion.limpiar();
    setOcultandoId(null);
    setOcultandoVarios(false);
    setError("");
    if (nueva === "activos") cargar();
    setVista(nueva);
  };
  
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
  
  const ocultar = async (ids: number[]) => {
    if (!token) return;
    try {
      setTrabajando(true);
      setError("");
      await ocultarUsuarios(token, ids);
      seleccion.limpiar();
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo ocultar a los usuarios");
    } finally {
      setTrabajando(false);
      setOcultandoId(null);
      setOcultandoVarios(false);
    }
  };
  
  const confirmarOcultarVarios = () => {
    const ids = seleccion.ids.filter((id) => id !== user?.id);
    if (ids.length === 0) {
      setError("No puedes ocultar tu propia cuenta");
      setOcultandoVarios(false);
      return;
    }
    ocultar(ids);
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
        <Text style={[styles.titulo, { color: theme.text, fontSize: fs(20) }]}>Usuario creado</Text>
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
  
  // --- Pantalla: lista de usuarios (pestañas Activos / Ocultos) ---
  return (
    <View style={styles.bloque}>
      <View style={styles.encabezado}>
        <Text style={[styles.titulo, styles.tituloLista, { color: theme.text, fontSize: fs(20) }]}>
          Usuarios
        </Text>
        {puedeCrear && vista === "activos" && (
          <Button style={styles.botonAccion} title=" + " onPress={() => abrirFormulario({ tipo: "crear" })} />
        )}
      </View>
      <View style={styles.pestanas}>
        {(["activos", "ocultos"] as Vista[]).map((v) => {
          const activa = vista === v;
          return (
            <Pressable
              key={v}
              onPress={() => cambiarVista(v)}
              accessibilityRole="tab"
              accessibilityState={{ selected: activa }}
            >
              <Text
                style={{
                  color: activa ? theme.text : theme.muted,
                  fontSize: fs(13),
                  fontWeight: activa ? "700" : "500",
                  textDecorationLine: activa ? "underline" : "none",
                }}
              >
                {v === "activos" ? "Activos" : "Ocultos"}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {vista === "ocultos" ? (
        <UsuariosOcultos onCambio={cargar} />
      ) : (
        <>
          {!!error && <Text style={{ color: theme.error, fontSize: fs(14) }}>{error}</Text>}
          {cargando ? (
            <ActivityIndicator />
          ) : usuarios.length === 0 ? (
            <Text style={{ color: theme.muted, fontSize: fs(15) }}>No hay usuarios.</Text>
          ) : (
            <>
              <BarraSeleccion
                ids={seleccion.ids}
                total={usuarios.length}
                nombreArchivo="usuarios"
                onTodos={() => seleccion.seleccionar(usuarios.map((u) => u.id))}
                onLimpiar={() => {
                  seleccion.limpiar();
                  setOcultandoVarios(false);
                }}
              >
                {puedeEditar &&
                  (ocultandoVarios ? (
                    <>
                      <Text style={{ color: theme.warning, fontSize: fs(14), fontWeight: "600" }}>
                        ¿Dar de baja {seleccion.ids.length} usuario(s)?
                      </Text>
                      <Button
                        style={styles.botonAccion}
                        title="Confirmar"
                        loading={trabajando}
                        onPress={confirmarOcultarVarios}
                      />
                      <Button variant="link" title="Cancelar" onPress={() => setOcultandoVarios(false)} />
                    </>
                  ) : (
                    <Button
                      style={styles.botonAccion}
                      variant="outline"
                      title="▼"
                      onPress={() => setOcultandoVarios(true)}
                    />
                  ))}
              </BarraSeleccion>
              {usuarios.map((u) => {
                const esYo = u.id === user?.id;
                const esAlumno = u.perfil.nombre === "Alumno";
                
                return (
                  <FilaUsuario
                    key={u.id}
                    usuario={u}
                    esYo={esYo}
                    seleccionado={seleccion.ids.includes(u.id)}
                    onAlternar={() => seleccion.alternar(u.id)}
                  >
                    {ocultandoId === u.id ? (
                      <View style={styles.acciones}>
                        <Text style={{ color: theme.warning, fontSize: fs(14), fontWeight: "600" }}>
                          ¿Dar de baja a {u.nombre}?
                        </Text>
                        <Button
                          style={styles.botonAccion}
                          title="Confirmar"
                          loading={trabajando}
                          onPress={() => ocultar([u.id])}
                        />
                        <Button variant="link" title="Cancelar" onPress={() => setOcultandoId(null)} />
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
                        {puedeEditar && !esYo && (
                          <Button
                            style={styles.botonAccion}
                            variant="outline"
                            title="▼"
                            onPress={() => setOcultandoId(u.id)}
                          />
                        )}
                      </View>
                    )}
                  </FilaUsuario>
                );
              })}
            </>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bloque: { gap: 14 },
  encabezado: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  titulo: { fontWeight: "800", letterSpacing: -0.3 },
  tituloLista: { flex: 1 },
  pestanas: { flexDirection: "row", gap: 16 },
  acciones: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  botonAccion: { paddingVertical: 10, paddingHorizontal: 10 },
});