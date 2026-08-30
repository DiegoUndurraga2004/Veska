import { mockTenant } from "@/mocks/tenants.mock";
import {
  mockUserIds,
  mockUsers,
} from "@/mocks/users.mock";
import type { WorkspaceSession } from "@/types/auth";

const mockSessionUser =
  mockUsers.find(
    (user) => user.id === mockUserIds.platformAdmin,
  ) ?? mockUsers[0];

export const mockWorkspaceSession: WorkspaceSession = {
  auth_provider: "microsoft",
  membership: {
    status: "active",
  },
  tenant: {
    id: mockTenant.id,
    name: mockTenant.name,
    plan: mockTenant.plan.name,
    ai_settings: mockTenant.ai_settings,
  },
  user: {
    name: mockSessionUser.name,
    email: mockSessionUser.email,
    initials: mockSessionUser.initials,
    role: mockSessionUser.role,
    status: mockSessionUser.status,
    auth_provider: mockSessionUser.auth_provider,
    avatar_url: mockSessionUser.avatar_url,
  },
};
