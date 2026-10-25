import { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../constants/theme";
import { useResponsive } from "../hooks/useResponsive";
import { ThemeToggle } from "./BotonTema";
import Button from "./ui/Button";

type Props = { children: ReactNode; volver?: boolean };

export default function Pantalla({ children, volver = false }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const { isDesktop } = useResponsive();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ThemeToggle />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.inner, { maxWidth: isDesktop ? 1100 : 560 }]}>
          {volver && (
            <Button
              variant="link"
              title="← Volver"
              style={styles.volver}
              onPress={() => router.back()}
            />
          )}
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flexGrow: 1, alignItems: "center", padding: 12 },
  inner: { width: "100%", gap: 20 },
  volver: { alignSelf: "flex-start" },
});