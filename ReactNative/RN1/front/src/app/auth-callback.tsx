import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";

export default function AuthCallback() {
  // Token recibido en la query string por el proveedor OAuth
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { user, loading, signInWithToken } = useAuth();
  const router = useRouter();

  // Si no hay token, vuelve al login. Si lo hay, intenta iniciar sesión.
  useEffect(() => {
    if (loading || user) return;

    if (!token) {
      router.replace("/");
      return;
    }

    signInWithToken(token).catch(() => router.replace({ pathname: "/", params: { error: "oauth" } }));
  }, [loading, token]);

  // apenas exista usuario en contexto, navega al home
  useEffect(() => {
    if (user) router.replace("/home");
  }, [user]);

  // Mientras se procesa el callback, se muestra un spinner centrado
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator />
    </View>
  );
}