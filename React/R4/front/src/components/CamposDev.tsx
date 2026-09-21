import { useState, type ChangeEvent } from "react";
import { Icono } from "./Icono";
import { svgADataUrl, imagenADataUrl } from "../utils/archivos";

interface CampoProps {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  multilinea?: boolean;
  placeholder?: string;
}

export function Campo({ etiqueta, valor, onChange, multilinea, placeholder }: CampoProps) {
  return (
    <label>
      {etiqueta}
      {multilinea ? (
        <textarea
          value={valor}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type="text"
          value={valor}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

interface CampoArchivoProps {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
}

// Selector de archivo .svg: se guarda como data URL en el mismo campo "icono"
export function CampoIcono({ etiqueta, valor, onChange }: CampoArchivoProps) {
  const [error, setError] = useState("");

  const handleArchivo = async (e: ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo
    if (!archivo) return;

    try {
      const dataUrl = await svgADataUrl(archivo);
      setError("");
      onChange(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo leer el archivo");
    }
  };

  return (
    <div className="dev-campo-icono">
      <label>
        {etiqueta}
        <input type="file" accept=".svg,image/svg+xml" onChange={handleArchivo} />
      </label>
      {valor && (
        <div className="dev-icono">
          <Icono src={valor} className="dev-icono-preview" />
          <button type="button" className="btn-peligro" onClick={() => onChange("")}>
            Quitar icono
          </button>
        </div>
      )}
      {error && <span className="dev-estado dev-estado-error">{error}</span>}
    </div>
  );
}

// Selector de imagen: se comprime a JPEG y se guarda como data URL en el campo "imagen"
export function CampoImagen({ etiqueta, valor, onChange }: CampoArchivoProps) {
  const [error, setError] = useState("");

  const handleArchivo = async (e: ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo
    if (!archivo) return;

    try {
      const dataUrl = await imagenADataUrl(archivo);
      setError("");
      onChange(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo procesar la imagen");
    }
  };

  return (
    <div className="dev-campo-imagen">
      <label>
        {etiqueta}
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleArchivo} />
      </label>
      {valor && (
        <div className="dev-imagen">
          <img className="dev-imagen-preview" src={valor} alt="" />
          <button type="button" className="btn-peligro" onClick={() => onChange("")}>
            Quitar imagen
          </button>
        </div>
      )}
      {error && <span className="dev-estado dev-estado-error">{error}</span>}
    </div>
  );
}