export type SpaceVisibility = "restricted";

export type Space = {
  id: string;
  tenant_id: string;
  parent_space_id: string | null;
  name: string;
  path: string;
  visibility: SpaceVisibility;
  inherits_permissions: boolean;
  created_at: string;
  updated_at: string;
};

export type SpaceSummary = Pick<
  Space,
  "id" | "name" | "path"
>;

export type SpaceAccessLevel =
  | "read"
  | "write"
  | "manage";

export type SpacePermissionSource =
  | "direct"
  | "inherited"
  | "override";

export type SpacePermissionBase = {
  id: string;
  tenant_id: string;
  space_id: string;
  access_level: SpaceAccessLevel;
  source: SpacePermissionSource;
  created_at: string;
  updated_at: string;
};

export type SpacePermission =
  | (SpacePermissionBase & {
      group_id: string;
      user_id: null;
    })
  | (SpacePermissionBase & {
      group_id: null;
      user_id: string;
    });
