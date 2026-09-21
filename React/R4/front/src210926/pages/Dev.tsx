import { useNavigate } from "react-router-dom";
import "../styles/Dev.css";
import { ThemeToggle } from "../components/BotonTema";
import { BotonScrollTop } from "../components/BotonScrollTop";
import { Campo, CampoIcono, CampoImagen } from "../components/CamposDev";
import { usePortfolio } from "../context/PortfolioContext";
import { useDevEditor } from "../hooks/useDevEditor";

function DevEditor() {
  const navigate = useNavigate();
  const {
    draft,
    estado,
    hayCambios,
    setNombre,
    setIcono,
    setSobreMi,
    agregarCategoria,
    editarCategoria,
    quitarCategoria,
    agregarSkill,
    editarSkill,
    quitarSkill,
    agregarProyecto,
    editarProyecto,
    quitarProyecto,
    setEmail,
    agregarEnlace,
    editarEnlace,
    quitarEnlace,
    handleGuardar,
    handleDescartar,
  } = useDevEditor();

  return (
    <div>
      <ThemeToggle />
      <div className="dev-modificar">
        <h1>Modificar contenido del Portfolio</h1>
        <button className="btn-link" onClick={() => navigate(-1)}>
          Volver
        </button>

        <section className="dev-seccion">
          <h2>General</h2>
          <CampoIcono etiqueta="Icono del header (SVG, opcional)" valor={draft.icono} onChange={setIcono} />
          <Campo etiqueta="Nombre (header, opcional)" valor={draft.nombre} onChange={setNombre} />
        </section>

        <section className="dev-seccion">
          <h2>Sobre mi</h2>
          <Campo
            etiqueta="Titulo"
            valor={draft.sobreMi.titulo}
            onChange={(v) => setSobreMi("titulo", v)}
          />
          <Campo
            etiqueta="Subtitulo"
            valor={draft.sobreMi.subtitulo}
            onChange={(v) => setSobreMi("subtitulo", v)}
          />
          <Campo
            etiqueta="Descripcion"
            valor={draft.sobreMi.descripcion}
            onChange={(v) => setSobreMi("descripcion", v)}
            multilinea
          />
        </section>

        <section className="dev-seccion">
          <h2>Skills</h2>
          {draft.categorias.map((cat) => (
            <div className="dev-item" key={cat.id}>
              <Campo
                etiqueta="Titulo de la categoria"
                valor={cat.titulo}
                onChange={(v) => editarCategoria(cat.id, { titulo: v })}
              />
              <CampoIcono
                etiqueta="Icono (SVG)"
                valor={cat.icono}
                onChange={(v) => editarCategoria(cat.id, { icono: v })}
              />

              <div className="dev-sublista">
                {cat.skills.map((skill) => (
                  <div className="dev-fila" key={skill.id}>
                    <Campo
                      etiqueta="Skill"
                      valor={skill.nombre}
                      onChange={(v) => editarSkill(cat.id, skill.id, { nombre: v })}
                    />
                    <CampoIcono
                      etiqueta="Icono (SVG)"
                      valor={skill.icono}
                      onChange={(v) => editarSkill(cat.id, skill.id, { icono: v })}
                    />
                    <button className="btn-peligro" onClick={() => quitarSkill(cat.id, skill.id)}>
                      Quitar
                    </button>
                  </div>
                ))}
              </div>

              <div className="dev-acciones">
                <button className="btn-link" onClick={() => agregarSkill(cat.id)}>
                  + Skill
                </button>
                <button className="btn-peligro" onClick={() => quitarCategoria(cat.id)}>
                  Eliminar categoria
                </button>
              </div>
            </div>
          ))}
          <div className="dev-acciones">
            <button className="btn-link" onClick={agregarCategoria}>
              + Categoria
            </button>
          </div>
        </section>

        <section className="dev-seccion">
          <h2>Proyectos</h2>
          {draft.proyectos.map((p) => (
            <div className="dev-item" key={p.id}>
              <CampoImagen
                etiqueta="Imagen"
                valor={p.imagen}
                onChange={(v) => editarProyecto(p.id, { imagen: v })}
              />
              <Campo
                etiqueta="Enlace"
                valor={p.enlace}
                onChange={(v) => editarProyecto(p.id, { enlace: v })}
              />
              <div className="dev-acciones">
                <button className="btn-peligro" onClick={() => quitarProyecto(p.id)}>
                  Eliminar proyecto
                </button>
              </div>
            </div>
          ))}
          <div className="dev-acciones">
            <button className="btn-link" onClick={agregarProyecto}>
              + Proyecto
            </button>
          </div>
        </section>

        <section className="dev-seccion">
          <h2>Contacto</h2>
          <Campo etiqueta="Email" valor={draft.contacto.email} onChange={setEmail} />

          <div className="dev-sublista">
            {draft.contacto.enlaces.map((e) => (
              <div className="dev-fila" key={e.id}>
                <Campo
                  etiqueta="Texto"
                  valor={e.texto}
                  onChange={(v) => editarEnlace(e.id, { texto: v })}
                />
                <Campo
                  etiqueta="URL"
                  valor={e.url}
                  onChange={(v) => editarEnlace(e.id, { url: v })}
                />
                <button className="btn-peligro" onClick={() => quitarEnlace(e.id)}>
                  Quitar
                </button>
              </div>
            ))}
          </div>
          <div className="dev-acciones">
            <button className="btn-link" onClick={agregarEnlace}>
              + Enlace
            </button>
          </div>
        </section>

        <div className="dev-barra">
          <span className={estado === "error" ? "dev-estado dev-estado-error" : "dev-estado"}>
            {estado === "error"
              ? "Error al guardar"
              : hayCambios
                ? "Cambios sin guardar"
                : estado === "guardado"
                  ? "Guardado"
                  : ""}
          </span>
          <div className="dev-acciones">
            <button className="btn-link" onClick={handleDescartar} disabled={!hayCambios}>
              Descartar
            </button>
            <button onClick={handleGuardar} disabled={!hayCambios}>
              Guardar
            </button>
          </div>
        </div>
      </div>
      <BotonScrollTop />
    </div>
  );
}

export default function Dev() {
  const { cargando } = usePortfolio();
  return cargando ? <p>Cargando...</p> : <DevEditor />;
}