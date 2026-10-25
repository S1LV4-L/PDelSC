import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useThemeMode } from "../constants/theme"; // Ajusta la ruta

export function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeMode();
  const colors = useTheme(); // Obtenemos tu paleta de colores

  return (
    <Pressable
      onPress={toggleTheme}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.surface,   // Fondo del botón (Blanco en light, Slate800 en dark)
          transform: pressed ? [{ scale: 0.9 }] : [{ scale: 1 }],
        },
      ]}
      accessibilityLabel="Cambiar tema"
      accessibilityRole="button"
      accessibilityState={{ checked: isDark }}
    >
      <Ionicons
        name={isDark ? "sunny-outline" : "moon-outline"}
        size={22}
        color={colors.text} // Color del icono (Gris900 en light, Slate100 en dark)
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5, // Sombra Android
    shadowColor: "#000", // Sombra iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    zIndex: 999,
  },
});