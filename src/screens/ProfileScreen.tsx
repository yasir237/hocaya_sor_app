import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AxiosError } from "axios";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AppStackParamList } from "../navigation/types";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../types/auth";
import { colors } from "../theme";
import FormInput from "../components/FormInput";
import AuthButton from "../components/AuthButton";
import Banner from "../components/Banner";

type Props = NativeStackScreenProps<AppStackParamList, "Profile">;

function getInitials(name: string | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default function ProfileScreen({ navigation }: Props) {
  const { user, updateName, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const dirty = name.trim().length > 0 && name.trim() !== (user?.name ?? "");

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    if (name.trim().length < 2) {
      setError("Ad en az 2 karakter olmalı.");
      return;
    }
    setLoading(true);
    try {
      await updateName(name.trim());
      setSuccess("Adın güncellendi.");
    } catch (err) {
      const axiosErr = err as AxiosError;
      setError(extractErrorMessage(axiosErr.response?.data, "Güncelleme sırasında bir hata oluştu."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* ---- Üst bar ---- */}
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.cream} />
        </Pressable>
        <Text style={styles.topBarTitle}>Profil</Text>
        <View style={styles.backButton} />
      </View>

      {/* ---- Hero ---- */}
      <View style={styles.hero}>
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </View>
        </View>
        <Text style={styles.heroName}>{user?.name ?? "—"}</Text>
        <View style={styles.emailRow}>
          <Ionicons name="mail-outline" size={13} color={colors.muted} />
          <Text style={styles.heroEmail}>{user?.email}</Text>
        </View>
        {user?.is_verified && (
          <View style={styles.verifiedPill}>
            <Ionicons name="checkmark-circle" size={12} color={colors.goldDeep} />
            <Text style={styles.verifiedText}>Doğrulanmış hesap</Text>
          </View>
        )}
      </View>

      {/* ---- Kart ---- */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>AD SOYAD</Text>
        <FormInput
          icon="person-outline"
          placeholder="Ad Soyad"
          autoCapitalize="words"
          value={name}
          onChangeText={(text) => {
            setName(text);
            setSuccess(null);
          }}
        />

        {error && <Banner icon="alert-circle-outline" text={error} variant="error" />}
        {success && <Banner icon="checkmark-circle-outline" text={success} variant="info" />}

        <AuthButton label="KAYDET" onPress={handleSave} loading={loading} disabled={!dirty} />

        <View style={styles.divider} />

        <Pressable style={styles.logoutRow} onPress={logout}>
          <Ionicons name="log-out-outline" size={18} color={colors.error} />
          <Text style={styles.logoutText}>Çıkış yap</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.night },

  // ---- Üst bar ----
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: Platform.OS === "ios" ? 54 : 18,
    paddingBottom: 8,
  },
  backButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  topBarTitle: { color: colors.cream, fontSize: 16, fontWeight: "700" },

  // ---- Hero ----
  hero: { alignItems: "center", paddingBottom: 30, paddingTop: 6 },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: "rgba(212,168,83,0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(212,168,83,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.gold, fontSize: 28, fontWeight: "800" },
  heroName: { color: colors.cream, fontSize: 20, fontWeight: "800", marginBottom: 6 },
  emailRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  heroEmail: { color: colors.muted, fontSize: 13 },
  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(212,168,83,0.12)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 12,
  },
  verifiedText: { color: colors.goldDeep, fontSize: 11, fontWeight: "700" },

  // ---- Kart ----
  card: {
    flex: 1,
    backgroundColor: colors.cream,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.muted,
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#EFEAE0",
    marginTop: 26,
    marginBottom: 18,
  },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
  },
  logoutText: { color: colors.error, fontSize: 14, fontWeight: "700" },
});