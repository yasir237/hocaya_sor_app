import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "./tokenStorage";
import { AccessTokenOnly } from "../types/auth";

const API_URL = "http://localhost:5000/api/v1";

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

/**
 * Bir refresh isteği zaten devam ediyorsa, aynı anda 401 alan diğer istekler
 * yeni bir refresh tetiklemek yerine bu promise'in bitmesini bekler.
 * Böylece art arda birkaç istek aynı anda 401 alırsa refresh endpoint'i
 * yalnızca bir kez çağrılır.
 */
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post<AccessTokenOnly>(`${API_URL}/auth/refresh`, {
      refresh_token: refreshToken,
    });
    await tokenStorage.setAccessToken(data.access_token);
    return data.access_token;
  } catch {
    // Refresh token da geçersiz/süresi dolmuş — kullanıcı tekrar login olmalı.
    await tokenStorage.clear();
    return null;
  }
}

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const accessToken = await tokenStorage.getAccessToken();
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/** İstekleri, 401 sonrası tek seferlik retry olduğunu işaretlemek için genişletir. */
interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;
    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/me") ||
      originalRequest?.url?.includes("/auth/refresh");

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    const newAccessToken = await refreshPromise;

    if (!newAccessToken) {
      // Session tamamen düştü — çağıran taraf (AuthContext) kullanıcıyı
      // login ekranına yönlendirmekten sorumlu.
      return Promise.reject(error);
    }

    originalRequest.headers = originalRequest.headers ?? {};
    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
    return apiClient(originalRequest);
  }
);
