import React, { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AxiosError } from "axios";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../types/auth";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../navigation/types";
import { colors } from "../theme";
import AuthScreenLayout from "../components/AuthScreenLayout";
import FormInput from "../components/FormInput";
import AuthButton from "../components/AuthButton";
import Banner from "../components/Banner";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notVerified, setNotVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setNotVerified(false);
    if (!email.trim() || !password) {
      setError("E-posta ve şifreni gir.");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response?.status === 403) {
        setNotVerified(true);
      }
      setError(extractErrorMessage(axiosErr.response?.data, "Giriş sırasında bir hata oluştu."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      heroIcon="book-outline"
      eyebrow="DİYANET FETVA REHBERİ"
      title="Hocaya Sor"
      titleStyle={styles.wordmark}
    >
      <Text style={styles.cardTitle}>Tekrar hoş geldin</Text>
      <Text style={styles.cardSubtitle}>Devam etmek için giriş yap</Text>

      <FormInput
        icon="mail-outline"
        placeholder="E-posta"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <FormInput
        icon="lock-closed-outline"
        placeholder="Şifre"
        secureTextEntry={!showPassword}
        value={password}
        onChangeText={setPassword}
        rightElement={
          <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={19} color="#9CA79F" />
          </Pressable>
        }
      />

      {error && <Banner icon="alert-circle-outline" text={error} variant="error" />}

      {notVerified && (
        <Pressable onPress={() => navigation.navigate("VerifyEmail", { email: email.trim() })}>
          <Text style={styles.verifyLinkText}>Doğrulama koduna git →</Text>
        </Pressable>
      )}

      <AuthButton label="GİRİŞ YAP" onPress={handleSubmit} loading={loading} />

      <Pressable style={styles.registerRow} onPress={() => navigation.navigate("Register")}>
        <Text style={styles.registerText}>Hesabın yok mu? </Text>
        <Text style={styles.registerTextBold}>Kayıt ol</Text>
      </Pressable>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  wordmark: { fontSize: 32 },
  cardTitle: { fontSize: 21, fontWeight: "800", color: colors.ink, letterSpacing: -0.3 },
  cardSubtitle: { fontSize: 13, color: colors.muted, marginTop: 4, marginBottom: 26 },
  verifyLinkText: { color: colors.goldDeep, fontSize: 14, fontWeight: "700", marginBottom: 14 },
  registerRow: { flexDirection: "row", justifyContent: "center", marginTop: 22 },
  registerText: { color: colors.muted, fontSize: 14 },
  registerTextBold: { color: colors.goldDeep, fontSize: 14, fontWeight: "800" },
});