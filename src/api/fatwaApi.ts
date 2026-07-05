import { apiClient } from "./client";
import {
  AskResponse,
  Conversation,
  ConversationMessage,
  FeedbackResponse,
  FeedbackType,
} from "../types/fatwa";

export const fatwaApi = {
  async ask(question: string, conversationId?: string, topK = 5): Promise<AskResponse> {
    const { data } = await apiClient.post<AskResponse>("/fatwa/ask", {
      question,
      top_k: topK,
      ...(conversationId ? { conversation_id: conversationId } : {}),
    });
    return data;
  },
  async sendFeedback(
    logId: string,
    feedback: FeedbackType,
    comment?: string
  ): Promise<FeedbackResponse> {
    const { data } = await apiClient.post<FeedbackResponse>(`/fatwa/feedback/${logId}`, {
      feedback,
      ...(comment !== undefined ? { comment } : {}),
    });
    return data;
  },
  async listConversations(): Promise<Conversation[]> {
    const { data } = await apiClient.get<Conversation[]>("/conversations");
    return data;
  },
  async getConversationMessages(conversationId: string): Promise<ConversationMessage[]> {
    const { data } = await apiClient.get<ConversationMessage[]>(
      `/conversations/${conversationId}/messages`
    );
    return data;
  },
};