import type { AuthProvider, UserRole } from "@/types/auth";
import type { DocumentFileType, DocumentStatus } from "@/types/documents";

export type PlatformSetupPlan = "piloto" | "estandar" | "privado";

export type PlatformSetupTenantStatus = "trial" | "inactive" | "active";

export type PlatformSetupAIProvider = "openai" | "runpod";

export type PlatformSetupPrivacyTier = "standard" | "private";

export type PlatformSetupBulkImportSource = "folder" | "zip";

export type PlatformSetupBulkImportFileStatus = "valid" | "error";

export type PlatformSetupBulkImportFile = {
  id: string;
  name: string;
  relative_path: string;
  size: number;
  extension: string;
  status: PlatformSetupBulkImportFileStatus;
  error: string | null;
};

export type PlatformSetupProcessingStatus =
  | "idle"
  | "running"
  | "completed"
  | "completed_with_errors"
  | "no_documents";

export type PlatformSetupProcessingFile = {
  id: string;
  source_file_id: string;
  file_name: string;
  relative_path: string;
  file_type: DocumentFileType;
  size: number;
  status: Exclude<DocumentStatus, "deleted">;
  error_message: string | null;
  attempts: number;
  should_fail_initially: boolean;
};

export type PlatformSetupBulkImportDraft = {
  source: PlatformSetupBulkImportSource | null;
  zip_file_name: string | null;
  files: PlatformSetupBulkImportFile[];
  total_size: number;
};

export type PlatformSetupSuggestedSpace = {
  id: string;
  name: string;
  path: string;
  parent_id: string | null;
  enabled: boolean;
  files_count: number;
};

export type PlatformSetupSpacePermissionTargetType = "group" | "user";

export type PlatformSetupSpacePermissionSource = "direct" | "override";

export type PlatformSetupSpacePermissionAccessLevel =
  | "read"
  | "write"
  | "manage";

export type PlatformSetupSpacePermission = {
  id: string;
  space_id: string;
  target_type: PlatformSetupSpacePermissionTargetType;
  group_id: string | null;
  user_id: string | null;
  access_level: PlatformSetupSpacePermissionAccessLevel;
  source: PlatformSetupSpacePermissionSource;
};

export type PlatformSetupActivationChecklistItemStatus =
  | "completed"
  | "pending"
  | "requires_review";

export type PlatformSetupActivationChecklistItem = {
  id: string;
  label: string;
  status: PlatformSetupActivationChecklistItemStatus;
  detail: string | null;
};

export type PlatformSetupInitialUserRole = Extract<
  UserRole,
  "company_admin" | "company_user" | "read_only"
>;

export type PlatformSetupInitialUserSource = "manual" | "csv";

export type PlatformSetupInitialUser = {
  id: string;
  name: string;
  email: string;
  role: PlatformSetupInitialUserRole;
  auth_provider: AuthProvider;
  source: PlatformSetupInitialUserSource;
};

export type PlatformSetupInitialUserInput = {
  name: string;
  email: string;
  role: PlatformSetupInitialUserRole;
  auth_provider: AuthProvider;
};

export type PlatformSetupCsvRowError = {
  row_number: number;
  raw: {
    name: string;
    email: string;
    role: string;
    auth_provider: string;
  };
  errors: string[];
};

export type PlatformSetupCsvPreview = {
  file_name: string;
  total_rows: number;
  valid_rows: PlatformSetupInitialUser[];
  invalid_rows: PlatformSetupCsvRowError[];
};

export type PlatformSetupCompanyInput = {
  name: string;
  slug: string;
  plan: PlatformSetupPlan;
  status: PlatformSetupTenantStatus;
};

export type PlatformSetupAIInput = {
  provider: PlatformSetupAIProvider;
  privacy_tier: PlatformSetupPrivacyTier;
  model_name: string;
  enabled: boolean;
};

export type PlatformSetupInitialAdminInput = {
  id: string;
  full_name: string;
  email: string;
  access_provider: AuthProvider;
  role: "company_admin";
};

export type PlatformSetupInitialGroup = {
  id: string;
  name: string;
  description: string | null;
  member_ids: string[];
};

export type PlatformSetupInitialGroupInput = {
  name: string;
  description: string;
};

export type PlatformSetupInitialGroupParticipantSource =
  | "initial_admin"
  | PlatformSetupInitialUserSource;

export type PlatformSetupInitialGroupParticipant = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  auth_provider: AuthProvider;
  source: PlatformSetupInitialGroupParticipantSource;
};

export type PlatformSetupDraft = {
  company: PlatformSetupCompanyInput;
  ai: PlatformSetupAIInput;
  initial_admin: PlatformSetupInitialAdminInput;
  initial_users: PlatformSetupInitialUser[];
  initial_groups: PlatformSetupInitialGroup[];
  bulk_import: PlatformSetupBulkImportDraft;
  suggested_spaces: PlatformSetupSuggestedSpace[];
  space_permissions: PlatformSetupSpacePermission[];
};

export type PlatformSetupActivationResult = {
  local_tenant_id: string;
  created_at: string;
  status: PlatformSetupTenantStatus;
  mode: "activated" | "finalized_without_activation";
  draft: PlatformSetupDraft;
  processing_status: PlatformSetupProcessingStatus;
  processing_files: PlatformSetupProcessingFile[];
  activation_checklist: PlatformSetupActivationChecklistItem[];
  metrics: {
    documents_ready: number;
    documents_with_validation_errors: number;
    documents_with_processing_errors: number;
    active_spaces: number;
    permissions_configured: number;
    errors_ignored_or_removed: number;
  };
};

export type PlatformSetupResult = PlatformSetupActivationResult;
