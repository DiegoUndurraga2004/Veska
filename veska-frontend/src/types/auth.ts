import type { TenantAISettings } from "@/types/tenants";

export type UserRole =
  | "platform_admin"
  | "company_admin"
  | "company_user"
  | "read_only";

export type AuthProvider =
  | "microsoft"
  | "google"
  | "local";

export type MembershipStatus =
  | "active"
  | "inactive"
  | "pending";

export type WorkspaceSession = {
  auth_provider: AuthProvider;
  membership: {
    status: MembershipStatus;
  };
  tenant: {
    id: string;
    name: string;
    plan: string;
    ai_settings: TenantAISettings;
  };
  user: {
    name: string;
    email: string;
    initials: string;
    role: UserRole;
    status: MembershipStatus;
    auth_provider: AuthProvider;
    avatar_url: string | null;
  };
};
