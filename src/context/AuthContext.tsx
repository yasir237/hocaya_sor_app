import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/authApi";
import { tokenStorage } from "../api/tokenStorage";
import {UserProfile} from "../types/auth";


type AuthStatus = "loading" | "signedOut" | "signedIn";

interface AuthContextValue {
  status: AuthStatus;
  user: UserProfile | null;
  /** register() sonrası kullanıcının doğrulaması gereken e-posta — VerifyEmail ekranında gösterilir. */
  pendingVerificationEmail: string | null;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
  setPendingVerificationEmail: (email: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  // Uygulama açıldığında güvenli depoda access token var mı diye bak.
  // Not: bu, token'ın hâlâ geçerli olduğunu garanti etmez — geçersizse ilk
  // korumalı istekte apiClient'ın 401/refresh mekanizması devreye girer;
  // refresh de başarısız olursa kullanıcı login ekranına düşer.
  useEffect(() => {
    (async () => {
      const accessToken = await tokenStorage.getAccessToken();
      if (!accessToken) {
        setStatus("signedOut");
        return;
      }
      try {
        const profile = await authApi.getMe();
        setUser(profile);
        setStatus("signedIn");
      } catch {
        // Token geçersiz/süresi dolmuş ve refresh de başarısızsa signedOut'a düş.
        await tokenStorage.clear();
        setStatus("signedOut");
      }
    })();
  }, []);

  const register = async (name: string, email: string, password: string) => {
    // Kayıt tokenler döndürse de hesap doğrulanana kadar login/fatwa
    // endpoint'leri çalışmaz, o yüzden burada oturum açmıyoruz — kullanıcıyı
    // doğrulama koduna yönlendiriyoruz.
    await authApi.register(name, email, password);
    setPendingVerificationEmail(email);
  };

  const login = async (email: string, password: string) => {
    const tokens = await authApi.login(email, password);
    await tokenStorage.setTokens(tokens.access_token, tokens.refresh_token);
    const profile = await authApi.getMe();
    setUser(profile);
    setPendingVerificationEmail(null);
    setStatus("signedIn");
  };

  const verifyEmail = async (email: string, code: string) => {
    await authApi.verifyEmail(email, code);
    setPendingVerificationEmail(null);
  };

  const resendVerification = async (email: string) => {
    await authApi.resendVerification(email);
  };

  const logout = async () => {
    const refreshToken = await tokenStorage.getRefreshToken();
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {
      // Sunucuya ulaşılamasa bile local oturumu temizlemeye devam ediyoruz.
    } finally {
      await tokenStorage.clear();
      setUser(null);
      setStatus("signedOut");
    }
  };

  const updateName = async (name: string) => {
    const profile = await authApi.updateProfile(name);
    setUser(profile);
  };

  const value = useMemo(
    () => ({
      status,
      user,
      pendingVerificationEmail,
      register,
      login,
      verifyEmail,
      resendVerification,
      logout,
      updateName,
      setPendingVerificationEmail,
    }),
    [status, user, pendingVerificationEmail]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth, AuthProvider içinde kullanılmalı");
  return ctx;
}