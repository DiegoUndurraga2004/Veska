"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatNumber } from "@/lib/formatters";
import { mockCompanyAdminUsers, type CompanyAdminUser } from "@/mocks/company-admin.mock";
import { mockDocuments } from "@/mocks/documents.mock";
import { mockGroups, mockSpacePermissions } from "@/mocks/groups.mock";
import { mockAccessibleSpaces } from "@/mocks/spaces.mock";
import type { WorkspaceSession } from "@/types/auth";
import type { Group } from "@/types/groups";
import type { Space, SpacePermission } from "@/types/spaces";

import { SpacePermissionForm } from "./SpacePermissionForm";

type CompanySpacesPanelProps = {
  session: WorkspaceSession;
};

type FeedbackState =
  | {
      tone: "success" | "error" | "info";
      message: string;
    }
  | null;

const permissionAccessLabels: Record<SpacePermission["access_level"], string> = {
  read: "Lectura",
  write: "Lectura y carga",
  manage: "Administración",
};

const permissionSourceLabels: Record<SpacePermission["source"], string> = {
  direct: "Directo",
  inherited: "Heredado",
  override: "Excepción local",
};

function createLocalId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function formatSpacePath(path: string) {
  return path.split("/").join(" / ");
}

function formatDocumentCount(count: number) {
  return `${formatNumber(count)} documento${count === 1 ? "" : "s"}`;
}

function getRecipientType(permission: SpacePermission) {
  return permission.group_id ? "Grupo" : "Usuario";
}

function getRecipientName(
  permission: SpacePermission,
  groupsById: Map<string, Group>,
  usersById: Map<string, CompanyAdminUser>,
) {
  if (permission.group_id) {
    return groupsById.get(permission.group_id)?.name ?? "Grupo eliminado";
  }

  if (!permission.user_id) {
    return "Usuario eliminado";
  }

  return usersById.get(permission.user_id)?.name ?? "Usuario eliminado";
}

function getRecipientDescription(
  permission: SpacePermission,
  usersById: Map<string, CompanyAdminUser>,
) {
  if (!permission.user_id) {
    return null;
  }

  return usersById.get(permission.user_id)?.email ?? null;
}

function getPermissionSourceClassName(source: SpacePermission["source"]) {
  if (source === "direct") {
    return "border-[#D9E1EA] bg-[#F7F9FC] text-[#526173]";
  }

  if (source === "override") {
    return "border-[#D9E1EA] bg-[#EEF4FB] text-[#427AC6]";
  }

  return "border-[#D9E1EA] bg-white text-[#526173]";
}

export function CompanySpacesPanel({
  session,
}: CompanySpacesPanelProps) {
  const spaces = mockAccessibleSpaces;
  const [permissions, setPermissions] = useState<SpacePermission[]>(
    mockSpacePermissions,
  );
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPermissionFormOpen, setIsPermissionFormOpen] = useState(false);
  const [permissionFormVersion, setPermissionFormVersion] = useState(0);
  const [removePermissionState, setRemovePermissionState] =
    useState<SpacePermission | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const users = mockCompanyAdminUsers;
  const groups = mockGroups;

  const spacesById = useMemo(
    () => new Map(spaces.map((space) => [space.id, space])),
    [spaces],
  );

  const usersById = useMemo(
    () => new Map(users.map((user) => [user.id, user])),
    [users],
  );

  const groupsById = useMemo(
    () => new Map(groups.map((group) => [group.id, group])),
    [groups],
  );

  const documentCountBySpaceId = useMemo(() => {
    const map = new Map<string, number>();

    mockDocuments.forEach((document) => {
      map.set(document.space_id, (map.get(document.space_id) ?? 0) + 1);
    });

    return map;
  }, []);

  const childSpacesByParentId = useMemo(() => {
    const map = new Map<string | null, Space[]>();

    spaces.forEach((space) => {
      const currentChildren = map.get(space.parent_space_id) ?? [];
      currentChildren.push(space);
      map.set(space.parent_space_id, currentChildren);
    });

    return map;
  }, [spaces]);

  const rootSpaces = useMemo(
    () => childSpacesByParentId.get(null) ?? [],
    [childSpacesByParentId],
  );
  const normalizedQuery = normalizeText(searchQuery);

  const visibleSpaceIds = useMemo(() => {
    if (normalizedQuery.length === 0) {
      return new Set(spaces.map((space) => space.id));
    }

    const visibleIds = new Set<string>();

    function visit(space: Space): boolean {
      const children = childSpacesByParentId.get(space.id) ?? [];
      const matchesQuery =
        normalizeText(space.name).includes(normalizedQuery) ||
        normalizeText(space.path).includes(normalizedQuery);
      const hasVisibleChild = children.some(visit);

      if (matchesQuery || hasVisibleChild) {
        visibleIds.add(space.id);
      }

      return matchesQuery || hasVisibleChild;
    }

    rootSpaces.forEach(visit);

    return visibleIds;
  }, [childSpacesByParentId, normalizedQuery, rootSpaces, spaces]);

  const selectedSpace = useMemo(
    () => (selectedSpaceId ? spacesById.get(selectedSpaceId) ?? null : null),
    [selectedSpaceId, spacesById],
  );

  const selectedSpaceParent = selectedSpace?.parent_space_id
    ? spacesById.get(selectedSpace.parent_space_id) ?? null
    : null;

  const selectedSpaceChildren = useMemo(
    () =>
      selectedSpace ? childSpacesByParentId.get(selectedSpace.id) ?? [] : [],
    [childSpacesByParentId, selectedSpace],
  );

  const selectedSpacePermissions = useMemo(() => {
    if (!selectedSpace) {
      return [];
    }

    return permissions
      .filter((permission) => permission.space_id === selectedSpace.id)
      .sort((left, right) => {
        const sourceWeight =
          getPermissionSortWeight(left) - getPermissionSortWeight(right);

        if (sourceWeight !== 0) {
          return sourceWeight;
        }

        const leftName = getRecipientName(left, groupsById, usersById);
        const rightName = getRecipientName(right, groupsById, usersById);

        return leftName.localeCompare(rightName);
      });
  }, [groupsById, permissions, selectedSpace, usersById]);

  const selectedSpaceDocumentCount = selectedSpace
    ? documentCountBySpaceId.get(selectedSpace.id) ?? 0
    : 0;

  const feedbackClassName =
    feedback?.tone === "success"
      ? "border-[#D9E1EA] bg-[#F7F9FC] text-[#526173]"
      : feedback?.tone === "error"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-[#D9E1EA] bg-[#EEF4FB] text-[#427AC6]";

  const hasVisibleFilteredResults = spaces.some((space) =>
    visibleSpaceIds.has(space.id),
  );

  function handleSelectSpace(spaceId: string) {
    setSelectedSpaceId(spaceId);
    setIsPermissionFormOpen(false);
    setPermissionFormVersion(0);
    setRemovePermissionState(null);
    setFeedback(null);
  }

  function clearSelectedSpace() {
    setSelectedSpaceId(null);
    setIsPermissionFormOpen(false);
    setRemovePermissionState(null);
    setFeedback(null);
  }

  function openPermissionForm() {
    if (!selectedSpace) {
      return;
    }

    setFeedback(null);
    setRemovePermissionState(null);
    setPermissionFormVersion((currentVersion) => currentVersion + 1);
    setIsPermissionFormOpen(true);
  }

  function handleCreatePermission(payload: {
    recipientType: "group" | "user";
    recipientId: string;
    accessLevel: SpacePermission["access_level"];
    source: SpacePermission["source"];
  }) {
    if (!selectedSpace) {
      return;
    }

    const now = new Date().toISOString();

    const nextPermission: SpacePermission =
      payload.recipientType === "group"
        ? {
            id: createLocalId("space-permission"),
            tenant_id: session.tenant.id,
            space_id: selectedSpace.id,
            group_id: payload.recipientId,
            user_id: null,
            access_level: payload.accessLevel,
            source: payload.source,
            created_at: now,
            updated_at: now,
          }
        : {
            id: createLocalId("space-permission"),
            tenant_id: session.tenant.id,
            space_id: selectedSpace.id,
            group_id: null,
            user_id: payload.recipientId,
            access_level: payload.accessLevel,
            source: payload.source,
            created_at: now,
            updated_at: now,
          };

    setPermissions((currentPermissions) => [nextPermission, ...currentPermissions]);
    setIsPermissionFormOpen(false);
    setFeedback({
      tone: "success",
      message: `Se agregó un permiso ${permissionSourceLabels[nextPermission.source].toLowerCase()} en "${selectedSpace.name}".`,
    });
  }

  function handleConfirmRemovePermission() {
    if (!removePermissionState) {
      return;
    }

    setPermissions((currentPermissions) =>
      currentPermissions.filter(
        (currentPermission) => currentPermission.id !== removePermissionState.id,
      ),
    );
    setRemovePermissionState(null);
    setFeedback({
      tone: "success",
      message: "El permiso fue removido localmente.",
    });
  }

  function renderSpaceTree(spacesToRender: Space[], depth = 0) {
    return spacesToRender.map((space) => {
      if (!visibleSpaceIds.has(space.id)) {
        return null;
      }

      const children = childSpacesByParentId.get(space.id) ?? [];
      const visibleChildren = children.filter((child) => visibleSpaceIds.has(child.id));
      const documentCount = documentCountBySpaceId.get(space.id) ?? 0;
      const isSelected = selectedSpace?.id === space.id;
      const isRoot = space.parent_space_id === null;

      return (
        <li key={space.id}>
          <button
            type="button"
            aria-pressed={isSelected}
            onClick={() => handleSelectSpace(space.id)}
            className={`flex w-full items-stretch rounded-none border-b border-[#E8EDF3] px-4 py-4 text-left transition hover:bg-[#F7F9FC] ${
              isSelected
                ? "bg-[#EEF4FB]"
                : "bg-white"
            }`}
            style={{
              paddingLeft: `${16 + depth * 20}px`,
            }}
          >
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-[15px] font-semibold text-[#152436]">
                    {space.name}
                  </p>

                  <span className="rounded-full border border-[#D9E1EA] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#526173]">
                    {formatDocumentCount(documentCount)}
                  </span>

                  <span className="rounded-full border border-[#D9E1EA] bg-[#F7F9FC] px-2.5 py-1 text-[12px] font-semibold text-[#526173]">
                    {isRoot ? "Raíz" : "Subespacio"}
                  </span>

                  {!space.inherits_permissions ? (
                    <span className="rounded-full border border-[#D9E1EA] bg-[#EEF4FB] px-2.5 py-1 text-[12px] font-semibold text-[#427AC6]">
                      Permisos propios
                    </span>
                  ) : (
                    <span className="rounded-full border border-[#D9E1EA] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#526173]">
                      Hereda permisos
                    </span>
                  )}
                </div>

                <p className="mt-1 truncate text-[13px] text-[#526173]">
                  {formatSpacePath(space.path)}
                </p>
              </div>

              <span className="text-[12px] font-semibold uppercase tracking-wide text-[#7D8A99]">
                {isRoot ? "Raíz" : "Subespacio"}
              </span>
            </div>
          </button>

          {visibleChildren.length > 0 ? (
            <ul className="border-l border-[#E8EDF3]">
              {renderSpaceTree(visibleChildren, depth + 1)}
            </ul>
          ) : null}
        </li>
      );
    });
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="text-[24px] font-semibold tracking-tight text-[#152436] sm:text-[28px]">
          Espacios y permisos
        </h2>

        <p className="max-w-3xl text-[15px] leading-6 text-[#526173]">
          Explora la jerarquía documental y revisa permisos por espacio.
        </p>

        <p className="text-[14px] leading-6 text-[#526173]">
          Selecciona un espacio para revisar su detalle y permisos efectivos.
        </p>
      </section>

      {feedback ? (
        <p
          role="status"
          aria-live="polite"
          className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${feedbackClassName}`}
        >
          {feedback.message}
        </p>
      ) : null}

      <div
        className={`grid gap-6 ${
          selectedSpace ? "lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]" : ""
        }`}
      >
        <section className="overflow-hidden rounded-2xl border border-[#E8EDF3] bg-white shadow-[0_1px_2px_rgba(21,36,54,0.04)]">
          <div className="border-b border-[#E8EDF3] px-5 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1">
                <h3 className="text-[16px] font-semibold text-[#152436]">
                  Lista de espacios
                </h3>

                <p className="text-[14px] leading-6 text-[#526173]">
                  Haz clic en un espacio para ver su detalle y sus permisos
                  efectivos.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:min-w-[280px] sm:items-end">
                <label
                  htmlFor="space-search"
                  className="text-[12px] font-semibold text-[#7D8A99]"
                >
                  Buscar espacio
                </label>

                <div className="flex w-full gap-2">
                  <input
                    id="space-search"
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Ej. Legal, Contratos, Finanzas"
                    className="min-w-0 flex-1 rounded-xl border border-[#D9E1EA] bg-white px-4 py-2.5 text-[14px] text-[#152436] outline-none transition placeholder:text-[#7D8A99] focus:border-[#427AC6] focus:ring-2 focus:ring-[#427AC6]/20"
                  />

                  {searchQuery.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="shrink-0 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-[#427AC6] transition hover:text-[#356AAE]"
                    >
                      Limpiar búsqueda
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="max-h-[72vh] overflow-y-auto">
            {hasVisibleFilteredResults ? (
              <ul>{renderSpaceTree(rootSpaces)}</ul>
            ) : (
              <div className="px-5 py-6 text-[14px] leading-6 text-[#526173]">
                No hay espacios que coincidan con esa búsqueda.
              </div>
            )}
          </div>
        </section>

        {selectedSpace ? (
          <section className="space-y-4">
            <article className="overflow-hidden rounded-2xl border border-[#E8EDF3] bg-white shadow-[0_1px_2px_rgba(21,36,54,0.04)]">
              <div className="border-b border-[#E8EDF3] px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold uppercase tracking-wide text-[#7D8A99]">
                      Espacio seleccionado
                    </p>

                    <h3 className="mt-2 truncate text-[20px] font-semibold tracking-tight text-[#152436]">
                      {selectedSpace.name}
                    </h3>

                    <p className="mt-1 text-[14px] text-[#526173]">
                      Ruta: {formatSpacePath(selectedSpace.path)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={clearSelectedSpace}
                    className="shrink-0 text-[14px] font-semibold text-[#427AC6] transition hover:text-[#356AAE]"
                  >
                    ← Volver a la lista
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[12px] font-semibold ${
                      selectedSpace.inherits_permissions
                        ? "border-[#D9E1EA] bg-white text-[#526173]"
                        : "border-[#D9E1EA] bg-[#EEF4FB] text-[#427AC6]"
                    }`}
                  >
                    {selectedSpace.inherits_permissions
                      ? "Hereda permisos"
                      : "Permisos propios"}
                  </span>

                  <span className="rounded-full border border-[#D9E1EA] bg-[#F7F9FC] px-2.5 py-1 text-[12px] font-semibold text-[#526173]">
                    {selectedSpace.parent_space_id
                      ? `Espacio padre: ${selectedSpaceParent?.name ?? "Desconocido"}`
                      : "Espacio raíz"}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-[#E8EDF3] px-5">
                <div className="grid gap-4 py-4 sm:grid-cols-2">
                  <DetailRow label="Ruta" value={formatSpacePath(selectedSpace.path)} />
                  <DetailRow
                    label="Espacio padre"
                    value={selectedSpaceParent?.name ?? "Raíz"}
                  />
                  <DetailRow
                    label="Documentos"
                    value={formatDocumentCount(selectedSpaceDocumentCount)}
                  />
                  <DetailRow
                    label="Subespacios directos"
                    value={formatNumber(selectedSpaceChildren.length)}
                  />
                  <DetailRow
                    label="Herencia de permisos"
                    value={selectedSpace.inherits_permissions ? "Activa" : "Desactivada"}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-[#E8EDF3] px-5 py-4 sm:flex-row">
                <button
                  type="button"
                  onClick={openPermissionForm}
                  className="inline-flex h-[44px] items-center justify-center rounded-xl bg-[#427AC6] px-4 text-[14px] font-semibold text-white transition hover:bg-[#356AAE]"
                >
                  Agregar permiso
                </button>

                <Link
                  href={`/documents?space=${selectedSpace.id}`}
                  className="inline-flex h-[44px] items-center justify-center rounded-xl border border-[#D9E1EA] bg-white px-4 text-[14px] font-semibold text-[#152436] transition hover:bg-[#F7F9FC]"
                >
                  Ver documentos de este espacio
                </Link>
              </div>
            </article>

            <article className="overflow-hidden rounded-2xl border border-[#E8EDF3] bg-white shadow-[0_1px_2px_rgba(21,36,54,0.04)]">
              <div className="border-b border-[#E8EDF3] px-5 py-4">
                <h4 className="text-[16px] font-semibold text-[#152436]">
                  Permisos efectivos
                </h4>

                <p className="mt-1 text-[14px] leading-6 text-[#526173]">
                  Permisos directos, heredados y excepciones aplicadas a este espacio.
                </p>
              </div>

              <div className="px-5">
                {selectedSpacePermissions.length === 0 ? (
                  <div className="py-5 text-[14px] leading-6 text-[#526173]">
                    No hay permisos visibles en este espacio.
                  </div>
                ) : (
                  <div className="divide-y divide-[#E8EDF3]">
                    {selectedSpacePermissions.map((permission) => {
                      const recipientName = getRecipientName(
                        permission,
                        groupsById,
                        usersById,
                      );
                      const recipientType = getRecipientType(permission);
                      const recipientDescription = getRecipientDescription(
                        permission,
                        usersById,
                      );
                      const canRemove =
                        permission.source === "direct" ||
                        permission.source === "override";

                      return (
                        <article key={permission.id} className="py-4">
                          <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,0.9fr)_auto] md:items-start">
                            <div className="min-w-0">
                              <p className="truncate text-[15px] font-semibold text-[#152436]">
                                {recipientName}
                              </p>

                              {recipientDescription ? (
                                <p className="mt-1 break-all text-[13px] text-[#526173]">
                                  {recipientDescription}
                                </p>
                              ) : (
                                <p className="mt-1 text-[13px] text-[#526173]">
                                  {recipientType}
                                </p>
                              )}
                            </div>

                            <DetailRow label="Tipo" value={recipientType} compact />
                            <DetailRow
                              label="Permiso"
                              value={permissionAccessLabels[permission.access_level]}
                              compact
                            />
                            <div>
                              <p className="text-[12px] font-semibold text-[#7D8A99]">
                                Origen
                              </p>

                              <span
                                className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[12px] font-semibold ${getPermissionSourceClassName(
                                  permission.source,
                                )}`}
                              >
                                {permissionSourceLabels[permission.source]}
                              </span>
                            </div>

                            <div className="flex items-start md:justify-end">
                              {canRemove ? (
                                <button
                                  type="button"
                                  onClick={() => setRemovePermissionState(permission)}
                                  className="inline-flex h-[38px] items-center rounded-xl border border-[#D9E1EA] px-3 text-[14px] font-semibold text-[#152436] transition hover:bg-[#F7F9FC]"
                                >
                                  Remover
                                </button>
                              ) : (
                                <span className="inline-flex h-[38px] items-center rounded-xl border border-[#D9E1EA] bg-[#F7F9FC] px-3 text-[14px] font-medium text-[#526173]">
                                  Solo informativo
                                </span>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </article>
          </section>
        ) : null}
      </div>

      <SpacePermissionForm
        key={`${selectedSpace?.id ?? "no-space"}-${permissionFormVersion}`}
        open={isPermissionFormOpen && Boolean(selectedSpace)}
        space={selectedSpace}
        groups={groups}
        users={users}
        existingPermissions={selectedSpacePermissions}
        onClose={() => setIsPermissionFormOpen(false)}
        onSubmit={handleCreatePermission}
      />

      <ConfirmDialog
        open={removePermissionState !== null}
        title="Remover permiso"
        description={
          removePermissionState ? (
            <>
              Vas a remover el permiso para{" "}
              <span className="font-semibold text-[#152436]">
                {getRecipientName(removePermissionState, groupsById, usersById)}
              </span>{" "}
              con nivel{" "}
              <span className="font-semibold text-[#152436]">
                {permissionAccessLabels[removePermissionState.access_level]}
              </span>
              .
            </>
          ) : (
            ""
          )
        }
        confirmLabel="Remover permiso"
        tone="danger"
        onCancel={() => setRemovePermissionState(null)}
        onConfirm={handleConfirmRemovePermission}
      />
    </div>
  );
}

function DetailRow({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-2" : "space-y-1"}>
      <p className="text-[12px] font-semibold text-[#7D8A99]">{label}</p>

      <p className="text-[15px] text-[#152436]">{value}</p>
    </div>
  );
}

function getPermissionSortWeight(permission: SpacePermission) {
  if (permission.source === "direct") {
    return 0;
  }

  if (permission.source === "override") {
    return 1;
  }

  return 2;
}
