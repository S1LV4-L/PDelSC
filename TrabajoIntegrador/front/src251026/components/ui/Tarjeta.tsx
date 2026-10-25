import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { spacing, useTheme } from "../../constants/theme";
import { useResponsive } from "../../hooks/useResponsive";

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function Tarjeta({ children, style }: Props) {
  const theme = useTheme();
  const { isDesktop } = useResponsive();

  return (
    <View
      style={[
        styles.card,
        isDesktop && styles.desktop,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          shadowColor: theme.cardShadow,
        },
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
    padding: spacing.xl,
    borderWidth: 1,
    gap: spacing.md,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  desktop: {
    padding: spacing.xl,
  },
});