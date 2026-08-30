import type { UserRole } from "@/types/auth";

export type InvitationRole = Exclude<UserRole, "platform_admin">;

export type InvitationStatus = "valid" | "expired" | "invalid";

export type InvitationPreview = {
  email: string;
  tenantName: string;
  role: InvitationRole;
  expiresAt: string;
  status: InvitationStatus;
};
