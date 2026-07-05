export interface FatwaSource {
  id: string;
  question: string;
  answer: string;
  main_category: string;
  source_dataset: string;
  source_url: string;
}
export interface AskRequest {
  conversation_id?: string;
  question: string;
  top_k?: number;
}
export interface AskResponse {
  conversation_id: string;
  log_id: string;
  question: string;
  answer: string;
  sources: FatwaSource[];
}
export type FeedbackType = "like" | "dislike";
export interface FeedbackRequest {
  feedback: FeedbackType;
  comment?: string | null;
}
export interface FeedbackResponse {
  question_log_id: string;
  feedback: FeedbackType;
  comment?: string | null;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  log_id: string;
  question: string;
  answer: string;
  sources: FatwaSource[];
  feedback: FeedbackType | null;
  comment: string | null;
  created_at: string;
}