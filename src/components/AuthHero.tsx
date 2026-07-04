import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { StyleProp, TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, STARS } from "../theme";

type AuthHeroProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconSize?: number;
  eyebrow: string;
  title: string;
  titleStyle?: StyleProp<TextStyle>;
};

export default function AuthHero({ icon, iconSize = 30, eyebrow, title, titleStyle }: AuthHeroProps) {
  return (
    <View style={styles.hero}>
      {STARS.map((s, i) => (
        <View
          key={i}
          style={[
            styles.star,
            {
              top: s.top,
              left: `${s.left}%`,
              width: s.size,
              height: s.size,
              borderRadius: s.size,
              opacity: s.opacity,
            },
          ]}
        />
      ))}

      <View style={styles.niche}>
        <View style={styles.nicheInner}>
          <Ionicons name={icon} size={iconSize} color={colors.gold} />
        </View>
      </View>

      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={[styles.wordmark, titleStyle]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.night,
    paddingTop: 72,
    paddingBottom: 40,
    alignItems: "center",
    overflow: "hidden",
  },
  star: { position: "absolute", backgroundColor: colors.gold },
  niche: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.nightDeep,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(212,168,83,0.35)",
  },
  nicheInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(212,168,83,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: { color: colors.gold, fontSize: 11, fontWeight: "700", letterSpacing: 2.5, marginBottom: 8 },
  wordmark: { color: colors.cream, fontSize: 30, fontWeight: "800", letterSpacing: -0.5 },
});