import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AuthLayout from "../../components/AuthLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { Proveedor } from "../../services/authService";
import { iniciarOAuth } from "../../services/oauthService";
import { validar } from "../../utils/validaciones";

const PROVEEDORES: { id: Proveedor; label: string }[] = [
  { id: "google", label: "Google" },
  { id: "github", label: "GitHub" },
  { id: "jira", label: "Jira" },
];

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { error } = useLocalSearchParams<{ error?: string }>();
  const { signIn, signInWithToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const mensajeError =
    formError || (error === "oauth" ? "No se pudo iniciar sesión con el proveedor" : "");

  const handleLogin = async () => {
    setSubmitted(true);
    setFormError("");
    if (validar.email(email) || validar.passwordLogin(password)) return;

    try {
      setLoading(true);
      await signIn(email.trim(), password);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (proveedor: Proveedor) => {
    setFormError("");
    try {
      const token = await iniciarOAuth(proveedor);
      if (token) await signInWithToken(token);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Error al iniciar sesión");
    }
  };

  return (
    <AuthLayout title="Iniciar sesión" subtitle="Ingresa tus datos para continuar">
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholder="tu@email.com"
        validate={validar.email}
        submitted={submitted}
      />
      <Input
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="********"
        validate={validar.passwordLogin}
        submitted={submitted}
        onSubmitEditing={handleLogin}
      />

      <View style={styles.forgot}>
        <Button variant="link" title="¿Olvidaste tu contraseña?" onPress={() => router.push("/forgot-password")} />
      </View>

      {!!mensajeError && <Text style={[styles.formError, { color: theme.error }]}>{mensajeError}</Text>}

      <Button title="Ingresar" onPress={handleLogin} loading={loading} />

      <View style={styles.separadorContainer}>
        <View style={[styles.line, { backgroundColor: theme.border }]} />
        <Text style={[styles.separador, { color: theme.muted }]}>o continúa con</Text>
        <View style={[styles.line, { backgroundColor: theme.border }]} />
      </View>
      
      <View style={styles.oauth}>
        {PROVEEDORES.map((p) => (
          <View key={p.id} style={styles.oauthItem}>
            <Button variant="outline" title={p.label} onPress={() => handleOAuth(p.id)} />
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.muted }]}>¿No tienes cuenta?</Text>
        <Button variant="link" title="Regístrate" onPress={() => router.push("/register")} />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  forgot: { alignItems: "flex-end", marginBottom: 16 },
  formError: { marginBottom: 12, textAlign: "center", fontSize: 14 },
  separadorContainer: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  line: { flex: 1, height: 1 },
  separador: { marginHorizontal: 12, fontSize: 13, fontWeight: "500" },
  oauth: { flexDirection: "row", gap: 8 },
  oauthItem: { flex: 1 },
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 24 },
  footerText: { fontSize: 14 },
});