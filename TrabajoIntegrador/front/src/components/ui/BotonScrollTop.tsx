import { ComponentRef, useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useThemeMode } from "../../constants/theme";
import { useResponsive } from "../../hooks/useResponsive";

// Umbral de scroll (en px) a partir del cual se muestra el botón
const UMBRAL_SCROLL = 300;

// Hook que conecta un ScrollView con el botón de volver arriba
export function useScrollTop() {
  const ref = useRef<ComponentRef<typeof ScrollView>>(null);
  const [visible, setVisible] = useState(false);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const mostrar = e.nativeEvent.contentOffset.y > UMBRAL_SCROLL;
    setVisible((prev) => (prev === mostrar ? prev : mostrar));
  }, []);

  const volverArriba = useCallback(() => {
    ref.current?.scrollTo({ y: 0, animated: true });
  }, []);

  return { ref, onScroll, scrollEventThrottle: 16, visible, volverArriba };
}

type Props = { visible: boolean; onPress: () => void };

// Botón flotante para volver al inicio de la pantalla
export function BotonScrollTop({ visible, onPress }: Props) {
  const theme = useTheme();
  const { isDark } = useThemeMode();
  const { width } = useResponsive();
  const anim = useRef(new Animated.Value(0)).current;
  const chico = width <= 480;
  const lado = chico ? 32 : 40;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: 250,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [visible, anim]);

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={[
        styles.contenedor,
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Volver arriba"
        accessibilityElementsHidden={!visible}
        importantForAccessibility={visible ? "yes" : "no-hide-descendants"}
        focusable={visible}
        style={({ pressed }) => [
          styles.boton,
          {
            width: lado,
            height: lado,
            backgroundColor: theme.primary,
            transform: [{ scale: pressed ? 0.9 : 1 }],
          },
        ]}
      >
        <Ionicons name="arrow-up" size={chico ? 16 : 20} color={isDark ? "#111111" : "#FFFFFF"} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  contenedor: { position: "absolute", right: 16, bottom: 16, zIndex: 998 },
  boton: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});