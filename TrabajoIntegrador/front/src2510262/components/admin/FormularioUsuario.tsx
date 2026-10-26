import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../constants/theme";
import { useResponsive } from "../../hooks/useResponsive";
import { validar } from "../../utils/validaciones";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { DatosForm, FormProps } from "./usuariosTypes";

export default function FormularioUsuario({
  usuario,
  perfiles,
  bloquearPerfil,
  loading,
  error,
  onGuardar,
  onCancelar,
}: FormProps) {
  const theme = useTheme();
  const { fs } = useResponsive();
  const editando = !!usuario;

  const [nombre, setNombre] = useState(usuario?.nombre ?? "");
  const [email, setEmail] = useState(usuario?.email ?? "");
  const [password, setPassword] = useState("");
  const [perfilId, setPerfilId] = useState<number | null>(
    usuario?.perfil.id ??
      perfiles.find((p) => p.nombre === "Alumno")?.id ??
      perfiles[0]?.id ??
      null
  );
  const [submitted, setSubmitted] = useState(false);

  // Al editar, el email puede quedar vacío (usuarios que entraron por OAuth no tienen)
  const puedeQuedarSinEmail = editando && !usuario?.email;
  const validarEmailForm = (valor: string) =>
    puedeQuedarSinEmail && valor.trim() === "" ? null : validar.email(valor);

  const enviar = () => {
    setSubmitted(true);
    const hayErrores = [
      validar.nombre(nombre),
      validarEmailForm(email),
      editando ? null : validar.password(password),
    ].some(Boolean);
    if (hayErrores || perfilId === null) return;
    onGuardar({
      nombre: nombre.trim(),
      email: email.trim(),
      password: editando ? undefined : password,
      perfilId,
    } as DatosForm);
  };

  return (
    <View style={styles.bloque}>
      <Text style={[styles.titulo, { color: theme.text, fontSize: fs(20) }]}>
        {editando ? "Editar usuario" : "Nuevo usuario"}
      </Text>

      <Input
        label="Nombre de usuario"
        value={nombre}
        onChangeText={setNombre}
        validate={validar.nombre}
        submitted={submitted}
      />

      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholder="usuario@email.com"
        validate={validarEmailForm}
        submitted={submitted}
      />

      {!editando && (
        <Input
          label="Contraseña inicial"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Mínimo 8 caracteres"
          validate={validar.password}
          submitted={submitted}
        />
      )}

      <View>
        <Text style={[styles.label, { color: theme.text, fontSize: fs(14) }]}>Perfil</Text>
        {perfiles.length === 0 ? (
          <Text style={{ color: theme.error, fontSize: fs(14) }}>
            No se pudieron cargar los perfiles
          </Text>
        ) : (
          <View style={styles.chips}>
            {perfiles.map((p) => {
              const activo = p.id === perfilId;
              return (
                <Pressable
                  key={p.id}
                  disabled={bloquearPerfil}
                  onPress={() => setPerfilId(p.id)}
                  style={[
                    styles.chip,
                    {
                      borderColor: activo ? theme.primary : theme.border,
                      backgroundColor: activo ? theme.primary : theme.surface,
                      opacity: bloquearPerfil && !activo ? 0.4 : 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: activo ? "#fff" : theme.text,
                      fontSize: fs(14),
                      fontWeight: "600",
                    }}
                  >
                    {p.nombre}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
        {bloquearPerfil && (
          <Text style={{ color: theme.muted, fontSize: fs(13), marginTop: 6 }}>
            No puedes cambiar tu propio perfil.
          </Text>
        )}
      </View>

      {!!error && <Text style={{ color: theme.error, fontSize: fs(14) }}>{error}</Text>}

      <View style={styles.botonesForm}>
        <Button
          title={editando ? "Guardar cambios" : "Crear usuario"}
          onPress={enviar}
          loading={loading}
        />
        <Button variant="link" title="Cancelar" onPress={onCancelar} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bloque: { gap: 14 },
  titulo: { fontWeight: "800", letterSpacing: -0.3 },
  label: { fontWeight: "600", marginBottom: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1 },
  botonesForm: { gap: 8, alignItems: "stretch" },
});