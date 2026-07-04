import { apiClient } from "./client";
import { AskResponse, FeedbackResponse, FeedbackType } from "../types/fatwa";

export const fatwaApi = {
  async ask(question: string, topK = 5): Promise<AskResponse> {
    const { data } = await apiClient.post<AskResponse>("/fatwa/ask", {
      question,
      top_k: topK,
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
};