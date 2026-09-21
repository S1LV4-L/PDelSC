interface IconoProps {
  src: string;
  className?: string;
  // Fuerza a pintar el SVG con el color del texto (sigue el tema claro/oscuro),
  // sin importar los colores que tenga el archivo
  monocromo?: boolean;
}

// SVG monocromo (usa currentColor) o forzado con `monocromo`: se pinta con el color
// del tema mediante máscara. Cualquier otro icono (URL o SVG con colores propios)
// va en un <img>.
export function Icono({ src, className = "", monocromo = false }: IconoProps) {
  const esSvg = src.startsWith("data:image/svg+xml");

  if (esSvg && (monocromo || src.includes("currentColor"))) {
    const url = `url("${src}")`;
    return (
      <span
        className={`${className} icono-mono`}
        style={{ maskImage: url, WebkitMaskImage: url }}
        aria-hidden="true"
      />
    );
  }

  return <img className={className} src={src} alt="" />;
}