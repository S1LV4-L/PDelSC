import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useThemeMode } from "../constants/theme";
import { useResponsive } from "../hooks/useResponsive";

export function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeMode();
  const colors = useTheme();
  const { isDesktop } = useResponsive();

  return (
    <Pressable
      onPress={toggleTheme}
      style={({ pressed }) => [
        styles.button,
        isDesktop ? styles.desktopPosition : styles.mobilePosition,
        {
          backgroundColor: colors.surface,
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
        color={colors.text}
      />
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
  desktopPosition: {
    left: 16,
    bottom: 16,
  },
  mobilePosition: {
    top: 12,
    right: 12,
  },
});