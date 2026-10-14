import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import Seccion from '../../components/Seccion';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function BasicosScreen() {
  const colors = useThemeColors();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.header, { color: colors.text }]}>Básicos</Text>

      <Seccion titulo="View" desc="Contenedor base para layout, equivalente a un div.">
        <View style={styles.caja} />
      </Seccion>

      <Seccion titulo="Text" desc="Muestra texto. Todo texto debe ir dentro de un Text.">
        <Text style={[styles.ejemploTexto, { color: colors.text }]}>Hola mundo</Text>
      </Seccion>

      <Seccion titulo="Image" desc="Muestra imágenes locales o remotas.">
        <Image
          source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}
          style={styles.imagen}
        />
      </Seccion>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingTop: 60, paddingBottom: 40, gap: 20 },
  header: { fontSize: 26, fontWeight: '700', marginBottom: 8 },
  caja: { width: 60, height: 60, backgroundColor: '#7c5cff', borderRadius: 8 },
  ejemploTexto: { fontSize: 16 },
  imagen: { width: 40, height: 40 },
});