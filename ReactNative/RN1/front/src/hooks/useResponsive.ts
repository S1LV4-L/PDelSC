import { useWindowDimensions } from "react-native";
import { breakpoints } from "../constants/theme";

export function useResponsive() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= breakpoints.desktop;

  const fs = (size: number) => (isDesktop ? Math.round(size * 1.25) : size);

  return { width, isTablet: width >= breakpoints.tablet, isDesktop, fs };
}