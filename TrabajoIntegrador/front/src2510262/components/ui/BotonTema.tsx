import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useThemeMode } from "../../constants/theme";
import { useResponsive } from "../../hooks/useResponsive";

// enBarra = true: fila dentro de la barra lateral (desktop). Si no, botón flotante (móvil)
export function ThemeToggle({ enBarra = false }: { enBarra?: boolean }) {
  const { isDark, toggleTheme } = useThemeMode();
  const colors = useTheme();
  const { fs } = useResponsive();

  if (enBarra) {
    return (
      <Pressable
        onPress={toggleTheme}
        style={({ pressed }) => [styles.fila, pressed && { backgroundColor: colors.background }]}
        accessibilityLabel="Cambiar tema"
        accessibilityRole="button"
        accessibilityState={{ checked: isDark }}
      >
        <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={22} color={colors.muted} />
        <Text numberOfLines={1} style={{ color: colors.muted, fontSize: fs(15), fontWeight: "500" }}>
          {isDark ? "Tema claro" : "Tema oscuro"}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={toggleTheme}
      style={({ pressed }) => [
        styles.button,
        styles.mobilePosition,
        {
          backgroundColor: colors.surface,
          transform: pressed ? [{ scale: 0.9 }] : [{ scale: 1 }],
        },
      ]}
      accessibilityLabel="Cambiar tema"
      accessibilityRole="button"
      accessibilityState={{ checked: isDark }}
    >
      <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={22} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    zIndex: 999,
  },
  mobilePosition: {
    top: 12,
    right: 12,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
});