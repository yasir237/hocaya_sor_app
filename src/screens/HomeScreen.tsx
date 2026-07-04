import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { AxiosError } from "axios";
import { useAuth } from "../context/AuthContext";
import { fatwaApi } from "../api/fatwaApi";
import { extractErrorMessage } from "../types/auth";
import type { FatwaSource, FeedbackType } from "../types/fatwa";
import { colors } from "../theme";


const SUGGESTIONS = ["Faiz haram mı?", "Zekat nasıl hesaplanır?", "Oruç kimlere farz değildir?"];

type ChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "loading" }
  | { id: string; role: "error"; text: string }
  | {
      id: string;
      role: "assistant";
      text: string;
      sources: FatwaSource[];
      logId: string;
      feedback: FeedbackType | null;
      sourcesExpanded: boolean;
      comment: string | null;
      showCommentInput: boolean;
      commentDraft: string;
    };

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function HomeScreen() {
  const { logout } = useAuth();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const handleCopy = async (msgId: string, text: string) => {
    await Clipboard.setStringAsync(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId((current) => (current === msgId ? null : current)), 1500);
  };

  const scrollToEnd = () => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  const handleAsk = async (overrideText?: string) => {
    const trimmed = (overrideText ?? question).trim();
    if (trimmed.length < 3 || sending) return;

    const userMsg: ChatMessage = { id: makeId(), role: "user", text: trimmed };
    const loadingMsg: ChatMessage = { id: makeId(), role: "loading" };
    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setQuestion("");
    setSending(true);
    scrollToEnd();

    try {
      const response = await fatwaApi.ask(trimmed);
      setMessages((prev) =>
  prev.map((m) =>
    m.id === loadingMsg.id
      ? {
          id: makeId(),
          role: "assistant",
          text: response.answer,
          sources: response.sources,
          logId: response.log_id,
          feedback: null,
          sourcesExpanded: false,
          comment: null,
          showCommentInput: false,
          commentDraft: "",
        }
      : m
  )
);
    } catch (err) {
      const axiosErr = err as AxiosError;
      const status = axiosErr.response?.status;
      const fallback =
        status === 404
          ? "Bu soruyla ilgili bir fetva bulunamadı. Farklı bir şekilde sormayı dener misin?"
          : status === 503
          ? "Sunucu şu an yanıt veremiyor, birazdan tekrar dene."
          : status === 429
          ? "Çok sık soru gönderdin, biraz bekle."
          : "Soru gönderilirken bir hata oluştu.";
      const message = extractErrorMessage(axiosErr.response?.data, fallback);
      setMessages((prev) =>
        prev.map((m) => (m.id === loadingMsg.id ? { id: makeId(), role: "error", text: message } : m))
      );
    } finally {
      setSending(false);
      scrollToEnd();
    }
  };

  const handleFeedback = async (msgId: string, logId: string, type: FeedbackType) => {
  setMessages((prev) =>
    prev.map((m) =>
      m.id === msgId && m.role === "assistant"
        ? { ...m, feedback: type, showCommentInput: type === "dislike" }
        : m
    )
  );
  try {
    await fatwaApi.sendFeedback(logId, type);
  } catch {
    // Feedback göndermek kritik bir işlem değil; sessizce yok say.
  }
};

const handleCommentDraftChange = (msgId: string, text: string) => {
  setMessages((prev) =>
    prev.map((m) => (m.id === msgId && m.role === "assistant" ? { ...m, commentDraft: text } : m))
  );
};

const handleSubmitComment = async (msgId: string, logId: string) => {
  const target = messages.find((m) => m.id === msgId);
  if (!target || target.role !== "assistant") return;
  const trimmed = target.commentDraft.trim();

  setMessages((prev) =>
    prev.map((m) =>
      m.id === msgId && m.role === "assistant"
        ? { ...m, showCommentInput: false, comment: trimmed || null }
        : m
    )
  );

  if (!trimmed) return;
  try {
    await fatwaApi.sendFeedback(logId, "dislike", trimmed);
  } catch {
    // Sessizce yok say.
  }
};

const handleDismissComment = (msgId: string) => {
  setMessages((prev) =>
    prev.map((m) =>
      m.id === msgId && m.role === "assistant" ? { ...m, showCommentInput: false } : m
    )
  );
};

  const toggleSources = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.role === "assistant" ? { ...m, sourcesExpanded: !m.sourcesExpanded } : m
      )
    );
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    if (item.role === "user") {
      return (
        <View style={styles.userRow}>
          <Pressable
            style={styles.userBubble}
            onLongPress={() => handleCopy(item.id, item.text)}
            delayLongPress={350}
          >
            <Text style={styles.userText}>{item.text}</Text>
            {copiedId === item.id && (
              <View style={styles.copiedBadgeDark}>
                <Ionicons name="checkmark" size={11} color={colors.night} />
                <Text style={styles.copiedBadgeDarkText}>Kopyalandı</Text>
              </View>
            )}
          </Pressable>
        </View>
      );
    }

    if (item.role === "loading") {
      return (
        <View style={styles.assistantRow}>
          <View style={styles.avatar}>
            <Ionicons name="book-outline" size={14} color={colors.gold} />
          </View>
          <View style={[styles.assistantBubble, styles.typingBubble]}>
            <ActivityIndicator size="small" color={colors.goldDeep} />
            <Text style={styles.typingText}>düşünüyor...</Text>
          </View>
        </View>
      );
    }

    if (item.role === "error") {
      return (
        <View style={styles.assistantRow}>
          <View style={styles.avatar}>
            <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
          </View>
          <View style={[styles.assistantBubble, styles.errorBubble]}>
            <Text style={styles.errorText}>{item.text}</Text>
          </View>
        </View>
      );
    }

    // assistant
    return (
      <View>
        <View style={styles.assistantRow}>
          <View style={styles.avatar}>
            <Ionicons name="book-outline" size={14} color={colors.gold} />
          </View>
          <View style={styles.assistantBubble}>
            <Pressable onLongPress={() => handleCopy(item.id, item.text)} delayLongPress={350}>
              <Text style={styles.assistantText}>{item.text}</Text>
              {copiedId === item.id && (
                <View style={styles.copiedBadgeLight}>
                  <Ionicons name="checkmark" size={11} color={colors.goldDeep} />
                  <Text style={styles.copiedBadgeLightText}>Kopyalandı</Text>
                </View>
              )}
            </Pressable>

            <View style={styles.bubbleFooter}>
              <View style={styles.feedbackRow}>
                <Pressable
                  style={[styles.feedbackPill, item.feedback === "like" && styles.feedbackPillActive]}
                  onPress={() => handleFeedback(item.id, item.logId, "like")}
                >
                  <Ionicons
                    name={item.feedback === "like" ? "thumbs-up" : "thumbs-up-outline"}
                    size={14}
                    color={item.feedback === "like" ? colors.nightDeep : colors.muted}
                  />
                </Pressable>
                <Pressable
                  style={[styles.feedbackPill, item.feedback === "dislike" && styles.feedbackPillActive]}
                  onPress={() => handleFeedback(item.id, item.logId, "dislike")}
                >
                  <Ionicons
                    name={item.feedback === "dislike" ? "thumbs-down" : "thumbs-down-outline"}
                    size={14}
                    color={item.feedback === "dislike" ? colors.nightDeep : colors.muted}
                  />
                </Pressable>
              </View>

      

{!item.showCommentInput && item.comment && (
  <Text style={styles.commentSubmittedText}>Yorumun: {item.comment}</Text>
)}

              {item.sources.length > 0 && (
                <Pressable style={styles.sourcesToggle} onPress={() => toggleSources(item.id)}>
                  <Ionicons name="document-text-outline" size={13} color={colors.goldDeep} />
                  <Text style={styles.sourcesToggleText}>{item.sources.length} kaynak</Text>
                  <Ionicons
                    name={item.sourcesExpanded ? "chevron-up" : "chevron-down"}
                    size={13}
                    color={colors.goldDeep}
                  />
                </Pressable>
              )}
            </View>
                    {item.showCommentInput && (
  <View style={styles.commentBox}>
    <TextInput
      style={styles.commentInput}
      placeholder="Neden beğenmedin? (opsiyonel)"
      placeholderTextColor="#A8B3AC"
      value={item.commentDraft}
      onChangeText={(text) => handleCommentDraftChange(item.id, text)}
      multiline
      maxLength={1000}
    />
    <View style={styles.commentActions}>
      <Pressable onPress={() => handleDismissComment(item.id)} hitSlop={6}>
        <Text style={styles.commentDismissText}>Vazgeç</Text>
      </Pressable>
      <Pressable
        style={styles.commentSubmitButton}
        onPress={() => handleSubmitComment(item.id, item.logId)}
      >
        <Text style={styles.commentSubmitText}>Gönder</Text>
      </Pressable>
    </View>
  </View>
)}
          </View>
        </View>

        {item.sourcesExpanded && item.sources.length > 0 && (
          <View style={styles.sourcesContainer}>
            {item.sources.map((source) => (
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
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.night} />

      {/* ---- Üst bar ---- */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Ionicons name="book-outline" size={16} color={colors.gold} />
          </View>
          <Text style={styles.brandText}>Hocaya Sor</Text>
        </View>
        <Pressable onPress={logout} hitSlop={10} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color={colors.muted} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.body}>
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyNiche}>
                <Ionicons name="book-outline" size={30} color={colors.gold} />
              </View>
              <Text style={styles.emptyTitle}>Bugün ne sormak istersin?</Text>
              <Text style={styles.emptySubtitle}>
                Diyanet fetvalarına dayanan, kaynaklı cevaplar al.
              </Text>
              <View style={styles.chipsWrap}>
                {SUGGESTIONS.map((s) => (
                  <Pressable key={s} style={styles.chip} onPress={() => handleAsk(s)}>
                    <Text style={styles.chipText}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              contentContainerStyle={styles.chatContent}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={scrollToEnd}
            />
          )}

          {/* ---- Alt yazma çubuğu ---- */}
          <View style={styles.inputBar}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Sorunu yaz..."
                placeholderTextColor="#A8B3AC"
                value={question}
                onChangeText={setQuestion}
                multiline
                maxLength={1000}
              />
            </View>
            <Pressable onPress={() => handleAsk()} disabled={sending || question.trim().length < 3}>
              {({ pressed }) => (
                <View style={styles.sendButtonBase}>
                  <View
                    style={[
                      styles.sendButtonTop,
                      pressed && styles.sendButtonTopPressed,
                      (sending || question.trim().length < 3) && styles.sendButtonDisabled,
                    ]}
                  >
                    <Ionicons name="arrow-up" size={20} color={colors.nightDeep} />
                  </View>
                </View>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.night },
  flex: { flex: 1 },

  // ---- Üst bar ----
  topBar: {
    backgroundColor: colors.night,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 54 : 18,
    paddingBottom: 18,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(212,168,83,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: { color: colors.cream, fontSize: 17, fontWeight: "800", letterSpacing: -0.3 },
  logoutButton: { padding: 4 },

  // ---- Gövde ----
  body: {
    flex: 1,
    backgroundColor: colors.cream,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },

  // ---- Boş durum ----
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyNiche: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(212,168,83,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.ink,
    textAlign: "center",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 19,
  },
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

  // ---- Sohbet listesi ----
  chatContent: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 10, gap: 14 },

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

  sourcesContainer: {
    marginLeft: 34,
    marginTop: 8,
    gap: 8,
  },
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

  // ---- Alt yazma çubuğu ----
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 24 : 14,
    borderTopWidth: 1,
    borderTopColor: "#EFEAE0",
    backgroundColor: colors.cream,
  },
  inputWrapper: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E4DFD1",
    borderRadius: 20,
    backgroundColor: "#fff",
    maxHeight: 110,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.ink,
  },

  sendButtonBase: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.goldDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonTop: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateY: -3 }],
  },
  sendButtonTopPressed: {
    transform: [{ translateY: 0 }],
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },



  commentBox: {
  marginTop: 10,
  backgroundColor: "#FAF7F0",
  borderWidth: 1,
  borderColor: "#EFEAE0",
  borderRadius: 12,
  padding: 10,
},
commentInput: {
  fontSize: 13,
  color: colors.ink,
  minHeight: 36,
  maxHeight: 90,
},
commentActions: {
  flexDirection: "row",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: 14,
  marginTop: 8,
},
commentDismissText: {
  fontSize: 12,
  color: colors.muted,
  fontWeight: "600",
},
commentSubmitButton: {
  backgroundColor: colors.goldDeep,
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 6,
},
commentSubmitText: {
  fontSize: 12,
  color: colors.cream,
  fontWeight: "700",
},
commentSubmittedText: {
  fontSize: 12,
  color: colors.muted,
  marginTop: 8,
  fontStyle: "italic",
},
});