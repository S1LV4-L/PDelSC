import { useState } from 'react';
import { Text, TextInput, Switch, Button, ScrollView, StyleSheet } from 'react-native';
import Seccion from '../../components/Seccion';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function FormulariosScreen() {
  const colors = useThemeColors();
  const [texto, setTexto] = useState('');
  const [activo, setActivo] = useState(false);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.header, { color: colors.text }]}>Formularios</Text>

      <Seccion titulo="TextInput" desc="Captura texto ingresado por el usuario.">
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.subtext }]}
          placeholder="Escribí algo..."
          placeholderTextColor={colors.subtext}
          value={texto}
          onChangeText={setTexto}
        />
        <Text style={[styles.output, { color: colors.text }]}>Valor: {texto}</Text>
      </Seccion>

      <Seccion titulo="Switch" desc="Selector on/off, útil para configuraciones.">
        <Switch value={activo} onValueChange={setActivo} />
      </Seccion>

      <Seccion titulo="Button" desc="Botón nativo con estilo del sistema operativo.">
        <Button title="Presionar" onPress={() => alert('Presionado')} />
      </Seccion>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingTop: 60, paddingBottom: 40, gap: 20 },
  header: { fontSize: 26, fontWeight: '700', marginBottom: 8 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
  },
  output: { marginTop: 8, fontSize: 14 },
});