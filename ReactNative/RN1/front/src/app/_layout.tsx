import { useEffect } from "react";
import { SplashScreen, Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { useAuth } from "../hooks/useAuth";

SplashScreen.preventAutoHideAsync();

function SplashController() {
  const { loading } = useAuth();

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  return null;
}

function RootNavigator() {
  const { user } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Screen name="auth-callback" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <SplashController />
      <RootNavigator />
    </AuthProvider>
  );
}