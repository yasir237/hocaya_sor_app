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

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim() || password.length < 8) {
      setError("Geçerli bir e-posta gir ve şifre en az 8 karakter olsun.");
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), password);
      navigation.navigate("VerifyEmail", { email: email.trim() });
    } catch (err) {
      const axiosErr = err as AxiosError;
      setError(extractErrorMessage(axiosErr.response?.data, "Kayıt sırasında bir hata oluştu."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      heroIcon="person-add-outline"
      heroIconSize={28}
      eyebrow="YENİ HESAP"
      title="Hocaya Sor'a katıl"
      titleStyle={styles.wordmark}
    >
      <Text style={styles.cardTitle}>Hesap oluştur</Text>
      <Text style={styles.cardSubtitle}>Sorularına güvenilir cevaplar için bir hesap aç</Text>

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
      <Text style={styles.hint}>En az 8 karakter olmalı</Text>

      {error && <Banner icon="alert-circle-outline" text={error} variant="error" />}

      <AuthButton label="KAYIT OL" onPress={handleSubmit} loading={loading} />

      <Pressable style={styles.loginRow} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginText}>Zaten hesabın var mı? </Text>
        <Text style={styles.loginTextBold}>Giriş yap</Text>
      </Pressable>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  wordmark: { fontSize: 28, textAlign: "center", paddingHorizontal: 20 },
  cardTitle: { fontSize: 21, fontWeight: "800", color: colors.ink, letterSpacing: -0.3 },
  cardSubtitle: { fontSize: 13, color: colors.muted, marginTop: 4, marginBottom: 26 },
  hint: { fontSize: 12, color: colors.muted, marginTop: -6, marginBottom: 16, marginLeft: 4 },
  loginRow: { flexDirection: "row", justifyContent: "center", marginTop: 22 },
  loginText: { color: colors.muted, fontSize: 14 },
  loginTextBold: { color: colors.goldDeep, fontSize: 14, fontWeight: "800" },
});