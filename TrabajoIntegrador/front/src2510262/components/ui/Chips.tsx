import { Pressable, StyleSheet, Text, View } from "react-native";
import { spacing, useTheme } from "../../constants/theme";
import { useResponsive } from "../../hooks/useResponsive";

type Opcion<T> = {
  valor: T;
  label: string;
};

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
      {opciones.map((opcion) => {
        const activo = opcion.valor === valor;

        return (
          <Pressable
            key={String(opcion.valor)}
            disabled={deshabilitado}
            onPress={() => onChange(opcion.valor)}
            style={[
              styles.chip,
              {
                borderColor: activo ? theme.primary : theme.border,
                backgroundColor: activo ? theme.primary : theme.surface,
                opacity: deshabilitado && !activo ? 0.45 : 1,
              },
            ]}
          >
            <Text
              style={{
                color: activo ? "#FFFFFF" : theme.text,
                fontSize: fs(14),
                fontWeight: "600",
              }}
            >
              {opcion.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    minHeight: 38,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
  },
});