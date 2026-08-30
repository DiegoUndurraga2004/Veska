import { mockRecentChats } from "@/mocks/chats.mock";
import {
  mockProcessingDocuments,
  mockRecentReadyDocuments,
} from "@/mocks/documents.mock";
import type { DashboardData } from "@/types/dashboard";

export const mockDashboardData: DashboardData = {
  summary: {
    documents_count: 142,
    chats_count: 36,
    processing_documents_count: mockProcessingDocuments.length,
  },

  recent_chats: mockRecentChats,

  recent_documents: mockRecentReadyDocuments,

  processing_documents: mockProcessingDocuments,

  alerts: [
    {
      id: "55555555-5555-4555-8555-555555555551",
      type: "info",
      title: "Hay documentos en procesamiento",
      description: `${mockProcessingDocuments.length} documentos todavía no están disponibles como fuente para consultas.`,
      href: "/documents",
    },
  ],
};
