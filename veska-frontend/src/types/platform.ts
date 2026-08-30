import type {
  TenantAISettings,
  TenantLimits,
  TenantPlan,
  TenantStatus,
} from "@/types/tenants";

export type PlatformTenantStatus = Exclude<
  TenantStatus,
  "deleted"
>;

export type PlatformTenantListItem = {
  id: string;
  name: string;
  slug: string;
  status: PlatformTenantStatus;
  plan: TenantPlan;
  ai_settings: TenantAISettings;
  users_count: number;
  active_users_count: number;
  documents_count: number;
  ready_documents_count: number;
  error_documents_count: number;
  storage_used_gb: number;
  monthly_queries: number;
  recent_errors: number;
  limits: TenantLimits;
};

export type PlatformMetric = {
  label: string;
  value: string;
  description: string;
};
