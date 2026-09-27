import { View, Text, StyleSheet } from 'react-native';

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.badge}>CARD</Text>
        <Text style={styles.title}>Estilos</Text>
        <Text style={styles.subtitle}>Pestaña con estilo visual diferente</Text>
        <View style={styles.divider} />
        <Text style={styles.footer}>Ejemplo</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e2f',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#2a2a40',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  badge: {
    backgroundColor: '#7c5cff',
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#f5f5f5',
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0c0',
    marginTop: 8,
    textAlign: 'center',
  },
  divider: {
    width: '60%',
    height: 1,
    backgroundColor: '#3f3f5c',
    marginVertical: 16,
  },
  footer: {
    fontSize: 13,
    color: '#7c5cff',
    fontWeight: '500',
  },
});