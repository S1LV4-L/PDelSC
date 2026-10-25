import { ReactNode } from "react";
import { StyleProp, Text, TextStyle } from "react-native";
import { ThemeColors, useTheme } from "../../constants/theme";
import { useResponsive } from "../../hooks/useResponsive";

type Props = {
  children: ReactNode;
  size?: number;
  bold?: boolean;
  color?: keyof ThemeColors | string; // nombre del tema ("muted", "error"...) o un color
  style?: StyleProp<TextStyle>;
};

export default function Texto({ children, size = 15, bold = false, color = "text", style }: Props) {
  const theme = useTheme();
  const { fs } = useResponsive();
  const c = color in theme ? theme[color as keyof ThemeColors] : color;
  return <Text style={[{ color: c, fontSize: fs(size), fontWeight: bold ? "700" : "400" }, style]}>{children}</Text>;
}