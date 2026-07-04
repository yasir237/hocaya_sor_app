import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AxiosError } from "axios";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../types/auth";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../navigation/types";
import { colors } from "../theme";
import AuthScreenLayout from "../components/AuthScreenLayout";
import AuthButton from "../components/AuthButton";
import Banner from "../components/Banner";

type Props = NativeStackScreenProps<AuthStackParamList, "VerifyEmail">;

const RESEND_COOLDOWN_SECONDS = 30;
const CODE_LENGTH = 6;

export default function VerifyEmailScreen({ route, navigation }: Props) {
  const { email } = route.params;
  const { verifyEmail, resendVerification } = useAuth();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [focused, setFocused] = useState(false);
  const hiddenInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async () => {
    setError(null);
    setInfo(null);
    if (code.trim().length !== CODE_LENGTH) {
      setError("Lütfen 6 haneli doğrulama kodunu gir.");
      return;
    }
    setVerifying(true);
    try {
      await verifyEmail(email, code.trim());
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (err) {
      const axiosErr = err as AxiosError;
      const status = axiosErr.response?.status;
      const fallback =
        status === 429
          ? "Çok fazla hatalı deneme yaptın. Yeni bir kod iste."
          : "Kod geçersiz veya süresi dolmuş.";
      setError(extractErrorMessage(axiosErr.response?.data, fallback));
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError(null);
    setInfo(null);
    setResending(true);
    try {
      await resendVerification(email);
      setInfo("Yeni doğrulama kodu gönderildi. Gelen kutunu (spam dahil) kontrol et.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      const axiosErr = err as AxiosError;
      const fallback =
        axiosErr.response?.status === 429
          ? "Çok sık istek gönderdin, biraz bekle."
          : "Kod gönderilemedi, tekrar dene.";
      setError(extractErrorMessage(axiosErr.response?.data, fallback));
    } finally {
      setResending(false);
    }
  };

  const digits = Array.from({ length: CODE_LENGTH }, (_, i) => code[i] ?? "");

  return (
    <AuthScreenLayout heroIcon="mail-open-outline" heroIconSize={28} eyebrow="E-POSTA DOĞRULAMA" title="Kodunu gir">
      <Text style={styles.cardTitle}>Gelen kutunu kontrol et</Text>
      <Text style={styles.cardSubtitle}>
        <Text style={styles.emailHighlight}>{email}</Text> adresine gönderilen 6 haneli kodu gir
      </Text>

      <Pressable onPress={() => hiddenInputRef.current?.focus()} style={styles.otpRow}>
        {digits.map((digit, i) => {
          const isActiveCursor = focused && i === code.length;
          return (
            <View
              key={i}
              style={[styles.otpBox, digit !== "" && styles.otpBoxFilled, isActiveCursor && styles.otpBoxActive]}
            >
              <Text style={styles.otpDigit}>{digit}</Text>
            </View>
          );
        })}
      </Pressable>
      <TextInput
        ref={hiddenInputRef}
        style={styles.hiddenInput}
        keyboardType="number-pad"
        maxLength={CODE_LENGTH}
        value={code}
        onChangeText={(t) => setCode(t.replace(/[^0-9]/g, ""))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus
      />

      {error && <Banner icon="alert-circle-outline" text={error} variant="error" />}
      {info && <Banner icon="checkmark-circle-outline" text={info} variant="info" />}

      <AuthButton label="DOĞRULA" onPress={handleVerify} loading={verifying} />

      <Pressable onPress={handleResend} disabled={resending || cooldown > 0} style={styles.resendRow}>
        <Text style={[styles.resendText, (resending || cooldown > 0) && styles.resendTextDisabled]}>
          {cooldown > 0 ? `Kodu tekrar gönder (${cooldown}s)` : resending ? "Gönderiliyor..." : "Kodu tekrar gönder"}
        </Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate("Login")}>
        <Text style={styles.backText}>Girişe dön</Text>
      </Pressable>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  cardTitle: { fontSize: 21, fontWeight: "800", color: colors.ink, letterSpacing: -0.3 },
  cardSubtitle: { fontSize: 13, color: colors.muted, marginTop: 6, marginBottom: 26, lineHeight: 19 },
  emailHighlight: { color: colors.ink, fontWeight: "700" },

  otpRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  otpBox: {
    width: 46,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E4DFD1",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  otpBoxFilled: { borderColor: colors.goldDeep, backgroundColor: "rgba(212,168,83,0.08)" },
  otpBoxActive: { borderColor: colors.goldDeep },
  otpDigit: { fontSize: 22, fontWeight: "800", color: colors.ink },
  hiddenInput: { position: "absolute", opacity: 0, height: 1, width: 1 },

  resendRow: { marginTop: 22 },
  resendText: { color: colors.goldDeep, fontSize: 14, fontWeight: "700", textAlign: "center" },
  resendTextDisabled: { color: colors.muted },

  backText: { color: colors.muted, fontSize: 14, textAlign: "center", marginTop: 16 },
});