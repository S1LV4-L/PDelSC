import { useState } from 'react';
import { Text, Button, Modal, View, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import Seccion from '../../components/Seccion';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function FeedbackScreen() {
  const colors = useThemeColors();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.header, { color: colors.text }]}>Feedback</Text>

      <Seccion titulo="ActivityIndicator" desc="Indicador de carga (spinner).">
        <ActivityIndicator size="large" color="#7c5cff" />
      </Seccion>

      <Seccion titulo="Modal" desc="Ventana superpuesta sobre el contenido actual.">
        <Button title="Abrir modal" onPress={() => setModalVisible(true)} />
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalFondo}>
            <View style={[styles.modalCaja, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTexto, { color: colors.text }]}>Este es un Modal</Text>
              <Button title="Cerrar" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </Modal>
      </Seccion>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingTop: 60, paddingBottom: 40, gap: 20 },
  header: { fontSize: 26, fontWeight: '700', marginBottom: 8 },
  modalFondo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCaja: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  modalTexto: { fontSize: 16, fontWeight: '600' },
});