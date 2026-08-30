export type BulkImportJobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type BulkImportSuggestedSpace = {
  name: string;
  path: string;
  files_count: number;
};

export type BulkImportJob = {
  id: string;
  tenant_id: string;
  status: BulkImportJobStatus;
  files_received: number;
  files_ready: number;
  files_error: number;
  spaces_suggested: BulkImportSuggestedSpace[];
  created_at: string;
  updated_at: string;
  created_by: string;
};
