import {
  StyleProp,
  ViewStyle,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import { spacing, useTheme } from "../../constants/theme";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: "primary" | "link" | "outline" | "danger";
  style?: StyleProp<ViewStyle>;
};

export default function Button({
  title,
  onPress,
  loading = false,
  variant = "primary",
  style,
}: Props) {
  const theme = useTheme();
  const isLink = variant === "link";
  const isOutline = variant === "outline";
  const isDanger = variant === "danger";
  const isQuiet = isLink || isOutline;

  const buttonColor = isDanger ? theme.error : theme.primary;
  const pressedColor = isDanger ? theme.error : theme.primaryDark;

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        !isLink && styles.button,
        isOutline && {
          backgroundColor: pressed ? theme.background : theme.surface,
          borderColor: theme.border,
          borderWidth: 1,
        },
        !isLink && !isOutline && {
          backgroundColor: pressed ? pressedColor : buttonColor,
        },
        loading && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={isQuiet ? theme.primary : "#FFFFFF"}
          size="small"
        />
      ) : (
        <Text
          style={[
            isQuiet ? styles.quietText : styles.filledText,
            { color: isQuiet ? theme.primary : "#FFFFFF" },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.6,
  },
  filledText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  quietText: {
    fontSize: 14,
    fontWeight: "600",
  },
});