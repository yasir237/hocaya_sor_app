import { apiClient } from "./client";
import { TokenPair, UserProfile } from "../types/auth";

export const authApi = {
  async register(name: string, email: string, password: string): Promise<TokenPair> {
    const { data } = await apiClient.post<TokenPair>("/auth/register", { name, email, password });
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
  async getMe(): Promise<UserProfile> {
   const { data } = await apiClient.get("/auth/me");
   return data;
  },
  async updateProfile(name: string): Promise<UserProfile> {
    const { data } = await apiClient.patch<UserProfile>("/auth/me", { name });
    return data;
  },
};