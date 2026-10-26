import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { useFocusEffect } from "expo-router";
import Pantalla from "../../components/layout/Pantalla";
import BotonesExportar from "../../components/ui/BotonesExportar";
import Tarjeta from "../../components/ui/Tarjeta";
import Texto from "../../components/ui/Texto";
import { useTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { resumenNotas } from "../../services/calificacionService";
import { NotaPropia, ResumenNotas, Tabla } from "../../types/academico";
import { APRUEBA, cursoLabel, dictadoLabel, fechaLarga } from "../../utils/formato";

const colorNota = (n: number | null) => (n === null ? "muted" : n >= APRUEBA ? "success" : "error");
const fechaCorta = (iso: string) => iso.slice(0, 10).split("-").reverse().join("/");

// Boletín listo para exportar a CSV / PDF
const aTabla = (d: ResumenNotas, alumno: string): Tabla => ({
  titulo: "Boletín de calificaciones",
  subtitulo: `${alumno} · Promedio general: ${d.promedioGeneral === null ? "sin notas" : d.promedioGeneral.toFixed(2)}`,
  columnas: ["Materia", "Curso", "Calificación", "Fecha", "Nota"],
  filas: d.materias.flatMap((m) => {
    const curso = cursoLabel(m.anio, m.division);
    
    if (m.notas.length === 0) return [[m.materia, curso, "Sin calificaciones", "", ""]];
    
    return [
      ...m.notas.map((n) => [m.materia, curso, n.titulo, fechaCorta(n.fecha), n.nota]),
      [m.materia, curso, "Promedio", "", m.promedio === null ? "" : m.promedio.toFixed(2)],
    ];
  }),
});

// Una barra por calificación, de la más antigua a la más reciente
function Evolucion({ notas }: { notas: NotaPropia[] }) {
  const theme = useTheme();
  
  if (notas.length < 2) return null;
  
  return (
    <View style={{ gap: 6 }}>
      <Texto size={13} color="muted">Evolución (de la más antigua a la más reciente)</Texto>
      <View style={styles.barras}>
        {notas.map((n) => (
          <View
            key={n.id}
            style={[
              styles.barra,
              { height: n.nota * 8, backgroundColor: n.nota >= APRUEBA ? theme.success : theme.error },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

export default function NotasScreen() {
  const theme = useTheme();
  const { token, user } = useAuth();
  const [datos, setDatos] = useState<ResumenNotas | null>(null);
  const [abierto, setAbierto] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  
  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      resumenNotas(token)
        .then((d) => {
          setDatos(d);
          setError("");
        })
        .catch((e) => setError(e instanceof Error ? e.message : "No se pudieron cargar tus notas"))
        .finally(() => setCargando(false));
    }, [token])
  );
  
  const materias = datos?.materias ?? [];
  const conNotas = materias.filter((m) => m.promedio !== null).length;
  
  return (
    <Pantalla>
      <Texto size={24} bold>Notas</Texto>
      {!!error && <Texto size={14} color="error">{error}</Texto>}
      <Tarjeta>
        <Texto size={20} bold>Promedio general</Texto>
        {cargando ? (
          <ActivityIndicator />
        ) : (
          <>
            <Texto size={28} bold color={colorNota(datos?.promedioGeneral ?? null)}>
              {datos?.promedioGeneral == null ? "—" : datos.promedioGeneral.toFixed(2)}
            </Texto>
            <Texto size={14} color="muted">
              {conNotas} de {materias.length} materias con calificaciones
            </Texto>
          </>
        )}
      </Tarjeta>
      <Tarjeta>
        <Texto size={20} bold>Mis materias</Texto>
        {cargando ? (
          <ActivityIndicator />
        ) : materias.length === 0 ? (
          <Texto color="muted">Todavía no tienes materias asignadas. Consulta con el administrador.</Texto>
        ) : (
          materias.map((m) => {
            
            const expandida = abierto === m.dictado_id;
            
            return (
              <Pressable
                key={m.dictado_id}
                onPress={() => setAbierto(expandida ? null : m.dictado_id)}
                style={[styles.materia, { borderColor: expandida ? theme.primary : theme.border }]}
              >
                <View style={styles.fila}>
                  <View style={{ flex: 1 }}>
                    <Texto bold>{dictadoLabel(m)}</Texto>
                    <Texto size={14} color="muted">
                      {m.notas.length === 0 ? "Sin calificaciones" : `${m.notas.length} calificacion(es)`}
                    </Texto>
                  </View>
                  <Texto size={20} bold color={colorNota(m.promedio)}>
                    {m.promedio === null ? "—" : m.promedio.toFixed(2)}
                  </Texto>
                </View>
                {expandida && m.notas.length > 0 && (
                  <>
                    <Evolucion notas={m.notas} />
                    {[...m.notas].reverse().map((n) => (
                      <View key={n.id} style={[styles.fila, styles.nota, { borderColor: theme.border }]}>
                        <View style={{ flex: 1 }}>
                          <Texto bold>{n.titulo}</Texto>
                          <Texto size={14} color="muted">{fechaLarga(n.fecha)}</Texto>
                        </View>
                        <Texto size={18} bold color={colorNota(n.nota)}>{n.nota}</Texto>
                      </View>
                    ))}
                  </>
                )}
              </Pressable>
            );
          })
        )}
      </Tarjeta>
      {!!datos && materias.length > 0 && (
        <Tarjeta>
          <Texto size={20} bold>Exportar boletín</Texto>
          <BotonesExportar
            obtener={async () => aTabla(datos, user?.nombre ?? "")}
            nombre="boletin_notas"
          />
        </Tarjeta>
      )}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  materia: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 12 },
  fila: { flexDirection: "row", alignItems: "center", gap: 12 },
  nota: { borderTopWidth: 1, paddingTop: 10 },
  barras: { flexDirection: "row", alignItems: "flex-end", gap: 6, height: 80 },
  barra: { flex: 1, maxWidth: 24, borderRadius: 4 },
});