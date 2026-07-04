import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

/**
 * expo-secure-store, iOS'ta Keychain'i, Android'de EncryptedSharedPreferences'ı
 * kullanır — access ve refresh token'lar hiçbir zaman düz metin AsyncStorage'a
 * yazılmaz.
 *
 * Web'de expo-secure-store desteklenmediği için (native Keychain/Keystore yok),
 * web'de localStorage'a düşülüyor. localStorage SecureStore kadar güvenli değildir
 * (şifrelenmemiş, XSS'e karşı savunmasız) — bu yalnızca web'de geliştirme/test
 * amaçlıdır.
 */
const ACCESS_TOKEN_KEY = "hocaya_sor.access_token";
const REFRESH_TOKEN_KEY = "hocaya_sor.refresh_token";

const isWeb = Platform.OS === "web";

async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteItem(key: string): Promise<void> {
  if (isWeb) {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return getItem(ACCESS_TOKEN_KEY);
  },
  async getRefreshToken(): Promise<string | null> {
    return getItem(REFRESH_TOKEN_KEY);
  },
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      setItem(ACCESS_TOKEN_KEY, accessToken),
      setItem(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  },
  async setAccessToken(accessToken: string): Promise<void> {
    await setItem(ACCESS_TOKEN_KEY, accessToken);
  },
  async clear(): Promise<void> {
    await Promise.all([
      deleteItem(ACCESS_TOKEN_KEY),
      deleteItem(REFRESH_TOKEN_KEY),
    ]);
  },
};