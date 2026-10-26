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

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export type ThemeColors = {
  primary: string;
  primaryDark: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  cardShadow: string;
};

export const lightTheme: ThemeColors = {
  primary: "#4056A1",
  primaryDark: "#30427F",
  accent: "#D79922",
  background: "#F0EFEB",
  surface: "#ddddd6",
  text: "#292A2D",
  muted: "#6F7075",
  border: "#C5CBE3",
  error: "#D93624",
  success: "#55734A",
  warning: "#9A6B13",
  cardShadow: "rgba(35, 38, 48, 0.12)",
};

export const darkTheme: ThemeColors = {
  primary: "#8E9ED6",
  primaryDark: "#050005",
  accent: "#D79922",
  background: "#12151D",
  surface: "#090B10",
  text: "#EFE2BA",
  muted: "#A5A9B6",
  border: "#292E3B",
  error: "#FF624B",
  success: "#8EAA7C",
  warning: "#E4B94F",
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