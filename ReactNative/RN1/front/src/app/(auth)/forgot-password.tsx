import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import AuthLayout from "../../components/AuthLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useTheme } from "../../constants/theme";
import { resetPassword } from "../../services/authService";
import { validar } from "../../utils/validaciones";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [restantes, setRestantes] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setSubmitted(true);
    setFormError("");

    const hayErrores = [
      validar.email(email),
      validar.codigoRecuperacion(codigo),
      validar.password(password),
      validar.coincide(password)(confirm),
    ].some(Boolean);
    if (hayErrores) return;

    try {
      setLoading(true);
      const res = await resetPassword(email.trim(), codigo.trim(), password);
      setRestantes(res.codigosRestantes);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Error al restablecer la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Usa uno de tus códigos de recuperación para crear una contraseña nueva"
    >
      {restantes !== null ? (
        <>
          <Text style={[styles.success, { color: theme.success }]}>
            Contraseña actualizada. Te quedan {restantes}{" "}
            {restantes === 1 ? "código" : "códigos"} de recuperación.
            {restantes <= 2 ? " Genera un set nuevo desde tu cuenta cuando inicies sesión." : ""}
          </Text>
          <View style={styles.footer}>
            <Button title="Ir a iniciar sesión" onPress={() => router.replace("/")} />
          </View>
        </>
      ) : (
        <>
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
            label="Código de recuperación"
            value={codigo}
            onChangeText={setCodigo}
            autoCapitalize="characters"
            maxLength={11}
            placeholder="ABCDE-FGHJK"
            validate={validar.codigoRecuperacion}
            submitted={submitted}
          />
          <Input
            label="Nueva contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Mínimo 8 caracteres"
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
            onSubmitEditing={handleSubmit}
          />

          {!!formError && <Text style={[styles.formError, { color: theme.error }]}>{formError}</Text>}

          <Button title="Restablecer contraseña" onPress={handleSubmit} loading={loading} />

          <View style={styles.footer}>
            <Button variant="link" title="Volver a iniciar sesión" onPress={() => router.replace("/")} />
          </View>
        </>
      )}
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  success: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  formError: { marginBottom: 12, textAlign: "center", fontSize: 14 },
  footer: { alignItems: "center", marginTop: 20 },
});