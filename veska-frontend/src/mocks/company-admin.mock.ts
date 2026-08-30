import { formatFileSize, formatNumber } from "@/lib/formatters";
import { mockDocuments } from "@/mocks/documents.mock";
import { mockTenant } from "@/mocks/tenants.mock";
import { mockUsers } from "@/mocks/users.mock";
import type { AuthProvider, MembershipStatus, UserRole } from "@/types/auth";
import type { WorkspaceUser } from "@/types/users";

export type CompanyAdminUserRole = Exclude<
  UserRole,
  "platform_admin"
>;

export type CompanyAdminUserStatus = MembershipStatus;

export type CompanyAdminUser = {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  initials: string;
  role: CompanyAdminUserRole;
  status: CompanyAdminUserStatus;
  auth_provider: AuthProvider;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type CompanyAdminMetric = {
  label: string;
  value: string;
  description: string;
};

export const companyAdminRoleLabels: Record<
  CompanyAdminUserRole,
  string
> = {
  company_admin: "Administrador",
  company_user: "Usuario",
  read_only: "Solo lectura",
};

export const companyAdminStatusLabels: Record<
  CompanyAdminUserStatus,
  string
> = {
  active: "Activo",
  pending: "Pendiente",
  inactive: "Desactivado",
};

export const companyAdminAuthProviderLabels: Record<
  AuthProvider,
  string
> = {
  microsoft: "Microsoft",
  google: "Google",
  local: "Contraseña local",
};

export const companyAdminRoleOptions: {
  value: CompanyAdminUserRole;
  label: string;
}[] = [
  { value: "company_admin", label: "Administrador" },
  { value: "company_user", label: "Usuario" },
  { value: "read_only", label: "Solo lectura" },
];

export const companyAdminStatusOptions: {
  value: CompanyAdminUserStatus | "all";
  label: string;
}[] = [
  { value: "all", label: "Todos los estados" },
  { value: "active", label: "Activo" },
  { value: "pending", label: "Pendiente" },
  { value: "inactive", label: "Desactivado" },
];

export const companyAdminUserRoleOptions = companyAdminRoleOptions;

function toCompanyAdminUser(
  user: WorkspaceUser,
): CompanyAdminUser | null {
  if (user.role === "platform_admin") {
    return null;
  }

  return user as CompanyAdminUser;
}

const seedCompanyUsers: CompanyAdminUser[] = mockUsers
  .map(toCompanyAdminUser)
  .filter((user): user is CompanyAdminUser => Boolean(user));

const localSupportUsers: CompanyAdminUser[] = [
  {
    id: "33333333-3333-4333-8333-333333333335",
    tenant_id: mockTenant.id,
    name: "Camila Pendiente",
    email: "camila.pendiente@empresa-demo.cl",
    initials: "CP",
    role: "company_user",
    status: "pending",
    auth_provider: "local",
    avatar_url: null,
    created_at: "2026-06-03T09:20:00Z",
    updated_at: "2026-06-03T09:20:00Z",
  },
  {
    id: "33333333-3333-4333-8333-333333333336",
    tenant_id: mockTenant.id,
    name: "Observador Legal",
    email: "observador.legal@empresa-demo.cl",
    initials: "OL",
    role: "read_only",
    status: "inactive",
    auth_provider: "local",
    avatar_url: null,
    created_at: "2026-06-02T11:10:00Z",
    updated_at: "2026-06-02T11:10:00Z",
  },
];

export const mockCompanyAdminUsers: CompanyAdminUser[] = [
  ...seedCompanyUsers,
  ...localSupportUsers,
];

const activeUsersCount = mockCompanyAdminUsers.filter(
  (user) => user.status === "active",
).length;

const totalStorageBytes = mockDocuments.reduce(
  (total, document) => total + document.file_size,
  0,
);

const recentErrorCount = mockDocuments.filter(
  (document) => document.status === "error",
).length + 1;

const totalDocuments = mockDocuments.filter(
  (document) => document.tenant_id === mockTenant.id,
).length;

export const mockCompanyAdminMetrics: CompanyAdminMetric[] = [
  {
    label: "Usuarios activos",
    value: formatNumber(activeUsersCount),
    description: "Miembros activos del tenant en estado usable.",
  },
  {
    label: "Documentos",
    value: formatNumber(totalDocuments),
    description: "Archivos cargados en los espacios de la empresa.",
  },
  {
    label: "Storage utilizado",
    value: formatFileSize(totalStorageBytes),
    description: `de ${formatNumber(mockTenant.limits.max_storage_gb)} GB disponibles.`,
  },
  {
    label: "Consultas realizadas",
    value: formatNumber(1842),
    description: "Consultas simuladas en el workspace durante el mes.",
  },
  {
    label: "Errores recientes",
    value: formatNumber(recentErrorCount),
    description: "Incidentes simulados detectados en el periodo actual.",
  },
];

export const companyAdminConceptNote = [
  "Los roles definen qué acciones puede ejecutar una persona.",
  "Los grupos definen necesidades compartidas de acceso documental y los espacios organizan permisos heredables sobre la documentación.",
];

export const companyAdminLocalChangeNote =
  "Los cambios se simulan localmente durante development.";
