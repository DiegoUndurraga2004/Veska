import type {
  AuthProvider,
  MembershipStatus,
  UserRole,
} from "@/types/auth";

export type WorkspaceUser = {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  initials: string;
  role: UserRole;
  status: MembershipStatus;
  auth_provider: AuthProvider;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};
