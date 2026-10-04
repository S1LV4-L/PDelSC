import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../constants/theme";
import { useAuth } from "../hooks/useAuth";
import { useResponsive } from "../hooks/useResponsive";
import {
  actualizarUsuario,
  crearUsuario,
  eliminarUsuario,
  listarPerfiles,
  listarUsuarios,
  PerfilItem,
  UsuarioAdmin,
} from "../services/usuarioService";
import { validar } from "../utils/validaciones";
import RecoveryCodes from "./CodigosRecuperacion";
import Button from "./ui/Button";
import Input from "./ui/Input";

type Modo =
  | { tipo: "lista" }
  | { tipo: "crear" }
  | { tipo: "editar"; usuario: UsuarioAdmin }
  | { tipo: "codigos"; codigos: string[]; nombre: string };

type DatosForm = { nombre: string; email: string; password?: string; perfilId: number };

type FormProps = {
  usuario?: UsuarioAdmin;
  perfiles: PerfilItem[];
  bloquearPerfil: boolean;
  loading: boolean;
  error: string;
  onGuardar: (datos: DatosForm) => void;
  onCancelar: () => void;
};

function FormularioUsuario({
  usuario,
  perfiles,
  bloquearPerfil,
  loading,
  error,
  onGuardar,
  onCancelar,
}: FormProps) {
  const theme = useTheme();
  const { fs } = useResponsive();
  const editando = !!usuario;

  const [nombre, setNombre] = useState(usuario?.nombre ?? "");
  const [email, setEmail] = useState(usuario?.email ?? "");
  const [password, setPassword] = useState("");
  const [perfilId, setPerfilId] = useState<number | null>(
    usuario?.perfil.id ??
      perfiles.find((p) => p.nombre === "Invitado")?.id ??
      perfiles[0]?.id ??
      null
  );
  const [submitted, setSubmitted] = useState(false);

  // Al editar, el email puede quedar vacío (usuarios que entraron por OAuth no tienen)
  const validarEmailForm = (valor: string) =>
    editando && valor.trim() === "" ? null : validar.email(valor);

  const enviar = () => {
    setSubmitted(true);
    const hayErrores = [
      validar.nombre(nombre),
      validarEmailForm(email),
      editando ? null : validar.password(password),
    ].some(Boolean);
    if (hayErrores || perfilId === null) return;

    onGuardar({
      nombre: nombre.trim(),
      email: email.trim(),
      password: editando ? undefined : password,
      perfilId,
    });
  };

  return (
    <View style={styles.bloque}>
      <Text style={[styles.titulo, { color: theme.text, fontSize: fs(20) }]}>
        {editando ? "Editar usuario" : "Nuevo usuario"}
      </Text>

      <Input
        label="Nombre de usuario"
        value={nombre}
        onChangeText={setNombre}
        validate={validar.nombre}
        submitted={submitted}
      />
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholder="usuario@email.com"
        validate={validarEmailForm}
        submitted={submitted}
      />
      {!editando && (
        <Input
          label="Contraseña inicial"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Mínimo 8 caracteres"
          validate={validar.password}
          submitted={submitted}
        />
      )}

      <View>
        <Text style={[styles.label, { color: theme.text, fontSize: fs(14) }]}>Perfil</Text>
        {perfiles.length === 0 ? (
          <Text style={{ color: theme.error, fontSize: fs(14) }}>
            No se pudieron cargar los perfiles
          </Text>
        ) : (
          <View style={styles.chips}>
            {perfiles.map((p) => {
              const activo = p.id === perfilId;
              return (
                <Pressable
                  key={p.id}
                  disabled={bloquearPerfil}
                  onPress={() => setPerfilId(p.id)}
                  style={[
                    styles.chip,
                    {
                      borderColor: activo ? theme.primary : theme.border,
                      backgroundColor: activo ? theme.primary : theme.surface,
                      opacity: bloquearPerfil && !activo ? 0.4 : 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: activo ? "#fff" : theme.text,
                      fontSize: fs(14),
                      fontWeight: "600",
                    }}
                  >
                    {p.nombre}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
        {bloquearPerfil && (
          <Text style={{ color: theme.muted, fontSize: fs(13), marginTop: 6 }}>
            No puedes cambiar tu propio perfil.
          </Text>
        )}
      </View>

      {!!error && <Text style={{ color: theme.error, fontSize: fs(14) }}>{error}</Text>}

      <View style={styles.botonesForm}>
        <Button
          title={editando ? "Guardar cambios" : "Crear usuario"}
          onPress={enviar}
          loading={loading}
        />
        <Button variant="link" title="Cancelar" onPress={onCancelar} />
      </View>
    </View>
  );
}

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
  // Id del usuario cuya eliminación está pendiente de confirmar
  const [eliminando, setEliminando] = useState<number | null>(null);

  const permisos = user?.permisos ?? [];
  const puedeCrear = permisos.includes("crear_usuario");
  const puedeEditar = permisos.includes("editar_usuario");
  const puedeEliminar = permisos.includes("eliminar_usuario");

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
        setModo({ tipo: "codigos", codigos: res.codigosRecuperacion, nombre: datos.nombre });
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

  if (modo.tipo === "codigos") {
    return (
      <View style={styles.bloque}>
        <Text style={[styles.titulo, { color: theme.text, fontSize: fs(20) }]}>
          Usuario creado
        </Text>
        <Text style={{ color: theme.muted, fontSize: fs(15), lineHeight: fs(22) }}>
          Entrega estos códigos de recuperación a {modo.nombre}. No se volverán a mostrar.
        </Text>
        <RecoveryCodes
          codigos={modo.codigos}
          continueLabel="Listo"
          onContinue={() => setModo({ tipo: "lista" })}
        />
      </View>
    );
  }

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
  label: { fontWeight: "600", marginBottom: 6 },
  fila: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 10 },
  filaDesktop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  datos: { flex: 1, gap: 2 },
  acciones: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1 },
  botonesForm: { gap: 8, alignItems: "stretch" },
  botonAccion: { paddingVertical: 10, paddingHorizontal: 10 },
});