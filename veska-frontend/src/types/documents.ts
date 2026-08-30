import type { SpaceSummary } from "@/types/spaces";

export type DocumentStatus =
  | "uploaded"
  | "processing"
  | "ready"
  | "error"
  | "deleted";

export type DocumentFileType =
  | "pdf"
  | "docx"
  | "txt"
  | "xlsx"
  | "csv";

export type DocumentSourceType =
  | "upload"
  | "external_sync";

export type DocumentListItem = {
  id: string;
  tenant_id: string;
  file_name: string;
  file_type: DocumentFileType;
  mime_type: string;
  file_size: number;
  space_id: string;
  space: SpaceSummary;
  relative_path: string;
  source_type: DocumentSourceType;
  status: DocumentStatus;
  uploaded_by: {
    id: string;
    name: string | null;
  };
  page_count: number | null;
  sheet_count: number | null;
  text_length: number | null;
  created_at: string;
  updated_at: string;
};

export type DocumentDetail = DocumentListItem & {
  version: number;
  last_processed_at: string | null;
  error_message: string | null;
  extracted_text: string | null;
};
