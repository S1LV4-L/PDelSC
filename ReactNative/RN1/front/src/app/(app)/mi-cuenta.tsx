import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import RecoveryCodes from "../../components/CodigosRecuperacion";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { useResponsive } from "../../hooks/useResponsive";
import { actualizarCuenta, regenerarCodigos } from "../../services/authService";
import { validar } from "../../utils/validaciones";

function SeccionNombre() {
  const theme = useTheme();
  const { fs } = useResponsive();
  const { user, token, refreshUser } = useAuth();
  const [nombre, setNombre] = useState(user?.nombre ?? "");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  const guardar = async () => {
    setSubmitted(true);
    setError("");
    setOk("");
    if (!token || validar.nombre(nombre)) return;
    if (nombre.trim() === user?.nombre) return;

    try {
      setLoading(true);
      await actualizarCuenta(token, { nombre: nombre.trim() });
      await refreshUser();
      setOk("Nombre de usuario actualizado");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo actualizar el nombre");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.seccion}>
      <Text style={[styles.subtitulo, { color: theme.text, fontSize: fs(18) }]}>
        Nombre de usuario
      </Text>
      <Input
        label="Nombre"
        value={nombre}
        onChangeText={setNombre}
        validate={validar.nombre}
        submitted={submitted}
        error={error}
        onSubmitEditing={guardar}
      />
      {!!ok && <Text style={{ color: theme.success, fontSize: fs(14) }}>{ok}</Text>}
      <Button title="Guardar nombre" onPress={guardar} loading={loading} />
    </View>
  );
}

function SeccionPassword() {
  const theme = useTheme();
  const { fs } = useResponsive();
  const { token } = useAuth();
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);
  // Al cambiar la key se vuelven a montar los inputs (se limpian sus errores)
  const [formKey, setFormKey] = useState(0);

  const cambiar = async () => {
    setSubmitted(true);
    setError("");
    setOk("");

    const hayErrores = [
      validar.passwordLogin(actual),
      validar.password(nueva),
      validar.coincide(nueva)(confirm),
    ].some(Boolean);
    if (!token || hayErrores) return;

    try {
      setLoading(true);
      await actualizarCuenta(token, { password: nueva, passwordActual: actual });
      setActual("");
      setNueva("");
      setConfirm("");
      setSubmitted(false);
      setFormKey((k) => k + 1);
      setOk("Contraseña actualizada");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cambiar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.seccion}>
      <Text style={[styles.subtitulo, { color: theme.text, fontSize: fs(18) }]}>
        Cambiar contraseña
      </Text>
      <View key={formKey}>
        <Input
          label="Contraseña actual"
          value={actual}
          onChangeText={setActual}
          secureTextEntry
          placeholder="********"
          validate={validar.passwordLogin}
          submitted={submitted}
          error={error}
        />
        <Input
          label="Nueva contraseña"
          value={nueva}
          onChangeText={setNueva}
          secureTextEntry
          placeholder="Mínimo 8 caracteres"
          validate={validar.password}
          submitted={submitted}
        />
        <Input
          label="Confirmar nueva contraseña"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          placeholder="Repite la contraseña"
          validate={validar.coincide(nueva)}
          submitted={submitted}
          onSubmitEditing={cambiar}
        />
      </View>
      {!!ok && <Text style={{ color: theme.success, fontSize: fs(14) }}>{ok}</Text>}
      <Button title="Cambiar contraseña" onPress={cambiar} loading={loading} />
    </View>
  );
}

function SeccionCodigos() {
  const theme = useTheme();
  const { fs } = useResponsive();
  const { token } = useAuth();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [codigos, setCodigos] = useState<string[] | null>(null);

  const generar = async () => {
    setSubmitted(true);
    setError("");
    if (validar.passwordLogin(password) || !token) return;

    try {
      setLoading(true);
      const res = await regenerarCodigos(token, password);
      setCodigos(res.codigosRecuperacion);
      setPassword("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron generar los códigos");
    } finally {
      setLoading(false);
    }
  };

  const cerrar = () => {
    setCodigos(null);
    setMostrarForm(false);
    setSubmitted(false);
  };

  return (
    <View style={styles.seccion}>
      <Text style={[styles.subtitulo, { color: theme.text, fontSize: fs(18) }]}>
        Códigos de recuperación
      </Text>
      <Text style={{ color: theme.muted, fontSize: fs(15), lineHeight: fs(22) }}>
        Sirven para restablecer tu contraseña si la olvidas. Cada código se usa una sola vez.
      </Text>

      {codigos ? (
        <RecoveryCodes codigos={codigos} onContinue={cerrar} continueLabel="Listo" />
      ) : mostrarForm ? (
        <View>
          <Text style={{ color: theme.muted, fontSize: fs(15), lineHeight: fs(22), marginBottom: 12 }}>
            Los códigos anteriores dejarán de funcionar. Confirma tu contraseña para continuar.
          </Text>
          <Input
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="********"
            validate={validar.passwordLogin}
            submitted={submitted}
            error={error}
            onSubmitEditing={generar}
          />
          <Button title="Generar códigos nuevos" onPress={generar} loading={loading} />
          <View style={styles.cancelar}>
            <Button variant="link" title="Cancelar" onPress={cerrar} />
          </View>
        </View>
      ) : (
        <Button
          variant="outline"
          title="Generar códigos nuevos"
          onPress={() => setMostrarForm(true)}
        />
      )}
    </View>
  );
}

export default function MiCuentaScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { isDesktop, fs } = useResponsive();

  // Solo se oculta si el back confirma que la cuenta no tiene contraseña (OAuth)
  const tienePassword = user?.tienePassword !== false;

  const volver = () => (router.canGoBack() ? router.back() : router.replace("/home"));

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.scroll}
    >
      <View
        style={[
          styles.card,
          isDesktop && styles.cardDesktop,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <View style={styles.encabezado}>
          <Text style={[styles.titulo, { color: theme.text, fontSize: fs(26) }]}>Mi cuenta</Text>
          <Button variant="link" title="Volver" onPress={volver} />
        </View>

        <View style={[styles.columnas, isDesktop && styles.columnasDesktop]}>
          <View
            style={[
              styles.columna,
              isDesktop && styles.columnaDesktop,
              !tienePassword && styles.columnaSola,
            ]}
          >
            <SeccionNombre />
            {tienePassword ? (
              <SeccionPassword />
            ) : (
              <Text style={{ color: theme.muted, fontSize: fs(15), lineHeight: fs(22) }}>
                Iniciaste sesión con un proveedor externo, por eso tu cuenta no tiene contraseña
                ni códigos de recuperación.
              </Text>
            )}
          </View>

          {tienePassword && (
            <View style={[styles.columna, isDesktop && styles.columnaDesktop]}>
              <SeccionCodigos />
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  columnaSola: { maxWidth: 480 },
  scroll: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  card: {
    width: "100%",
    maxWidth: 480,
    borderRadius: 20,
    padding: 32,
    gap: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardDesktop: { width: "85%", maxWidth: "100%", padding: 40 },
  encabezado: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  titulo: { fontWeight: "800", letterSpacing: -0.5 },
  columnas: { gap: 24 },
  columnasDesktop: { flexDirection: "row", alignItems: "flex-start", gap: 48 },
  columna: { gap: 24 },
  columnaDesktop: { flex: 1 },
  seccion: { gap: 12 },
  subtitulo: { fontWeight: "700" },
  cancelar: { alignItems: "center", marginTop: 12 },
});