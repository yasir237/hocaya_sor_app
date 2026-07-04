import { apiClient } from "./client";
import { TokenPair } from "../types/auth";

export const authApi = {
  async register(email: string, password: string): Promise<TokenPair> {
    const { data } = await apiClient.post<TokenPair>("/auth/register", { email, password });
    return data;
  },
  async login(email: string, password: string): Promise<TokenPair> {
    const { data } = await apiClient.post<TokenPair>("/auth/login", { email, password });
    return data;
  },
  async verifyEmail(email: string, code: string): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>("/auth/verify-email", {
      email,
      code,
    });
    return data;
  },
  async resendVerification(email: string): Promise<void> {
    await apiClient.post("/auth/resend-verification", { email });
  },
  async logout(refreshToken: string): Promise<void> {
    await apiClient.post("/auth/logout", { refresh_token: refreshToken });
  },
};
