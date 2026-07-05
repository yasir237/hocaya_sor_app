import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { AxiosError } from "axios";
import { useAuth } from "../context/AuthContext";
import { fatwaApi } from "../api/fatwaApi";
import { extractErrorMessage } from "../types/auth";
import type { Conversation, FeedbackType } from "../types/fatwa";
import type { ChatMessage } from "../types/chat";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AppStackParamList } from "../navigation/types";
import { colors } from "../theme";
import { makeId } from "../utils/id";
import ConversationDrawer from "../components/ConversationDrawer";
import MessageBubble from "../components/MessageBubble";
import EmptyState from "../components/EmptyState";
import InputBar from "../components/InputBar";

type Props = NativeStackScreenProps<AppStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const { logout } = useAuth();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Drawer'ın açık/kapalı animasyonu — 0: kapalı, 1: açık.
  const drawerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(drawerAnim, {
      toValue: menuOpen ? 1 : 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [menuOpen]);

  const refreshConversations = async () => {
    setLoadingConversations(true);
    try {
      const list = await fatwaApi.listConversations();
      setConversations(list);
    } catch {
      // Sessizce yok say; drawer boş görünür, kritik bir akış değil.
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    refreshConversations();
  }, []);

  const scrollToEnd = () => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  const handleCopy = async (msgId: string, text: string) => {
    await Clipboard.setStringAsync(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId((current) => (current === msgId ? null : current)), 1500);
  };

  const handleNewChat = () => {
    setMessages([]);
    setConversationId(null);
    setMenuOpen(false);
  };

  const handleSelectConversation = async (conv: Conversation) => {
    setMenuOpen(false);
    setLoadingHistory(true);
    try {
      const history = await fatwaApi.getConversationMessages(conv.id);
      const loaded: ChatMessage[] = history.flatMap((m) => [
        { id: makeId(), role: "user", text: m.question } as ChatMessage,
        {
          id: makeId(),
          role: "assistant",
          text: m.answer,
          sources: m.sources,
          logId: m.log_id,
          feedback: m.feedback,
          sourcesExpanded: false,
          comment: m.comment,
          showCommentInput: false,
          commentDraft: "",
        } as ChatMessage,
      ]);
      setMessages(loaded);
      setConversationId(conv.id);
      scrollToEnd();
    } catch {
      setMessages([{ id: makeId(), role: "error", text: "Sohbet geçmişi yüklenemedi, tekrar dene." }]);
    } finally {
      setLoadingHistory(false);
    }
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

    const wasNewConversation = conversationId === null;

    try {
      const response = await fatwaApi.ask(trimmed, conversationId ?? undefined);
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
      if (wasNewConversation) {
        setConversationId(response.conversation_id);
        refreshConversations();
      }
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
      prev.map((m) => (m.id === msgId && m.role === "assistant" ? { ...m, showCommentInput: false } : m))
    );
  };

  const toggleSources = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.role === "assistant" ? { ...m, sourcesExpanded: !m.sourcesExpanded } : m
      )
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.night} />

      {/* ---- Üst bar ---- */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <Pressable onPress={() => setMenuOpen(true)} hitSlop={10} style={styles.iconButton}>
            <Ionicons name="menu-outline" size={22} color={colors.cream} />
          </Pressable>
          <View style={styles.brandIcon}>
            <Ionicons name="book-outline" size={16} color={colors.gold} />
          </View>
          <Text style={styles.brandText}>Hocaya Sor</Text>
        </View>
        <View style={styles.topBarActions}>
          <Pressable onPress={() => navigation.navigate("Profile")} hitSlop={10} style={styles.iconButton}>
            <Ionicons name="person-circle-outline" size={22} color={colors.muted} />
          </Pressable>
          <Pressable onPress={logout} hitSlop={10} style={styles.iconButton}>
            <Ionicons name="log-out-outline" size={20} color={colors.muted} />
          </Pressable>
        </View>
      </View>

      <ConversationDrawer
        open={menuOpen}
        anim={drawerAnim}
        conversations={conversations}
        activeConversationId={conversationId}
        loading={loadingConversations}
        onClose={() => setMenuOpen(false)}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.body}>
          {loadingHistory || messages.length === 0 ? (
            <EmptyState loading={loadingHistory} onSuggestionPress={handleAsk} />
          ) : (
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <MessageBubble
                  message={item}
                  copied={copiedId === item.id}
                  onCopy={handleCopy}
                  onFeedback={handleFeedback}
                  onToggleSources={toggleSources}
                  onCommentDraftChange={handleCommentDraftChange}
                  onSubmitComment={handleSubmitComment}
                  onDismissComment={handleDismissComment}
                />
              )}
              contentContainerStyle={styles.chatContent}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={scrollToEnd}
            />
          )}

          <InputBar value={question} onChangeText={setQuestion} onSend={() => handleAsk()} sending={sending} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.night },
  flex: { flex: 1 },

  topBar: {
    backgroundColor: colors.night,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 54 : 18,
    paddingBottom: 18,
    zIndex: 5,
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
  topBarActions: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconButton: { padding: 4 },

  body: {
    flex: 1,
    backgroundColor: colors.cream,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },

  chatContent: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 10, gap: 14 },
});