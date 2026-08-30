import type { ChatListItem } from "@/types/chats";
import type { DocumentListItem } from "@/types/documents";

export type DashboardAlertType = "info" | "warning" | "error";

export type DashboardAlert = {
  id: string;
  type: DashboardAlertType;
  title: string;
  description: string;
  href?: string;
};

export type DashboardSummary = {
  documents_count: number;
  chats_count: number;
  processing_documents_count: number;
};

export type DashboardData = {
  summary: DashboardSummary;
  recent_chats: ChatListItem[];
  recent_documents: DocumentListItem[];
  processing_documents: DocumentListItem[];
  alerts: DashboardAlert[];
};
