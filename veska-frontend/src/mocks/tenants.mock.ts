import type { TenantCurrent } from "@/types/tenants";

export const mockTenantId =
  "11111111-1111-4111-8111-111111111111";

export const mockTenant: TenantCurrent = {
  id: mockTenantId,
  name: "Empresa Demo",
  slug: "empresa-demo",
  status: "active",
  plan: {
    id: "99999999-9999-4999-8999-999999999991",
    name: "Plan piloto",
  },
  limits: {
    max_users: 25,
    max_documents: 5000,
    max_storage_gb: 250,
    max_requests_month: 20000,
    max_file_size_mb: 25,
    max_bulk_import_files: 5000,
    max_bulk_import_total_size_mb: 2048,
  },
  ai_settings: {
    provider: "openai",
    privacy_tier: "standard",
    model_name: "gpt-4o-mini",
    enabled: true,
  },
};

export const mockTenantAiSettings =
  mockTenant.ai_settings;
