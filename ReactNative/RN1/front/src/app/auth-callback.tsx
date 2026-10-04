import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";

export default function AuthCallback() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { user, loading, signInWithToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
  if (loading || user) return;

  if (!token) {
    router.replace("/");
    return;
  }

  signInWithToken(token).catch(() => router.replace({ pathname: "/", params: { error: "oauth" } }));
    }, [loading, token]);

  // Esta ruta no está protegida, así que la navegación a home es explícita
  useEffect(() => {
    if (user) router.replace("/home");
  }, [user]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator />
    </View>
  );
}