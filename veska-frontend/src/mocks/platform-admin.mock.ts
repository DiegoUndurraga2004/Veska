import { mockTenant } from "@/mocks/tenants.mock";
import type {
  PlatformMetric,
  PlatformTenantListItem,
} from "@/types/platform";

export const platformTenantStatusLabels: Record<
  PlatformTenantListItem["status"],
  string
> = {
  active: "Activa",
  trial: "Piloto",
  inactive: "Inactiva",
  suspended: "Suspendida",
};

export const platformTenantProviderLabels: Record<
  PlatformTenantListItem["ai_settings"]["provider"],
  string
> = {
  openai: "OpenAI API",
  runpod: "Runpod privado",
};

export const platformTenantPrivacyLabels: Record<
  PlatformTenantListItem["ai_settings"]["privacy_tier"],
  string
> = {
  standard: "Estándar",
  private: "Privado",
};

export const mockPlatformTenants: PlatformTenantListItem[] = [
  {
    id: mockTenant.id,
    name: mockTenant.name,
    slug: mockTenant.slug,
    status: "active",
    plan: {
      id: "99999999-9999-4999-8999-999999999991",
      name: "Plan piloto",
    },
    ai_settings: {
      provider: "openai",
      privacy_tier: "standard",
      model_name: "gpt-4o-mini",
      enabled: true,
    },
    users_count: 18,
    active_users_count: 15,
    documents_count: 1240,
    ready_documents_count: 1188,
    error_documents_count: 14,
    storage_used_gb: 186.4,
    monthly_queries: 12400,
    recent_errors: 3,
    limits: {
      max_users: 25,
      max_documents: 5000,
      max_storage_gb: 250,
      max_requests_month: 20000,
      max_file_size_mb: 25,
      max_bulk_import_files: 5000,
      max_bulk_import_total_size_mb: 2048,
    },
  },
  {
    id: "11111111-1111-4111-8111-111111111112",
    name: "Andina Legal",
    slug: "andina-legal",
    status: "active",
    plan: {
      id: "99999999-9999-4999-8999-999999999992",
      name: "Plan enterprise",
    },
    ai_settings: {
      provider: "runpod",
      privacy_tier: "private",
      model_name: "mistral-large-instruct",
      enabled: true,
    },
    users_count: 42,
    active_users_count: 38,
    documents_count: 9320,
    ready_documents_count: 9184,
    error_documents_count: 11,
    storage_used_gb: 812.7,
    monthly_queries: 52400,
    recent_errors: 11,
    limits: {
      max_users: 100,
      max_documents: 25000,
      max_storage_gb: 1000,
      max_requests_month: 100000,
      max_file_size_mb: 50,
      max_bulk_import_files: 10000,
      max_bulk_import_total_size_mb: 4096,
    },
  },
  {
    id: "11111111-1111-4111-8111-111111111113",
    name: "Cobresur Servicios",
    slug: "cobresur",
    status: "trial",
    plan: {
      id: "99999999-9999-4999-8999-999999999993",
      name: "Plan prueba",
    },
    ai_settings: {
      provider: "openai",
      privacy_tier: "standard",
      model_name: "gpt-4.1-mini",
      enabled: true,
    },
    users_count: 9,
    active_users_count: 8,
    documents_count: 560,
    ready_documents_count: 527,
    error_documents_count: 4,
    storage_used_gb: 48.2,
    monthly_queries: 3900,
    recent_errors: 2,
    limits: {
      max_users: 15,
      max_documents: 1000,
      max_storage_gb: 100,
      max_requests_month: 5000,
      max_file_size_mb: 20,
      max_bulk_import_files: 1000,
      max_bulk_import_total_size_mb: 512,
    },
  },
  {
    id: "11111111-1111-4111-8111-111111111114",
    name: "Boreal Servicios",
    slug: "boreal-servicios",
    status: "inactive",
    plan: {
      id: "99999999-9999-4999-8999-999999999994",
      name: "Plan legado",
    },
    ai_settings: {
      provider: "openai",
      privacy_tier: "standard",
      model_name: "gpt-4o-mini",
      enabled: false,
    },
    users_count: 12,
    active_users_count: 0,
    documents_count: 430,
    ready_documents_count: 408,
    error_documents_count: 0,
    storage_used_gb: 22.0,
    monthly_queries: 800,
    recent_errors: 0,
    limits: {
      max_users: 10,
      max_documents: 500,
      max_storage_gb: 50,
      max_requests_month: 2000,
      max_file_size_mb: 15,
      max_bulk_import_files: 500,
      max_bulk_import_total_size_mb: 256,
    },
  },
  {
    id: "11111111-1111-4111-8111-111111111115",
    name: "Norte Industrial",
    slug: "norte-industrial",
    status: "suspended",
    plan: {
      id: "99999999-9999-4999-8999-999999999995",
      name: "Plan privado",
    },
    ai_settings: {
      provider: "runpod",
      privacy_tier: "private",
      model_name: "llama-3.1-70b",
      enabled: true,
    },
    users_count: 27,
    active_users_count: 19,
    documents_count: 2140,
    ready_documents_count: 2080,
    error_documents_count: 9,
    storage_used_gb: 124.1,
    monthly_queries: 7800,
    recent_errors: 6,
    limits: {
      max_users: 30,
      max_documents: 2500,
      max_storage_gb: 150,
      max_requests_month: 10000,
      max_file_size_mb: 30,
      max_bulk_import_files: 2000,
      max_bulk_import_total_size_mb: 1024,
    },
  },
];

function sumBy(
  selector: (tenant: PlatformTenantListItem) => number,
) {
  return mockPlatformTenants.reduce(
    (total, tenant) => total + selector(tenant),
    0,
  );
}

export const mockPlatformMetrics: PlatformMetric[] = [
  {
    label: "Empresas activas",
    value: String(
      mockPlatformTenants.filter((tenant) => tenant.status === "active")
        .length,
    ),
    description: "Tenants con operación habilitada",
  },
  {
    label: "Usuarios totales",
    value: String(sumBy((tenant) => tenant.users_count)),
    description: "Usuarios administrados en mocks locales",
  },
  {
    label: "Documentos procesados",
    value: String(
      sumBy(
        (tenant) =>
          tenant.ready_documents_count + tenant.error_documents_count,
      ),
    ),
    description: "Documentos listos o con error de procesamiento",
  },
  {
    label: "Storage utilizado",
    value: `${sumBy((tenant) => tenant.storage_used_gb).toLocaleString(
      "es-CL",
      {
        maximumFractionDigits: 1,
      },
    )} GB`,
    description: "Uso agregado de almacenamiento simulado",
  },
  {
    label: "Consultas del mes",
    value: String(sumBy((tenant) => tenant.monthly_queries)),
    description: "Volumen mensual de consultas al RAG",
  },
  {
    label: "Errores recientes",
    value: String(sumBy((tenant) => tenant.recent_errors)),
    description: "Incidencias registradas en los últimos ciclos",
  },
];
