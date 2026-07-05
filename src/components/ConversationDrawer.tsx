import React from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Conversation } from "../types/fatwa";
import { formatRelativeDate } from "../utils/date";
import { colors } from "../theme";

const SCREEN_WIDTH = Dimensions.get("window").width;
export const DRAWER_WIDTH = Math.min(300, SCREEN_WIDTH * 0.82);

type Props = {
  open: boolean;
  anim: Animated.Value;
  conversations: Conversation[];
  activeConversationId: string | null;
  loading: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelectConversation: (conversation: Conversation) => void;
};

export default function ConversationDrawer({
  open,
  anim,
  conversations,
  activeConversationId,
  loading,
  onClose,
  onNewChat,
  onSelectConversation,
}: Props) {
  return (
    <>
      {/* Karartma (overlay) — her zaman DOM'da, opaklığı animasyonla kontrol edilir */}
      <Animated.View pointerEvents={open ? "auto" : "none"} style={[styles.overlay, { opacity: anim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [
              {
                translateX: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-DRAWER_WIDTH, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>Sohbetler</Text>
          <Pressable onPress={onClose} hitSlop={10} style={styles.iconButton}>
            <Ionicons name="close" size={20} color={colors.muted} />
          </Pressable>
        </View>

        <Pressable style={styles.newChatRow} onPress={onNewChat}>
          <View style={styles.newChatIcon}>
            <Ionicons name="add" size={16} color={colors.night} />
          </View>
          <Text style={styles.newChatText}>Yeni Sohbet</Text>
        </Pressable>

        <View style={styles.divider} />

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={colors.gold} />
          </View>
        ) : conversations.length === 0 ? (
          <Text style={styles.emptyText}>Henüz bir sohbetin yok.</Text>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(c) => c.id}
            style={styles.list}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.row, item.id === activeConversationId && styles.rowActive]}
                onPress={() => onSelectConversation(item)}
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={16}
                  color={item.id === activeConversationId ? colors.gold : colors.muted}
                />
                <View style={styles.textWrap}>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.date}>{formatRelativeDate(item.updated_at)}</Text>
                </View>
              </Pressable>
            )}
          />
        )}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    zIndex: 15,
  },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    backgroundColor: colors.nightDeep,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 58 : 24,
    paddingBottom: 20,
    zIndex: 20,
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  headerText: { color: colors.cream, fontSize: 15, fontWeight: "800" },
  iconButton: { padding: 4 },
  newChatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  newChatIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  newChatText: { color: colors.cream, fontSize: 14, fontWeight: "700" },
  divider: { height: 1, backgroundColor: "rgba(212,168,83,0.15)", marginVertical: 8 },
  loadingWrap: { paddingVertical: 20, alignItems: "center" },
  emptyText: { color: colors.muted, fontSize: 13, textAlign: "center", paddingVertical: 16 },
  list: { flex: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  rowActive: { backgroundColor: "rgba(212,168,83,0.1)" },
  textWrap: { flex: 1 },
  title: { color: colors.cream, fontSize: 13, fontWeight: "600" },
  date: { color: colors.muted, fontSize: 11, marginTop: 2 },
});