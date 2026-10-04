import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import AuthLayout from "../../components/AuthLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useTheme } from "../../constants/theme";
import { register } from "../../services/authService";
import { validar } from "../../utils/validaciones";
import RecoveryCodes from "../../components/CodigosRecuperacion";

export default function RegisterScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [codigos, setCodigos] = useState<string[] | null>(null);

  const handleRegister = async () => {
    setSubmitted(true);
    setFormError("");

    const hayErrores = [
      validar.nombre(name),
      validar.email(email),
      validar.password(password),
      validar.coincide(password)(confirm),
    ].some(Boolean);
    if (hayErrores) return;

    try {
      setLoading(true);
      const res = await register(name.trim(), email.trim(), password);
      setCodigos(res.codigosRecuperacion);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  if (codigos) {
    return (
      <AuthLayout title="Guarda tus códigos" subtitle="Los necesitarás si olvidas tu contraseña">
        <RecoveryCodes codigos={codigos} onContinue={() => router.replace("/")} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Crear cuenta" subtitle="Completa tus datos para registrarte">
      <Input
        label="Nombre"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        placeholder="Tu nombre"
        validate={validar.nombre}
        submitted={submitted}
      />
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
        placeholder="Ingresa una contraseña"
        validate={validar.password}
        submitted={submitted}
      />
      <Input
        label="Confirmar contraseña"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        placeholder="Repite la contraseña"
        validate={validar.coincide(password)}
        submitted={submitted}
        onSubmitEditing={handleRegister}
      />

      {!!formError && <Text style={[styles.formError, { color: theme.error }]}>{formError}</Text>}

      <Button title="Registrarme" onPress={handleRegister} loading={loading} />

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.muted }]}>¿Ya tenes cuenta?</Text>
        <Button variant="link" title="Inicia sesión" onPress={() => router.replace("/")} />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  formError: { marginBottom: 12, textAlign: "center", fontSize: 14 },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
  },
  footerText: { fontSize: 14 },
});