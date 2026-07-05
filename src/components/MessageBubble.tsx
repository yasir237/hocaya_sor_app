import React from "react";
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ChatMessage } from "../types/chat";
import type { FeedbackType } from "../types/fatwa";
import { colors } from "../theme";

type Props = {
  message: ChatMessage;
  copied: boolean;
  onCopy: (id: string, text: string) => void;
  onFeedback: (id: string, logId: string, type: FeedbackType) => void;
  onToggleSources: (id: string) => void;
  onCommentDraftChange: (id: string, text: string) => void;
  onSubmitComment: (id: string, logId: string) => void;
  onDismissComment: (id: string) => void;
};

export default function MessageBubble({
  message,
  copied,
  onCopy,
  onFeedback,
  onToggleSources,
  onCommentDraftChange,
  onSubmitComment,
  onDismissComment,
}: Props) {
  if (message.role === "user") {
    return (
      <View style={styles.userRow}>
        <Pressable
          style={styles.userBubble}
          onLongPress={() => onCopy(message.id, message.text)}
          delayLongPress={350}
        >
          <Text style={styles.userText}>{message.text}</Text>
          {copied && (
            <View style={styles.copiedBadgeDark}>
              <Ionicons name="checkmark" size={11} color={colors.night} />
              <Text style={styles.copiedBadgeDarkText}>Kopyalandı</Text>
            </View>
          )}
        </Pressable>
      </View>
    );
  }

  if (message.role === "loading") {
    return (
      <View style={styles.assistantRow}>
        <Avatar icon="book-outline" color={colors.gold} />
        <View style={[styles.assistantBubble, styles.typingBubble]}>
          <ActivityIndicator size="small" color={colors.goldDeep} />
          <Text style={styles.typingText}>düşünüyor...</Text>
        </View>
      </View>
    );
  }

  if (message.role === "error") {
    return (
      <View style={styles.assistantRow}>
        <Avatar icon="alert-circle-outline" color={colors.error} />
        <View style={[styles.assistantBubble, styles.errorBubble]}>
          <Text style={styles.errorText}>{message.text}</Text>
        </View>
      </View>
    );
  }

  // assistant
  return (
    <View>
      <View style={styles.assistantRow}>
        <Avatar icon="book-outline" color={colors.gold} />
        <View style={styles.assistantBubble}>
          <Pressable onLongPress={() => onCopy(message.id, message.text)} delayLongPress={350}>
            <Text style={styles.assistantText}>{message.text}</Text>
            {copied && (
              <View style={styles.copiedBadgeLight}>
                <Ionicons name="checkmark" size={11} color={colors.goldDeep} />
                <Text style={styles.copiedBadgeLightText}>Kopyalandı</Text>
              </View>
            )}
          </Pressable>

          <View style={styles.bubbleFooter}>
            <View style={styles.feedbackRow}>
              <Pressable
                style={[styles.feedbackPill, message.feedback === "like" && styles.feedbackPillActive]}
                onPress={() => onFeedback(message.id, message.logId, "like")}
              >
                <Ionicons
                  name={message.feedback === "like" ? "thumbs-up" : "thumbs-up-outline"}
                  size={14}
                  color={message.feedback === "like" ? colors.nightDeep : colors.muted}
                />
              </Pressable>
              <Pressable
                style={[styles.feedbackPill, message.feedback === "dislike" && styles.feedbackPillActive]}
                onPress={() => onFeedback(message.id, message.logId, "dislike")}
              >
                <Ionicons
                  name={message.feedback === "dislike" ? "thumbs-down" : "thumbs-down-outline"}
                  size={14}
                  color={message.feedback === "dislike" ? colors.nightDeep : colors.muted}
                />
              </Pressable>
            </View>

            {message.sources.length > 0 && (
              <Pressable style={styles.sourcesToggle} onPress={() => onToggleSources(message.id)}>
                <Ionicons name="document-text-outline" size={13} color={colors.goldDeep} />
                <Text style={styles.sourcesToggleText}>{message.sources.length} kaynak</Text>
                <Ionicons
                  name={message.sourcesExpanded ? "chevron-up" : "chevron-down"}
                  size={13}
                  color={colors.goldDeep}
                />
              </Pressable>
            )}
          </View>

          {!message.showCommentInput && message.comment && (
            <Text style={styles.commentSubmittedText}>Yorumun: {message.comment}</Text>
          )}

          {message.showCommentInput && (
            <View style={styles.commentBox}>
              <TextInput
                style={styles.commentInput}
                placeholder="Neden beğenmedin? (opsiyonel)"
                placeholderTextColor="#A8B3AC"
                value={message.commentDraft}
                onChangeText={(text) => onCommentDraftChange(message.id, text)}
                multiline
                maxLength={1000}
              />
              <View style={styles.commentActions}>
                <Pressable onPress={() => onDismissComment(message.id)} hitSlop={6}>
                  <Text style={styles.commentDismissText}>Vazgeç</Text>
                </Pressable>
                <Pressable
                  style={styles.commentSubmitButton}
                  onPress={() => onSubmitComment(message.id, message.logId)}
                >
                  <Text style={styles.commentSubmitText}>Gönder</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </View>

      {message.sourcesExpanded && message.sources.length > 0 && (
        <View style={styles.sourcesContainer}>
          {message.sources.map((source) => (
            <Pressable
              key={source.id}
              style={styles.sourceCard}
              onPress={() => Linking.openURL(source.source_url)}
            >
              <View style={styles.sourceCategoryPill}>
                <Text style={styles.sourceCategoryText}>{source.main_category}</Text>
              </View>
              <Text style={styles.sourceQuestion} numberOfLines={2}>
                {source.question}
              </Text>
              <View style={styles.sourceLinkRow}>
                <Text style={styles.sourceLink}>Kaynağı görüntüle</Text>
                <Ionicons name="chevron-forward" size={13} color={colors.goldDeep} />
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function Avatar({ icon, color }: { icon: keyof typeof Ionicons.glyphMap; color: string }) {
  return (
    <View style={styles.avatar}>
      <Ionicons name={icon} size={14} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  userRow: { alignItems: "flex-end" },
  userBubble: {
    maxWidth: "82%",
    backgroundColor: colors.night,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userText: { color: colors.cream, fontSize: 15, lineHeight: 21 },
  copiedBadgeDark: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-end",
    backgroundColor: colors.cream,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginTop: 8,
  },
  copiedBadgeDarkText: { fontSize: 10, fontWeight: "700", color: colors.night },
  copiedBadgeLight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: "rgba(212,168,83,0.14)",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginTop: 8,
  },
  copiedBadgeLightText: { fontSize: 10, fontWeight: "700", color: colors.goldDeep },

  assistantRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, maxWidth: "92%" },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.night,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  assistantBubble: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#EFEAE0",
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 14,
  },
  assistantText: { color: colors.ink, fontSize: 15, lineHeight: 22 },

  typingBubble: { flexDirection: "row", alignItems: "center", gap: 8 },
  typingText: { color: colors.muted, fontSize: 13, fontStyle: "italic" },

  errorBubble: { backgroundColor: "#FBE9E8", borderColor: "#F3D2D0" },
  errorText: { color: colors.error, fontSize: 14, lineHeight: 20 },

  bubbleFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  feedbackRow: { flexDirection: "row", gap: 8 },
  feedbackPill: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: "#E4DFD1",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackPillActive: { backgroundColor: colors.gold, borderColor: colors.goldDeep },

  sourcesToggle: { flexDirection: "row", alignItems: "center", gap: 4 },
  sourcesToggleText: { fontSize: 12, color: colors.goldDeep, fontWeight: "700" },

  sourcesContainer: { marginLeft: 34, marginTop: 8, gap: 8 },
  sourceCard: {
    backgroundColor: "#FAF7F0",
    borderWidth: 1,
    borderColor: "#EFEAE0",
    borderRadius: 12,
    padding: 12,
  },
  sourceCategoryPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(212,168,83,0.14)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 7,
  },
  sourceCategoryText: { fontSize: 10, fontWeight: "700", color: colors.goldDeep, letterSpacing: 0.5 },
  sourceQuestion: { fontSize: 13, color: colors.ink, marginBottom: 7, lineHeight: 18 },
  sourceLinkRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  sourceLink: { fontSize: 12, color: colors.goldDeep, fontWeight: "700" },

  commentBox: {
    marginTop: 10,
    backgroundColor: "#FAF7F0",
    borderWidth: 1,
    borderColor: "#EFEAE0",
    borderRadius: 12,
    padding: 10,
  },
  commentInput: { fontSize: 13, color: colors.ink, minHeight: 36, maxHeight: 90 },
  commentActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 14,
    marginTop: 8,
  },
  commentDismissText: { fontSize: 12, color: colors.muted, fontWeight: "600" },
  commentSubmitButton: {
    backgroundColor: colors.goldDeep,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  commentSubmitText: { fontSize: 12, color: colors.cream, fontWeight: "700" },
  commentSubmittedText: { fontSize: 12, color: colors.muted, marginTop: 8, fontStyle: "italic" },
});