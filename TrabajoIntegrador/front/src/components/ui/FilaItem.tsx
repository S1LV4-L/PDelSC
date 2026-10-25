import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { spacing, useTheme } from "../../constants/theme";
import { useResponsive } from "../../hooks/useResponsive";

type Props = {
  titulo: string;
  subtitulo?: string;
  derecha?: ReactNode;
  onPress?: () => void;
};

export default function FilaItem({
  titulo,
  subtitulo,
  derecha,
  onPress,
}: Props) {
  const theme = useTheme();
  const { fs } = useResponsive();

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.fila,
        {
          borderColor: theme.border,
          backgroundColor: pressed ? theme.background : theme.surface,
        },
      ]}
    >
      <View style={styles.datos}>
        <Text style={{ color: theme.text, fontSize: fs(16), fontWeight: "700" }}>
          {titulo}
        </Text>
        {!!subtitulo && (
          <Text style={{ color: theme.muted, fontSize: fs(14) }}>
            {subtitulo}
          </Text>
        )}
      </View>
      {derecha}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
  },
  datos: {
    flex: 1,
    gap: spacing.xs,
  },
});