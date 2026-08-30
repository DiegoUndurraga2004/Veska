import type { MembershipStatus } from "@/types/auth";

export type Group = {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type GroupMembership = {
  id: string;
  tenant_id: string;
  group_id: string;
  user_id: string;
  status: MembershipStatus;
  created_at: string;
  updated_at: string;
};
