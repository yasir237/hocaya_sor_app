import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import type { StyleProp, TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";
import AuthHero from "./AuthHero";

type AuthScreenLayoutProps = {
  heroIcon: React.ComponentProps<typeof Ionicons>["name"];
  heroIconSize?: number;
  eyebrow: string;
  title: string;
  titleStyle?: StyleProp<TextStyle>;
  children: React.ReactNode;
};

export default function AuthScreenLayout({
  heroIcon,
  heroIconSize,
  eyebrow,
  title,
  titleStyle,
  children,
}: AuthScreenLayoutProps) {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.night} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <AuthHero icon={heroIcon} iconSize={heroIconSize} eyebrow={eyebrow} title={title} titleStyle={titleStyle} />
          <View style={styles.card}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.night },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  card: {
    flex: 1,
    backgroundColor: colors.cream,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 26,
    paddingTop: 32,
    paddingBottom: 28,
  },
});