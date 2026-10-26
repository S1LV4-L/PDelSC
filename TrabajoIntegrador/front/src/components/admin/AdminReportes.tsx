import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useCatalogo } from "../../hooks/useCatalogo";
import { reporteAsistencia } from "../../services/adminService";
import { listarUsuarios, UsuarioAdmin } from "../../services/usuarioService";
import { cursoLabel, fechaValida, hoyISO } from "../../utils/formato";
import BotonesExportar from "../ui/BotonesExportar";
import Button from "../ui/Button";
import Chips from "../ui/Chips";
import ChipsFiltro from "../ui/ChipsFiltro";
import FilaItem from "../ui/FilaItem";
import Input from "../ui/Input";
import Tarjeta from "../ui/Tarjeta";
import Texto from "../ui/Texto";

const TIPOS = [
  { valor: "detalle" as const, label: "Detalle por clase" },
  { valor: "resumen" as const, label: "Resumen por alumno" },
];

export default function AdminReportes() {
  const { token } = useAuth();
  const { cursos, materias } = useCatalogo();
  const [tipo, setTipo] = useState<"detalle" | "resumen">("detalle");
  const [cursoId, setCursoId] = useState<number | null>(null);
  const [materiaId, setMateriaId] = useState<number | null>(null);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [alumnos, setAlumnos] = useState<UsuarioAdmin[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [alumno, setAlumno] = useState<UsuarioAdmin | null>(null);
  
  useEffect(() => {
    if (!token) return;
    listarUsuarios(token)
      .then((u) => setAlumnos(u.filter((x) => x.perfil.nombre === "Alumno")))
      .catch(() => {});
  }, [token]);
  
  const q = busqueda.trim().toLowerCase();
  const coincidencias = q.length >= 2 && !alumno ? alumnos.filter((a) => a.nombre.toLowerCase().includes(q)).slice(0, 6) : [];
  
  const obtener = async () => {
    if (!token) throw new Error("Sesión inválida");
    if (desde && !fechaValida(desde)) throw new Error("La fecha desde debe ser YYYY-MM-DD");
    if (hasta && !fechaValida(hasta)) throw new Error("La fecha hasta debe ser YYYY-MM-DD");
    return reporteAsistencia(token, {
      tipo,
      cursoId,
      materiaId,
      alumnoId: alumno?.id ?? null,
      desde: desde || undefined,
      hasta: hasta || undefined,
    });
  };
  
  return (
    <Tarjeta>
      <Texto size={20} bold>Planillas de asistencia</Texto>
      <Texto size={14} color="muted">Para exportar planillas. Deja los filtros en "Todos" para el reporte completo.</Texto>
      <Chips opciones={TIPOS} valor={tipo} onChange={setTipo} />
      <Texto size={14} bold>Curso</Texto>
      <ChipsFiltro
        opciones={cursos.map((c) => ({ valor: c.id, label: cursoLabel(c.anio, c.division) }))}
        valor={cursoId}
        onChange={setCursoId}
      />
      <Texto size={14} bold>Materia</Texto>
      <ChipsFiltro
        opciones={materias.map((m) => ({ valor: m.id, label: `${m.nombre} ${m.anio}°` }))}
        valor={materiaId}
        onChange={setMateriaId}
      />
      {alumno ? (
        <>
          <Texto size={14} bold>Alumno: {alumno.nombre}</Texto>
          <Button variant="link" title="Quitar alumno" onPress={() => { setAlumno(null); setBusqueda(""); }} />
        </>
      ) : (
        <>
          <Input label="Filtrar por alumno (opcional)" value={busqueda} onChangeText={setBusqueda}
            placeholder="Escribe al menos 2 letras del nombre para filtrar" />
          {q.length >= 2 && coincidencias.length === 0 && (
            <Texto size={14} color="muted">No hay alumnos que coincidan con esa búsqueda.</Texto>
          )}
          {coincidencias.map((a) => (
            <FilaItem key={a.id} titulo={a.nombre} subtitulo={a.curso ? cursoLabel(a.curso.anio, a.curso.division) : undefined} onPress={() => setAlumno(a)} />
          ))}
        </>
      )}
      <Input label="Desde (YYYY-MM-DD)" value={desde} onChangeText={setDesde} placeholder="2026-03-01" />
      <Input label="Hasta (YYYY-MM-DD)" value={hasta} onChangeText={setHasta} placeholder={hoyISO()} />
      <BotonesExportar obtener={obtener} nombre={`asistencia-${hoyISO()}`} />
    </Tarjeta>
  );
}