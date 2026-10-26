import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { spacing, useTheme } from "../../constants/theme";

type Props = TextInputProps & {
  label: string;
  error?: string;
  validate?: (valor: string) => string | null;
  submitted?: boolean;
};

export default function Input({
  label,
  error,
  validate,
  submitted = false,
  secureTextEntry,
  onBlur,
  ...rest
}: Props) {
  const theme = useTheme();
  const [hidden, setHidden] = useState(!!secureTextEntry);
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);

  const mensaje =
    error ||
    (validate && (touched || submitted)
      ? validate(String(rest.value ?? ""))
      : null);

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>

      <View
        style={[
          styles.field,
          {
            backgroundColor: theme.surface,
            borderColor: focused
              ? theme.primary
              : mensaje
                ? theme.error
                : theme.border,
          },
        ]}
      >
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholderTextColor={theme.muted}
          secureTextEntry={hidden}
          autoCapitalize="none"
          onFocus={() => setFocused(true)}
          onBlur={(event) => {
            setFocused(false);
            setTouched(true);
            onBlur?.(event);
          }}
          {...rest}
        />

        {secureTextEntry && (
          <Pressable onPress={() => setHidden((value) => !value)} hitSlop={8}>
            <Text style={[styles.toggle, { color: theme.primary }]}>
              {hidden ? "Mostrar" : "Ocultar"}
            </Text>
          </Pressable>
        )}
      </View>

      {!!mensaje && (
        <Text style={[styles.error, { color: theme.error }]}>{mensaje}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  field: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 15,
    ...({ outlineStyle: "none" } as object),
  },
  toggle: {
    fontWeight: "600",
    fontSize: 13,
    paddingLeft: spacing.sm,
  },
  error: {
    fontSize: 12,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});