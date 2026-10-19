import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useColorScheme, LayoutAnimation, Platform, UIManager } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Habilitar LayoutAnimation en Android (necesario para la transición suave)
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export const breakpoints = {
  tablet: 768,
  desktop: 900,
};

export type ThemeColors = {
  primary: string;
  primaryDark: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  error: string;
  success: string;
  cardShadow: string;
};

export const lightTheme: ThemeColors = {
  primary: "#676991",
  primaryDark: "#3f3f69",
  background: "#e2e2e2",
  surface: "#FFFFFF",
  text: "#111827",
  muted: "#6B7280",
  border: "#E5E7EB",
  error: "#EF4444",
  success: "#22C55E",
  cardShadow: "rgba(0, 0, 0, 0.06)",
};

export const darkTheme: ThemeColors = {
  primary: "#6b6d91",
  primaryDark: "#11111a",
  background: "#0F172A",
  surface: "#1E293B",
  text: "#F1F5F9",
  muted: "#94A3B8",
  border: "#334155",
  error: "#F87171",
  success: "#4ADE80",
  cardShadow: "transparent",
};

type ThemeMode = "light" | "dark";

interface IThemeContext {
  colors: ThemeColors;
  mode: ThemeMode;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<IThemeContext>({
  colors: lightTheme,
  mode: "light",
  toggleTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

// El Proveedor que maneja la lógica del estado y AsyncStorage
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>("light");
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Cargar tema al iniciar la app (AsyncStorage o sistema)
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = (await AsyncStorage.getItem("user-theme")) as ThemeMode | null;
        if (savedTheme) {
          setMode(savedTheme);
        } else {
          setMode(systemScheme === "dark" ? "dark" : "light");
        }
      } catch (e) {
        setMode(systemScheme === "dark" ? "dark" : "light");
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  // Guardar tema cada vez que cambie
  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem("user-theme", mode);
    }
  }, [mode, isLoaded]);

  // Función para alternar el tema con animación suave
  const toggleTheme = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const colors = mode === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ colors, mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeColors => {
  const context = useContext(ThemeContext);
  return context?.colors ?? lightTheme;
};

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  return {
    isDark: context?.mode === "dark",
    toggleTheme: context?.toggleTheme ?? (() => {}),
  };
};