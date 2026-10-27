import { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";

export default function AuthCallback() {
  const { token, refreshToken, error } = useLocalSearchParams<{
    token?: string;
    refreshToken?: string;
    error?: string;
  }>();
  const { user, loading, signInWithToken } = useAuth();
  const router = useRouter();
  const procesado = useRef(false);

  useEffect(() => {
    if (loading || user || procesado.current) return;
    procesado.current = true;

    if (error) {
      router.replace({ pathname: "/", params: { error } });
      return;
    }
    if (!token || !refreshToken) {
      router.replace("/");
      return;
    }

    signInWithToken(token, refreshToken).catch(() =>
      router.replace({ pathname: "/", params: { error: "oauth" } })
    );
  }, [loading, user, token, refreshToken, error, signInWithToken, router]);

  // Esta ruta no está protegida, así que la navegación a home es explícita
  useEffect(() => {
    if (user) router.replace("/home");
  }, [user, router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator />
    </View>
  );
}