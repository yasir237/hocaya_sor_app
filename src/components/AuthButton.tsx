import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export default function AuthButton({ label, onPress, loading, disabled }: AuthButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled || loading}>
      {({ pressed }) => (
        <View style={[styles.shadow, pressed && styles.shadowPressed]}>
          <View style={styles.top}>
            {loading ? <ActivityIndicator color={colors.nightDeep} /> : <Text style={styles.text}>{label}</Text>}
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadow: { backgroundColor: colors.goldDeep, borderRadius: 16, paddingBottom: 6, marginTop: 6 },
  shadowPressed: { paddingBottom: 0 },
  top: { backgroundColor: colors.gold, borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  text: { color: colors.nightDeep, fontSize: 15, fontWeight: "800", letterSpacing: 0.5 },
});