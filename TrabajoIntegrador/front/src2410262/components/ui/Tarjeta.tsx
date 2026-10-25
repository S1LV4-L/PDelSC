import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { useTheme } from "../../constants/theme";
import { useResponsive } from "../../hooks/useResponsive";

type Props = { children: ReactNode; style?: StyleProp<ViewStyle> };

export default function Tarjeta({ children, style }: Props) {
  const theme = useTheme();
  const { isDesktop } = useResponsive();

  return (
    <View
      style={[
        styles.card,
        isDesktop && styles.desktop,
        { backgroundColor: theme.surface, borderColor: theme.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  desktop: { padding: 24 },
});