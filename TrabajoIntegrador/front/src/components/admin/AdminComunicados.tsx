import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { useCatalogo } from "../../hooks/useCatalogo";
import {
  comunicadosEnviados,
  editarComunicado,
  eliminarComunicado,
  enviarComunicado,
} from "../../services/comunicadoService";
import { listarUsuarios, UsuarioAdmin } from "../../services/usuarioService";
import { ComunicadoEnviado } from "../../types/academico";
import { cursoLabel } from "../../utils/formato";
import Button from "../ui/Button";
import Chips from "../ui/Chips";
import FilaAcciones from "../ui/FilaAcciones";
import FilaItem from "../ui/FilaItem";
import Input from "../ui/Input";
import Tarjeta from "../ui/Tarjeta";
import Texto from "../ui/Texto";
import { soloTexto, soloTextoMultilinea, validar } from "../../utils/validaciones";

type Alcance = "global" | "curso" | "usuario";

const ALCANCES = [
  { valor: "global" as Alcance, label: "Todos" },
  { valor: "curso" as Alcance, label: "Cursos" },
  { valor: "usuario" as Alcance, label: "Alumnos / profesores" },
];

const alternar = (lista: number[], id: number) => (lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id]);

export default function AdminComunicados() {
  const { token } = useAuth();
  const { cursos } = useCatalogo();
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [alcance, setAlcance] = useState<Alcance>("global");
  const [cursoIds, setCursoIds] = useState<number[]>([]);
  const [usuarioIds, setUsuarioIds] = useState<number[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [enviados, setEnviados] = useState<ComunicadoEnviado[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [submitted, setSubmitted] = useState(false);
  
  const cargar = useCallback(async () => {
    if (!token) return;
    try {
      const [e, u] = await Promise.all([comunicadosEnviados(token), listarUsuarios(token)]);
      setEnviados(e);
      setUsuarios(u.filter((x) => x.perfil.nombre === "Alumno" || x.perfil.nombre === "Profesor"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los comunicados");
    } finally {
      setCargando(false);
    }
  }, [token]);
  
  useEffect(() => {
    cargar();
  }, [cargar]);
  
  const limpiar = () => {
    setTitulo("");
    setMensaje("");
    setCursoIds([]);
    setUsuarioIds([]);
    setEditandoId(null);
    setSubmitted(false);
  };
  
  const empezarEdicion = (c: ComunicadoEnviado) => {
    setEditandoId(c.id);
    setTitulo(soloTexto(c.titulo));
    setMensaje(soloTextoMultilinea(c.mensaje));
    setSubmitted(false);
    setError("");
    setOk("");
  };
  
  const cancelarEdicion = () => {
    limpiar();
    setError("");
  };
  
  const enviar = async () => {
    setSubmitted(true);
    if (validar.tituloComunicado(titulo) || validar.mensajeComunicado(mensaje)) return;
    if (!token) return;
    try {
      setEnviando(true);
      setError("");
      setOk("");
      if (editandoId !== null) {
        await editarComunicado(token, { id: editandoId, titulo, mensaje });
        setOk("Comunicado actualizado");
      } else {
        await enviarComunicado(token, { titulo, mensaje, alcance, cursoIds, usuarioIds });
        setOk("Comunicado enviado");
      }
      limpiar();
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el comunicado");
    } finally {
      setEnviando(false);
    }
  };
  
  const editando = editandoId !== null;
  const q = busqueda.trim().toLowerCase();
  
  const coincidencias = !editando && alcance === "usuario" && q.length >= 2
    ? usuarios.filter((u) => u.nombre.toLowerCase().includes(q)).slice(0, 8) : [];
  
  return (
    <>
      <Tarjeta>
        <Texto size={20} bold>{editando ? "Editar comunicado" : "Nuevo comunicado"}</Texto>
        <Input label="Título" value={titulo} onChangeText={(v) => setTitulo(soloTexto(v))} maxLength={120}
          autoCapitalize="sentences" validate={validar.tituloComunicado} submitted={submitted} />
        <Input label="Mensaje" value={mensaje} onChangeText={(v) => setMensaje(soloTextoMultilinea(v))} multiline
          numberOfLines={4} maxLength={2000} autoCapitalize="sentences"
          validate={validar.mensajeComunicado} submitted={submitted} />
        {editando ? (
          <Texto size={14} color="muted">
            Los destinatarios no se pueden modificar. Al guardar, el comunicado mostrará la fecha de edición.
          </Texto>
        ) : (
          <>
            <Texto size={14} bold>Destinatarios</Texto>
            <Chips opciones={ALCANCES} valor={alcance} onChange={setAlcance} />
            {alcance === "global" && <Texto size={14} color="muted">Lo reciben todos los alumnos y profesores.</Texto>}
            {alcance === "curso" && (
              <>
                <Texto size={14} color="muted">Lo reciben los alumnos del curso y los profesores que dictan en él.</Texto>
                {cursos.map((c) => (
                  <FilaItem key={c.id} titulo={cursoLabel(c.anio, c.division)}
                    derecha={<Texto bold color="success">{cursoIds.includes(c.id) ? "✓" : ""}</Texto>}
                    onPress={() => setCursoIds(alternar(cursoIds, c.id))} />
                ))}
              </>
            )}
            {alcance === "usuario" && (
              <>
                <Texto size={14} color="muted">{usuarioIds.length} seleccionados</Texto>
                <Input label="Buscar por nombre (2 letras)" value={busqueda} onChangeText={setBusqueda} />
                {coincidencias.map((u) => (
                  <FilaItem key={u.id} titulo={u.nombre} subtitulo={u.perfil.nombre}
                    derecha={<Texto bold color="success">{usuarioIds.includes(u.id) ? "✓" : ""}</Texto>}
                    onPress={() => setUsuarioIds(alternar(usuarioIds, u.id))} />
                ))}
              </>
            )}
          </>
        )}
        {!!error && <Texto size={14} color="error">{error}</Texto>}
        {!!ok && <Texto size={14} color="success">{ok}</Texto>}
        <Button title={editando ? "Guardar cambios" : "Enviar comunicado"} onPress={enviar} loading={enviando} />
        {editando && <Button variant="link" title="Cancelar edición" onPress={cancelarEdicion} />}
      </Tarjeta>
      <Tarjeta>
        <Texto size={20} bold>Enviados</Texto>
        {cargando ? (
          <ActivityIndicator />
        ) : enviados.length === 0 ? (
          <Texto color="muted">Todavía no enviaste comunicados.</Texto>
        ) : (
          enviados.map((c) => (
            <FilaAcciones
              key={c.id}
              titulo={c.titulo}
              subtitulo={`${c.fecha} · ${c.alcance === "global" ? "todos" : c.alcance === "curso" ? `${c.destinos} cursos` : `${c.destinos} personas`} · leído por ${c.lecturas}${c.editado ? ` · editado el ${c.editado}` : ""}`}
              onEditar={() => empezarEdicion(c)}
              onEliminar={async () => {
                if (!token) return;
                await eliminarComunicado(token, c.id);
                if (editandoId === c.id) limpiar();
                await cargar();
              }}
            />
          ))
        )}
      </Tarjeta>
    </>
  );
}