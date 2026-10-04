import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Proveedor, urlOAuth } from "./authService";

WebBrowser.maybeCompleteAuthSession();

// Web: redirige la pestaña; el back vuelve a FRONTEND_URL/auth-callback?token=...
// Nativo: abre el navegador del sistema y devuelve el token al volver por deep link
export async function iniciarOAuth(proveedor: Proveedor): Promise<string | null> {
  if (Platform.OS === "web") {
    window.location.href = urlOAuth(proveedor);
    return null;
  }

  const resultado = await WebBrowser.openAuthSessionAsync(
    urlOAuth(proveedor),
    Linking.createURL("auth-callback")
  );
  if (resultado.type !== "success") return null;

  const token = Linking.parse(resultado.url).queryParams?.token;
  return typeof token === "string" ? token : null;
}