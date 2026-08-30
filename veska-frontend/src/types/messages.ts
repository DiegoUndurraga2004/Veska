export type MessageRole =
  | "user"
  | "assistant"
  | "system";

export type MessageFeedbackType =
  | "helpful"
  | "not_helpful"
  | "problematic";

export type MessageSource = {
  id: string;
  document_id: string;
  document_name: string;
  space_id: string;
  space_path: string;
  page_number: number | null;
  sheet_name: string | null;
  cell_range: string | null;
  snippet: string;
  score: number;
};

export type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  created_at: string;
  sources?: MessageSource[];
  feedback?: MessageFeedbackType | null;
};
