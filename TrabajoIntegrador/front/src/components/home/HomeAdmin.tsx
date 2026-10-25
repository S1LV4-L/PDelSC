import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { useResponsive } from "../../hooks/useResponsive";
import { estadisticasAlumnos, estadisticasDictados } from "../../services/estadisticaService";
import { EstadisticaAlumno, EstadisticaDictado } from "../../types/academico";
import { dictadoLabel, porcentaje } from "../../utils/formato";
import CabeceraUsuario from "../../components/layout/CabeceraUsuario"
import Pantalla from "../../components/layout/Pantalla"
import FilaItem from "../ui/FilaItem";
import Tarjeta from "../ui/Tarjeta";
import AdminAlertas from "../admin/AdminAlertas";

function Pct({ valor }: { valor: string | number | null }) {
  const theme = useTheme();
  const { fs } = useResponsive();
  if (valor === null) return <Text style={{ color: theme.muted, fontSize: fs(14) }}>—</Text>;
  const n = Number(valor);
  return (
    <Text style={{ color: n >= 75 ? theme.success : theme.error, fontSize: fs(15), fontWeight: "700" }}>
      {n}%
    </Text>
  );
}

export default function HomeAdmin() {
  const theme = useTheme();
  const { fs } = useResponsive();
  const { token } = useAuth();

  const [datos, setDatos] = useState<EstadisticaDictado[]>([]);
  const [abierto, setAbierto] = useState<number | null>(null);
  const [alumnos, setAlumnos] = useState<EstadisticaAlumno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoAlumnos, setCargandoAlumnos] = useState(false);
  const [error, setError] = useState("");

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      estadisticasDictados(token)
        .then((lista) => {
          setDatos(lista);
          setError("");
        })
        .catch((e) => setError(e instanceof Error ? e.message : "No se pudieron cargar las estadísticas"))
        .finally(() => setCargando(false));
    }, [token])
  );

  const alternar = async (id: number) => {
    if (abierto === id) {
      setAbierto(null);
      return;
    }
    setAbierto(id);
    setAlumnos([]);
    if (!token) return;
    try {
      setCargandoAlumnos(true);
      setAlumnos(await estadisticasAlumnos(token, id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar el detalle");
    } finally {
      setCargandoAlumnos(false);
    }
  };

  const presentes = datos.reduce((acc, d) => acc + Number(d.presentes), 0);
  const ausentes = datos.reduce((acc, d) => acc + Number(d.ausentes), 0);

  return (
    <Pantalla>
      <CabeceraUsuario conMiCuenta={false} />

      <AdminAlertas />

      <Tarjeta>
        <Text style={[styles.titulo, { color: theme.text, fontSize: fs(20) }]}>Presentismo</Text>

        {!!error && <Text style={{ color: theme.error, fontSize: fs(14) }}>{error}</Text>}

        {cargando ? (
          <ActivityIndicator />
        ) : datos.length === 0 ? (
          <Text style={{ color: theme.muted, fontSize: fs(15) }}>
            Todavía no hay materias asignadas a cursos.
          </Text>
        ) : (
          <>
            <Text style={{ color: theme.muted, fontSize: fs(15) }}>
              General: {porcentaje(presentes, presentes + ausentes)}% de presentismo ({presentes} presentes,{" "}
              {ausentes} ausentes)
            </Text>

            {datos.map((d) => (
              <View key={d.id} style={styles.grupo}>
                <FilaItem
                  titulo={dictadoLabel(d)}
                  subtitulo={`${d.clases} clases · ${d.presentes} presentes · ${d.ausentes} ausentes`}
                  derecha={<Pct valor={d.porcentaje_presentismo} />}
                  onPress={() => alternar(d.id)}
                />

                {abierto === d.id && (
                  <View style={styles.anidado}>
                    {cargandoAlumnos ? (
                      <ActivityIndicator />
                    ) : alumnos.length === 0 ? (
                      <Text style={{ color: theme.muted, fontSize: fs(14) }}>
                        No hay alumnos inscriptos.
                      </Text>
                    ) : (
                      alumnos.map((a) => (
                        <FilaItem
                          key={a.id}
                          titulo={a.nombre}
                          subtitulo={`${a.presentes}/${a.clases} clases`}
                          derecha={<Pct valor={a.porcentaje_presentismo} />}
                        />
                      ))
                    )}
                  </View>
                )}
              </View>
            ))}
          </>
        )}
      </Tarjeta>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  titulo: { fontWeight: "800", letterSpacing: -0.3 },
  grupo: { gap: 8 },
  anidado: { marginLeft: 16, gap: 8 },
});