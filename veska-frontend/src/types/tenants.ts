export type TenantAIProvider =
  | "openai"
  | "runpod";

export type TenantPrivacyTier =
  | "standard"
  | "private";

export type TenantAISettings = {
  provider: TenantAIProvider;
  privacy_tier: TenantPrivacyTier;
  model_name: string;
  enabled: boolean;
};

export type TenantStatus =
  | "active"
  | "inactive"
  | "trial"
  | "suspended"
  | "deleted";

export type TenantPlan = {
  id: string;
  name: string;
};

export type TenantLimits = {
  max_users: number;
  max_documents: number;
  max_storage_gb: number;
  max_requests_month: number;
  max_file_size_mb: number;
  max_bulk_import_files: number;
  max_bulk_import_total_size_mb: number;
};

export type TenantCurrent = {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  plan: TenantPlan;
  limits: TenantLimits;
  ai_settings: TenantAISettings;
};
