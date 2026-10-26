import Chips from "./Chips";

type Props = {
  opciones: { valor: number; label: string }[];
  valor: number | null;
  onChange: (valor: number | null) => void;
};

// Chips con la opción "Todos" (valor null)
export default function ChipsFiltro({ opciones, valor, onChange }: Props) {
  return (
    <Chips
      opciones={[{ valor: 0, label: "Todos" }, ...opciones]}
      valor={valor ?? 0}
      onChange={(v) => onChange(v === 0 ? null : v)}
    />
  );
}