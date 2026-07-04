import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

type BannerProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  text: string;
  variant?: "error" | "info";
};

export default function Banner({ icon, text, variant = "error" }: BannerProps) {
  const isError = variant === "error";
  return (
    <View style={[styles.banner, isError ? styles.bannerError : styles.bannerInfo]}>
      <Ionicons name={icon} size={17} color={isError ? colors.error : colors.goldDeep} />
      <Text style={[styles.text, isError ? styles.textError : styles.textInfo]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, padding: 10, marginBottom: 14 },
  bannerError: { backgroundColor: "#FBE9E8" },
  bannerInfo: { backgroundColor: "rgba(212,168,83,0.12)" },
  text: { fontSize: 13, flex: 1 },
  textError: { color: colors.error },
  textInfo: { color: colors.goldDeep },
});