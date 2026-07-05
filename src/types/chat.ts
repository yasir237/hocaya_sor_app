import type { FatwaSource, FeedbackType } from "./fatwa";

export type ChatMessage =
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

export type AssistantMessage = Extract<ChatMessage, { role: "assistant" }>;