import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../constants/theme";
import { useResponsive } from "../../hooks/useResponsive";

type Opcion<T> = { valor: T; label: string };

type Props<T> = {
  opciones: Opcion<T>[];
  valor: T | null;
  onChange: (valor: T) => void;
  deshabilitado?: boolean;
};

export default function Chips<T extends string | number>({
  opciones,
  valor,
  onChange,
  deshabilitado = false,
}: Props<T>) {
  const theme = useTheme();
  const { fs } = useResponsive();

  return (
    <View style={styles.chips}>
      {opciones.map((o) => {
        const activo = o.valor === valor;
        return (
          <Pressable
            key={String(o.valor)}
            disabled={deshabilitado}
            onPress={() => onChange(o.valor)}
            style={[
              styles.chip,
              {
                borderColor: activo ? theme.primary : theme.border,
                backgroundColor: activo ? theme.primary : theme.surface,
                opacity: deshabilitado && !activo ? 0.4 : 1,
              },
            ]}
          >
            <Text style={{ color: activo ? "#fff" : theme.text, fontSize: fs(14), fontWeight: "600" }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1 },
});