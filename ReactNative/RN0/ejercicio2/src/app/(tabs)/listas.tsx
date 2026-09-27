import { Text, FlatList, ScrollView, StyleSheet } from 'react-native';
import Seccion from '../../components/Seccion';
import { useThemeColors } from '../../hooks/useThemeColors';

const datos = [
  { id: '1', nombre: 'Manzana' },
  { id: '2', nombre: 'Banana' },
  { id: '3', nombre: 'Cereza' },
];

export default function ListasScreen() {
  const colors = useThemeColors();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.header, { color: colors.text }]}>Listas</Text>

      <Seccion titulo="FlatList" desc="Renderiza listas grandes de forma optimizada.">
        <FlatList
          data={datos}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Text style={[styles.item, { color: colors.text }]}>{item.nombre}</Text>
          )}
        />
      </Seccion>

      <Seccion titulo="ScrollView" desc="Contenedor con scroll para contenido que no entra en pantalla.">
        <Text style={[styles.item, { color: colors.text }]}>
          Este texto está dentro de un ScrollView
        </Text>
      </Seccion>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingTop: 60, paddingBottom: 40, gap: 20 },
  header: { fontSize: 26, fontWeight: '700', marginBottom: 8 },
  item: { fontSize: 15, paddingVertical: 4 },
});