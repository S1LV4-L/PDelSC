import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { useSeleccion } from "../../hooks/useSeleccion";
import {
  eliminarUsuario,
  listarUsuarios,
  reincorporarUsuarios,
  UsuarioAdmin,
} from "../../services/usuarioService";
import Button from "../ui/Button";
import Texto from "../ui/Texto";
import BarraSeleccion from "./BarraSeleccion";
import FilaUsuario from "./FilaUsuario";

type Props = { onCambio: () => void };
type Eliminando = { id: number; paso: 1 | 2 };

export default function UsuariosOcultos({ onCambio }: Props) {
  const { user, token } = useAuth();
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [trabajando, setTrabajando] = useState(false);
  const [eliminando, setEliminando] = useState<Eliminando | null>(null);
  const seleccion = useSeleccion();
  const permisos = user?.permisos ?? [];
  const puedeEditar = permisos.includes("editar_usuario");
  const puedeEliminar = permisos.includes("eliminar_usuario");
  
  const cargar = useCallback(async () => {
    if (!token) return;
    try {
      setError("");
      setUsuarios(await listarUsuarios(token, true));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar la lista de usuarios ocultos");
    } finally {
      setCargando(false);
    }
  }, [token]);
  
  useEffect(() => {
    cargar();
  }, [cargar]);
  
  const reincorporar = async (ids: number[]) => {
    if (!token) return;
    try {
      setTrabajando(true);
      setError("");
      await reincorporarUsuarios(token, ids);
      seleccion.limpiar();
      await cargar();
      onCambio();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo reincorporar a los usuarios");
    } finally {
      setTrabajando(false);
    }
  };
  
  const eliminarDefinitivo = async (id: number) => {
    if (!token) return;
    try {
      setTrabajando(true);
      setError("");
      await eliminarUsuario(token, id);
      seleccion.limpiar();
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo eliminar el usuario");
    } finally {
      setTrabajando(false);
      setEliminando(null);
    }
  };
  
  const consecuencias = (u: UsuarioAdmin) =>
    u.perfil.nombre === "Profesor"
      ? "Se borrarán para siempre sus datos y los dictados que tiene asignados, con sus asistencias y notas."
      : "Se borrarán para siempre sus datos, asistencias, justificaciones y notas.";
  
  return (
    <View style={styles.bloque}>
      <Texto size={14} color="muted">
        Usuarios que ya no cursan o trabajan en la escuela. Conservan sus datos, pero no pueden ingresar ni
        aparecen en listas, estadísticas ni reportes.
      </Texto>
      {!!error && (
        <Texto size={14} color="error">
          {error}
        </Texto>
      )}
      {cargando ? (
        <ActivityIndicator />
      ) : usuarios.length === 0 ? (
        <Texto color="muted">No hay usuarios ocultos.</Texto>
      ) : (
        <>
          <BarraSeleccion
            ids={seleccion.ids}
            total={usuarios.length}
            nombreArchivo="usuarios_ocultos"
            onTodos={() => seleccion.seleccionar(usuarios.map((u) => u.id))}
            onLimpiar={seleccion.limpiar}
          >
            {puedeEditar && (
              <Button
                style={styles.boton}
                variant="outline"
                title="↺"
                loading={trabajando}
                onPress={() => reincorporar(seleccion.ids)}
              />
            )}
          </BarraSeleccion>
          {usuarios.map((u) => (
            <FilaUsuario
              key={u.id}
              usuario={u}
              seleccionado={seleccion.ids.includes(u.id)}
              onAlternar={() => seleccion.alternar(u.id)}
            >
              {eliminando?.id === u.id ? (
                <View style={styles.confirmacion}>
                  {eliminando.paso === 1 ? (
                    <>
                      <Texto size={14} bold color="error">
                        ¿Eliminar a {u.nombre} de la base de datos?
                      </Texto>
                      <View style={styles.acciones}>
                        <Button
                          style={styles.boton}
                          title="Continuar"
                          onPress={() => setEliminando({ id: u.id, paso: 2 })}
                        />
                        <Button variant="link" title="Cancelar" onPress={() => setEliminando(null)} />
                      </View>
                    </>
                  ) : (
                    <>
                      <Texto size={14} bold color="error">
                        Última confirmación. {consecuencias(u)} No se puede deshacer.
                      </Texto>
                      <View style={styles.acciones}>
                        <Button
                          style={styles.boton}
                          variant="danger"
                          title="Eliminar definitivamente"
                          loading={trabajando}
                          onPress={() => eliminarDefinitivo(u.id)}
                        />
                        <Button variant="link" title="Cancelar" onPress={() => setEliminando(null)} />
                      </View>
                    </>
                  )}
                </View>
              ) : (
                <View style={styles.acciones}>
                  {puedeEditar && (
                    <Button
                      style={styles.boton}
                      variant="outline"
                      title="↺"
                      loading={trabajando}
                      onPress={() => reincorporar([u.id])}
                    />
                  )}
                  {puedeEliminar && (
                    <Button
                      style={styles.boton}
                      variant="outline"
                      title="✕"
                      onPress={() => setEliminando({ id: u.id, paso: 1 })}
                    />
                  )}
                </View>
              )}
            </FilaUsuario>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bloque: { gap: 14 },
  confirmacion: { gap: 8, flexShrink: 1 },
  acciones: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  boton: { paddingVertical: 10, paddingHorizontal: 10 },
});