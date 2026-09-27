import { View, Text, StyleSheet } from 'react-native';
import { ReactNode } from 'react';
import { useThemeColors } from '../hooks/useThemeColors';

type SeccionProps = {
  titulo: string;
  desc: string;
  children: ReactNode;
};

export default function Seccion({ titulo, desc, children }: SeccionProps) {
  const colors = useThemeColors();

  return (
    <View style={[styles.seccion, { backgroundColor: colors.card }]}>
      <Text style={[styles.titulo, { color: colors.text }]}>{titulo}</Text>
      <Text style={[styles.desc, { color: colors.subtext }]}>{desc}</Text>
      <View style={styles.demo}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  seccion: { borderRadius: 12, padding: 16 },
  titulo: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  desc: { fontSize: 13, marginBottom: 12 },
  demo: { alignItems: 'center', justifyContent: 'center' },
});