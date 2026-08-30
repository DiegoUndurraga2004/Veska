import type { ChatMessage } from "@/types/messages";

export type ChatScope =
  | "all_accessible_spaces"
  | "selected_spaces"
  | "selected_documents";

export type ChatListItem = {
  id: string;
  title: string;
  scope: ChatScope;
  created_by: {
    id: string;
    name: string | null;
  };
  created_at: string;
  updated_at: string;
};

export type ChatDetail = ChatListItem & {
  space_ids: string[];
  document_ids: string[];
  messages: ChatMessage[];
};

export type ChatCreateInput = {
  title: string;
  scope: ChatScope;
  space_ids: string[];
  document_ids: string[];
};

export type ChatMessageInput = {
  content: string;
  scope: ChatScope;
  space_ids: string[];
  document_ids: string[];
};
