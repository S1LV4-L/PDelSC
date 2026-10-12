import { useColorScheme } from "react-native";

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

const lightTheme: ThemeColors = {
  primary: "#676991", // Indigo 500
  primaryDark: "#3f3f69", // Indigo 600
  background: "#e2e2e2", // Gray 50
  surface: "#FFFFFF",
  text: "#111827", // Gray 900
  muted: "#6B7280", // Gray 500
  border: "#E5E7EB", // Gray 200
  error: "#EF4444", // Red 500
  success: "#22C55E", // Green 500
  cardShadow: "rgba(0, 0, 0, 0.06)",
};

const darkTheme: ThemeColors = {
  primary: "#6b6d91", // Indigo 400
  primaryDark: "#11111a", // Indigo 500
  background: "#0F172A", // Slate 900
  surface: "#1E293B", // Slate 800
  text: "#F1F5F9", // Slate 100
  muted: "#94A3B8", // Slate 400
  border: "#334155", // Slate 700
  error: "#F87171", // Red 400
  success: "#4ADE80", // Green 400
  cardShadow: "transparent", // En dark mode usamos bordes, no sombras
};

export const useTheme = (): ThemeColors => {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkTheme : lightTheme;
};