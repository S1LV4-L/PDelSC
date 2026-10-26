import { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../constants/theme";
import { useResponsive } from "../../hooks/useResponsive";
import { ThemeToggle } from "../ui/BotonTema";
import { BotonScrollTop, useScrollTop } from "../ui/BotonScrollTop";
import Button from "../ui/Button";

type Props = { children: ReactNode; volver?: boolean };

export default function Pantalla({ children, volver = false }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const { ref, onScroll, scrollEventThrottle, visible, volverArriba } = useScrollTop();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      {/* En desktop el tema vive en la barra lateral */}
      {!isDesktop && <ThemeToggle />}
      <ScrollView
        ref={ref}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={styles.content}
      >
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
      <BotonScrollTop visible={visible} onPress={volverArriba} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flexGrow: 1, alignItems: "center", padding: 12 },
  inner: { width: "100%", gap: 20 },
  volver: { alignSelf: "flex-start" },
});