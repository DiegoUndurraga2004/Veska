"use client";

import { useMemo, useState } from "react";

import { SetupConfirmDialog } from "@/components/platform/setup/SetupConfirmDialog";
import { createPlatformSetupLocalId } from "@/lib/platform-setup-csv";
import type {
  PlatformSetupInitialAdminInput,
  PlatformSetupInitialGroup,
  PlatformSetupInitialUser,
  PlatformSetupSpacePermission,
  PlatformSetupSuggestedSpace,
} from "@/types/platform-setup";

import {
  SetupSpacePermissionForm,
  type SetupSpacePermissionFormPayload,
} from "./SetupSpacePermissionForm";
import {
  SetupSpacePermissionList,
  type SetupSpacePermissionListItem,
} from "./SetupSpacePermissionList";
import { SetupSpaceTree } from "./SetupSpaceTree";

type NoticeTone = "success" | "error" | "info";

type InitialSpacePermissionsSetupStepProps = {
  spaces: PlatformSetupSuggestedSpace[];
  groups: PlatformSetupInitialGroup[];
  initialAdmin: PlatformSetupInitialAdminInput;
  initialUsers: PlatformSetupInitialUser[];
  permissions: PlatformSetupSpacePermission[];
  onAddPermission: (permission: PlatformSetupSpacePermission) => void;
  onRemovePermission: (permissionId: string) => void;
};

type FeedbackState = {
  tone: NoticeTone;
  message: string;
} | null;

type RecipientUser = {
  id: string;
  name: string;
  email: string;
};

function getAccessLevelLabel(
  accessLevel: PlatformSetupSpacePermission["access_level"],
) {
  switch (accessLevel) {
    case "read":
      return "Lectura";
    case "write":
      return "Lectura y carga";
    case "manage":
      return "Administración";
  }
}

function getSourceLabel(source: PlatformSetupSpacePermission["source"]) {
  return source === "direct" ? "Directo" : "Excepción";
}

function getRecipientName(
  permission: PlatformSetupSpacePermission,
  groupsById: Map<string, PlatformSetupInitialGroup>,
  usersById: Map<string, RecipientUser>,
) {
  if (permission.target_type === "group") {
    return groupsById.get(permission.group_id ?? "")?.name ?? "Grupo eliminado";
  }

  const userId = permission.user_id;

  if (!userId) {
    return "Usuario eliminado";
  }

  return usersById.get(userId)?.name ?? "Usuario eliminado";
}

function getRecipientDescription(
  permission: PlatformSetupSpacePermission,
  usersById: Map<string, RecipientUser>,
) {
  if (permission.target_type !== "user") {
    return null;
  }

  const user = permission.user_id ? usersById.get(permission.user_id) : null;

  if (!user) {
    return null;
  }

  return user.email;
}

function getRecipientKey(permission: PlatformSetupSpacePermission) {
  return permission.target_type === "group"
    ? `group:${permission.group_id ?? ""}`
    : `user:${permission.user_id ?? ""}`;
}

function buildPermissionViewsForSpace(
  space: PlatformSetupSuggestedSpace,
  spacesById: Map<string, PlatformSetupSuggestedSpace>,
  permissions: PlatformSetupSpacePermission[],
  groupsById: Map<string, PlatformSetupInitialGroup>,
  usersById: Map<string, RecipientUser>,
) {
  const ancestorChain: PlatformSetupSuggestedSpace[] = [];
  let cursor: PlatformSetupSuggestedSpace | null = space;

  while (cursor) {
    ancestorChain.unshift(cursor);
    cursor = cursor.parent_id ? spacesById.get(cursor.parent_id) ?? null : null;
  }

  const views: SetupSpacePermissionListItem[] = [];
  const seenKeys = new Set<string>();

  ancestorChain.forEach((ancestor) => {
    const currentPermissions = permissions
      .filter((permission) => permission.space_id === ancestor.id)
      .sort((left, right) => {
        if (left.source !== right.source) {
          return left.source === "direct" ? -1 : 1;
        }

        const leftName = getRecipientName(left, groupsById, usersById);
        const rightName = getRecipientName(right, groupsById, usersById);
        return leftName.localeCompare(rightName, "es", { sensitivity: "base" });
      });

    currentPermissions.forEach((permission) => {
      const inherited = ancestor.id !== space.id;
      const key = `${ancestor.id}:${getRecipientKey(permission)}:${permission.access_level}:${permission.source}:${inherited ? "inherited" : "local"}`;

      if (seenKeys.has(key)) {
        return;
      }

      seenKeys.add(key);
      views.push({
        permission_id: permission.id,
        recipient_type: permission.target_type,
        recipient_label: getRecipientName(permission, groupsById, usersById),
        recipient_description: getRecipientDescription(permission, usersById),
        access_level_label: getAccessLevelLabel(permission.access_level),
        source: inherited ? "inherited" : permission.source,
        source_label: inherited ? "Heredado" : getSourceLabel(permission.source),
        origin_space_name: inherited ? ancestor.name : null,
        can_remove: !inherited,
      });
    });
  });

  return views;
}

function buildRecipientLabel(
  payload: SetupSpacePermissionFormPayload,
  groupsById: Map<string, PlatformSetupInitialGroup>,
  usersById: Map<string, RecipientUser>,
) {
  if (payload.target_type === "group") {
    return groupsById.get(payload.group_id ?? "")?.name ?? "Grupo eliminado";
  }

  return payload.user_id
    ? usersById.get(payload.user_id)?.name ?? "Usuario eliminado"
    : "Usuario eliminado";
}

function buildEffectivePermissionCount(
  space: PlatformSetupSuggestedSpace,
  spacesById: Map<string, PlatformSetupSuggestedSpace>,
  permissions: PlatformSetupSpacePermission[],
) {
  const activeAncestors: string[] = [];
  let cursor: PlatformSetupSuggestedSpace | null = space;

  while (cursor) {
    activeAncestors.unshift(cursor.id);
    cursor = cursor.parent_id ? spacesById.get(cursor.parent_id) ?? null : null;
  }

  return permissions.filter((permission) =>
    activeAncestors.includes(permission.space_id),
  ).length;
}

export function InitialSpacePermissionsSetupStep({
  spaces,
  groups,
  initialAdmin,
  initialUsers,
  permissions,
  onAddPermission,
  onRemovePermission,
}: InitialSpacePermissionsSetupStepProps) {
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [permissionToRemove, setPermissionToRemove] =
    useState<PlatformSetupSpacePermission | null>(null);

  const spacesById = useMemo(
    () => new Map(spaces.map((space) => [space.id, space])),
    [spaces],
  );

  const groupsById = useMemo(
    () => new Map(groups.map((group) => [group.id, group])),
    [groups],
  );

  const usersById = useMemo(() => {
    const allUsers: RecipientUser[] = [
      {
        name:
          initialAdmin.full_name.trim().length > 0
            ? initialAdmin.full_name.trim()
            : "Administrador inicial",
        email: initialAdmin.email,
        id: initialAdmin.id,
      },
      ...initialUsers,
    ];

    return new Map(allUsers.map((user) => [user.id, user]));
  }, [initialAdmin, initialUsers]);

  const activeSpaces = useMemo(
    () => spaces.filter((space) => space.enabled),
    [spaces],
  );

  const effectiveSelectedSpaceId =
    selectedSpaceId &&
    activeSpaces.some((space) => space.id === selectedSpaceId)
      ? selectedSpaceId
      : activeSpaces[0]?.id ?? null;

  const selectedSpace =
    effectiveSelectedSpaceId
      ? activeSpaces.find((space) => space.id === effectiveSelectedSpaceId) ?? null
      : null;

  const selectedSpacePermissions = useMemo(() => {
    if (!selectedSpace) {
      return [];
    }

    return buildPermissionViewsForSpace(
      selectedSpace,
      spacesById,
      permissions,
      groupsById,
      usersById,
    );
  }, [groupsById, permissions, selectedSpace, spacesById, usersById]);

  const activeSpacesWithoutCoverage = useMemo(() => {
    return activeSpaces.filter(
      (space) =>
        buildEffectivePermissionCount(space, spacesById, permissions) === 0,
    );
  }, [activeSpaces, permissions, spacesById]);

  const effectivePermissionToRemove =
    permissionToRemove &&
    permissions.some(
      (permission) => permission.id === permissionToRemove.id,
    )
      ? permissionToRemove
      : null;

  function handleAddPermission(payload: SetupSpacePermissionFormPayload) {
    const newPermission: PlatformSetupSpacePermission = {
      id: createPlatformSetupLocalId("space-permission"),
      ...payload,
    };

    onAddPermission(newPermission);
    setFeedback({
      tone: "success",
      message: `Permiso agregado para ${buildRecipientLabel(payload, groupsById, usersById)} en ${selectedSpace?.path ?? "el espacio seleccionado"}.`,
    });
  }

  function handleRequestRemovePermission(permissionId: string) {
    const permission = permissions.find((item) => item.id === permissionId);

    if (!permission) {
      return;
    }

    setPermissionToRemove(permission);
  }

  function handleConfirmRemovePermission() {
    if (!effectivePermissionToRemove) {
      return;
    }

    onRemovePermission(effectivePermissionToRemove.id);
    setFeedback({
      tone: "info",
      message: "El permiso local fue eliminado.",
    });
    setPermissionToRemove(null);
  }

  const selectedSpaceDetail = selectedSpace
    ? [
        { label: "Nombre", value: selectedSpace.name },
        { label: "Path", value: selectedSpace.path },
        {
          label: "Espacio padre",
          value:
            selectedSpace.parent_id &&
            spacesById.get(selectedSpace.parent_id)?.name
              ? spacesById.get(selectedSpace.parent_id)?.name ?? "Sin espacio padre"
              : "Sin espacio padre",
        },
        {
          label: "Archivos asociados",
          value: String(selectedSpace.files_count),
        },
        {
          label: "Hereda permisos",
          value: selectedSpace.parent_id ? "Sí" : "No",
        },
      ]
    : [];

  const activeSpacesWarning =
    activeSpaces.length === 0
      ? "No existen espacios activos. Activa al menos una propuesta para poder configurar permisos."
      : null;

  const groupsWarning =
    groups.length === 0
      ? "Todavía no hay grupos iniciales. Podrás continuar, pero la cobertura documental quedará limitada."
      : null;

  const coverageWarning =
    activeSpacesWithoutCoverage.length > 0
      ? `Hay ${activeSpacesWithoutCoverage.length} espacio${activeSpacesWithoutCoverage.length === 1 ? "" : "s"} activo${activeSpacesWithoutCoverage.length === 1 ? "" : "s"} sin permisos configurados. Podrás continuar, pero conviene revisarlos antes de activar la empresa.`
      : null;

  return (
    <section className="space-y-6 rounded-3xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-2">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Permisos iniciales
          </h3>

          <p className="text-sm leading-6 text-muted-foreground">
            Asigna permisos locales por espacio y subespacio. Los permisos
            heredados se calculan visualmente desde el espacio padre y las
            excepciones solo se permiten en subespacios.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm leading-6 text-muted-foreground">
          {activeSpaces.length} espacio
          {activeSpaces.length === 1 ? "" : "s"} activo
          {activeSpaces.length === 1 ? "" : "s"}
        </div>
      </div>

      {activeSpacesWarning ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          {activeSpacesWarning}
        </p>
      ) : null}

      {groupsWarning ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          {groupsWarning}
        </p>
      ) : null}

      {coverageWarning ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          {coverageWarning}
        </p>
      ) : null}

      {feedback ? (
        <p
          className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${
            feedback.tone === "success"
              ? "border-[#C9DDF7] bg-[#EEF4FB] text-[#152436]"
              : feedback.tone === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-border bg-surface-muted text-muted-foreground"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <SetupSpaceTree
          spaces={activeSpaces}
          selectedSpaceId={effectiveSelectedSpaceId}
          onSelectSpace={(spaceId) => {
            setSelectedSpaceId(spaceId);
            setPermissionToRemove(null);
            setFeedback(null);
          }}
        />

        <article className="space-y-4 rounded-2xl border border-border bg-surface-muted p-4">
          {selectedSpace ? (
            <>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">
                  Detalle del espacio
                </h4>

                <p className="text-sm leading-6 text-muted-foreground">
                  Revisa el espacio seleccionado y sus permisos efectivos antes
                  de seguir al paso de revisión.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {selectedSpaceDetail.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-border bg-surface px-4 py-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {item.label}
                    </p>

                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <SetupSpacePermissionForm
                space={selectedSpace}
                groups={groups}
                initialAdmin={initialAdmin}
                initialUsers={initialUsers}
                existingPermissions={permissions}
                onSubmit={handleAddPermission}
              />

              <SetupSpacePermissionList
                items={selectedSpacePermissions}
                onRequestRemove={handleRequestRemovePermission}
              />
            </>
          ) : (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">
                Detalle del espacio
              </h4>

              <p className="rounded-2xl border border-dashed border-border bg-surface px-4 py-5 text-sm leading-6 text-muted-foreground">
                Selecciona un espacio activo para ver su detalle y agregar
                permisos.
              </p>
            </div>
          )}
        </article>
      </div>

      <SetupConfirmDialog
        open={Boolean(effectivePermissionToRemove)}
        title="Eliminar permiso"
        description={
          effectivePermissionToRemove && selectedSpace ? (
            <div className="space-y-2">
              <p>
                Vas a eliminar un permiso local en{" "}
                <span className="font-semibold text-foreground">
                  {selectedSpace.path}
                </span>
                .
              </p>

              <p>
                Destinatario:{" "}
                <span className="font-semibold text-foreground">
                  {getRecipientName(
                    effectivePermissionToRemove,
                    groupsById,
                    usersById,
                  )}
                </span>
              </p>

              <p>
                Nivel:{" "}
                <span className="font-semibold text-foreground">
                  {getAccessLevelLabel(effectivePermissionToRemove.access_level)}
                </span>{" "}
                · Aplicar como:{" "}
                <span className="font-semibold text-foreground">
                  {getSourceLabel(effectivePermissionToRemove.source)}
                </span>
              </p>
            </div>
          ) : null
        }
        confirmLabel="Eliminar permiso"
        tone="danger"
        onCancel={() => setPermissionToRemove(null)}
        onConfirm={handleConfirmRemovePermission}
      />
    </section>
  );
}
