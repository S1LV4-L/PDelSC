import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, useColorScheme } from "react-native";
import { useTheme } from "../constants/theme";
import { useResponsive } from "../hooks/useResponsive";

type Props = { title: string; subtitle?: string; children: ReactNode };

export default function AuthLayout({ title, subtitle, children }: Props) {
  const theme = useTheme();
  const scheme = useColorScheme();
  const { isDesktop } = useResponsive();
  const isDark = scheme === "dark";

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.root, { backgroundColor: theme.background }, isDesktop && styles.rootDesktop]}>
        {isDesktop && (
          <View style={[styles.brand, { backgroundColor: theme.primaryDark }]}>
            <Text style={styles.brandTitle}>RN1</Text>
            <Text style={styles.brandText}>Inicia sesión o registrate para continuar.</Text>
          </View>
        )}

        <ScrollView style={styles.flex} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={[
            styles.card, 
            { 
              backgroundColor: theme.surface,
              borderColor: isDark ? theme.border : 'transparent',
              shadowColor: isDark ? 'transparent' : theme.cardShadow,
            },
            isDesktop && styles.cardDesktop
          ]}>
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            {!!subtitle && <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text>}
            {children}
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1 },
  rootDesktop: { flexDirection: "row" },
  brand: { flex: 1, justifyContent: "center", padding: 64 },
  brandTitle: { color: "#fff", fontSize: 40, fontWeight: "800", marginBottom: 16, letterSpacing: -1 },
  brandText: { color: "#E0E7FF", fontSize: 18, maxWidth: 420, lineHeight: 26 },
  scroll: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    shadowOpacity: 1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  cardDesktop: { marginVertical: 0 },
  title: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: { fontSize: 14, marginTop: 4, marginBottom: 28, lineHeight: 20 },
});