import { StyleProp, ViewStyle, ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "../../constants/theme";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: "primary" | "link" | "outline";
  style?: StyleProp<ViewStyle>;
};

export default function Button({ title, onPress, loading = false, variant = "primary", style }: Props) {
  const theme = useTheme();
  const isLink = variant === "link";
  const isOutline = variant === "outline";
  const claro = isLink || isOutline;

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        !isLink && styles.button,
        isOutline && { 
          backgroundColor: pressed ? theme.surface : theme.background, 
          borderWidth: 1.5, 
          borderColor: theme.border 
        },
        !isLink && !isOutline && { 
          backgroundColor: pressed ? theme.primaryDark : theme.primary,
          // Sombra sutil solo para el botón primario
          shadowColor: theme.primaryDark,
          shadowOpacity: pressed ? 0 : 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: pressed ? 0 : 2,
        },
        loading && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={claro ? theme.primary : "#fff"} size="small" />
      ) : (
        <Text style={[
          claro ? styles.linkText : styles.text,
          { color: claro ? theme.primary : "#fff" }
        ]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: { opacity: 0.6 },
  text: { fontSize: 15, fontWeight: "700", letterSpacing: 0.2 },
  linkText: { fontSize: 14, fontWeight: "600" },
});