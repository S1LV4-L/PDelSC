import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";
const hasLocal = typeof localStorage !== "undefined";

export async function getItem(key: string): Promise<string | null> {
  if (isWeb) return hasLocal ? localStorage.getItem(key) : null;
  return SecureStore.getItemAsync(key);
}

export async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    if (hasLocal) localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function removeItem(key: string): Promise<void> {
  if (isWeb) {
    if (hasLocal) localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}