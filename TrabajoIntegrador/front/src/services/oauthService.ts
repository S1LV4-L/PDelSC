import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Proveedor, urlOAuth } from "./authService";

WebBrowser.maybeCompleteAuthSession();

export type TokensOAuth = { token: string; refreshToken: string };

// Web: redirige la pestaña; el back vuelve a FRONTEND_URL/auth-callback?token=...
// Nativo: abre el navegador del sistema y devuelve el token al volver por deep link
export async function iniciarOAuth(proveedor: Proveedor): Promise<TokensOAuth | null> {
  if (Platform.OS === "web") {
    window.location.href = urlOAuth(proveedor);
    return null;
  }

  const resultado = await WebBrowser.openAuthSessionAsync(
    urlOAuth(proveedor, "app"),
    Linking.createURL("auth-callback")
  );
  if (resultado.type !== "success") return null;

  const { token, refreshToken, error } = Linking.parse(resultado.url).queryParams ?? {};
  if (error) {
    throw new Error(
      error === "inactivo"
        ? "Tu cuenta está inactiva. Consultá con la administración"
        : "No se pudo iniciar sesión con el proveedor"
    );
  }
  return typeof token === "string" && typeof refreshToken === "string"
    ? { token, refreshToken }
    : null;
}