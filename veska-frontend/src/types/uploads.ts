import type { DocumentFileType } from "@/types/documents";

export type UploadQueueStatus =
  | "queued"
  | "rejected"
  | "uploading"
  | "uploaded"
  | "processing"
  | "ready"
  | "error";

export type UploadValidationErrorCode =
  | "unsupported_extension"
  | "empty_file"
  | "file_too_large"
  | "invalid_relative_path";

export type UploadQueueError = {
  code: UploadValidationErrorCode | "upload_failed" | "processing_failed";
  message: string;
};

export type UploadQueueItem = {
  local_id: string;
  file: File;
  file_name: string;
  file_type: DocumentFileType | null;
  file_size: number;
  space_id: string | null;
  relative_path: string | null;
  status: UploadQueueStatus;
  progress: number;
  error: UploadQueueError | null;
  document_id: string | null;
};

export type UploadQueueSummary = {
  total: number;
  queued: number;
  uploading: number;
  uploaded: number;
  processing: number;
  ready: number;
  rejected: number;
  error: number;
};
