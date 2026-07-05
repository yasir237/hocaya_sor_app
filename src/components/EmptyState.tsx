import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

const SUGGESTIONS = ["Faiz haram mı?", "Zekat nasıl hesaplanır?", "Oruç kimlere farz değildir?"];

type Props = {
  loading?: boolean;
  onSuggestionPress: (suggestion: string) => void;
};

export default function EmptyState({ loading, onSuggestionPress }: Props) {
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.goldDeep} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.niche}>
        <Ionicons name="book-outline" size={30} color={colors.gold} />
      </View>
      <Text style={styles.title}>Hoş geldin{"\n"}Allah'ın dostu, şeytanın düşmanı</Text>
      <Text style={styles.subtitle}>Diyanet fetvalarına dayanan, kaynaklı cevaplar al.</Text>
      <View style={styles.chipsWrap}>
        {SUGGESTIONS.map((s) => (
          <Pressable key={s} style={styles.chip} onPress={() => onSuggestionPress(s)}>
            <Text style={styles.chipText}>{s}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  niche: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(212,168,83,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: { fontSize: 19, fontWeight: "800", color: colors.ink, textAlign: "center", marginBottom: 6 },
  subtitle: { fontSize: 13, color: colors.muted, textAlign: "center", marginBottom: 24, lineHeight: 19 },
  chipsWrap: { gap: 10, alignItems: "center" },
  chip: {
    borderWidth: 1.5,
    borderColor: "#E4DFD1",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  chipText: { fontSize: 13, color: colors.ink, fontWeight: "600" },
});