"use client";

import { useMemo, useState } from "react";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDateTime, formatNumber } from "@/lib/formatters";
import {
  companyAdminRoleLabels,
  companyAdminStatusLabels,
  mockCompanyAdminUsers,
  type CompanyAdminUser,
} from "@/mocks/company-admin.mock";
import { mockGroupMemberships, mockGroups } from "@/mocks/groups.mock";
import type { WorkspaceSession } from "@/types/auth";
import type { Group, GroupMembership } from "@/types/groups";

import { GroupForm } from "./GroupForm";
import { GroupMembersForm } from "./GroupMembersForm";

type CompanyGroupsPanelProps = {
  session: WorkspaceSession;
};

type FeedbackState =
  | {
      tone: "success" | "error" | "info";
      message: string;
    }
  | null;

type GroupFormState =
  | {
      mode: "create" | "edit";
      group: Group | null;
    }
  | null;

type GroupMembersState =
  | {
      group: Group;
    }
  | null;

type ConfirmState =
  | {
      kind: "delete-group";
      group: Group;
    }
  | {
      kind: "remove-member";
      group: Group;
      user: CompanyAdminUser;
    }
  | null;

function normalizeValue(value: string) {
  return value.trim().toLowerCase();
}

function createLocalId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function formatRelativeCount(count: number) {
  return `${formatNumber(count)} integrante${count === 1 ? "" : "s"}`;
}

function getGroupMemberIds(
  memberships: GroupMembership[],
  groupId: string,
) {
  return memberships
    .filter((membership) => membership.group_id === groupId)
    .map((membership) => membership.user_id);
}

export function CompanyGroupsPanel({
  session,
}: CompanyGroupsPanelProps) {
  const [groups, setGroups] = useState<Group[]>(mockGroups);
  const [memberships, setMemberships] = useState<GroupMembership[]>(
    mockGroupMemberships,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupForm, setGroupForm] = useState<GroupFormState>(null);
  const [groupMembersState, setGroupMembersState] =
    useState<GroupMembersState>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const administrableUsers = mockCompanyAdminUsers;

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId) ?? null,
    [groups, selectedGroupId],
  );

  const filteredGroups = useMemo(() => {
    const normalizedQuery = normalizeValue(searchQuery);

    return groups.filter((group) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        normalizeValue(group.name).includes(normalizedQuery) ||
        normalizeValue(group.description ?? "").includes(normalizedQuery);

      return matchesQuery;
    });
  }, [groups, searchQuery]);

  const selectedGroupMembers = useMemo(() => {
    if (!selectedGroup) {
      return [];
    }

    const usersById = new Map(
      administrableUsers.map((user) => [user.id, user]),
    );

    return memberships
      .filter((membership) => membership.group_id === selectedGroup.id)
      .map((membership) => {
        const user = usersById.get(membership.user_id);

        if (!user) {
          return null;
        }

        return {
          membership,
          user,
        };
      })
      .filter(
        (
          item,
        ): item is {
          membership: GroupMembership;
          user: CompanyAdminUser;
        } => Boolean(item),
      )
      .sort((left, right) => left.user.name.localeCompare(right.user.name));
  }, [administrableUsers, memberships, selectedGroup]);

  const selectedGroupMemberIds = useMemo(
    () => getGroupMemberIds(memberships, selectedGroup?.id ?? ""),
    [memberships, selectedGroup?.id],
  );

  function openCreateForm() {
    setFeedback(null);
    setGroupForm({
      mode: "create",
      group: null,
    });
  }

  function openEditForm(group: Group) {
    setFeedback(null);
    setGroupForm({
      mode: "edit",
      group,
    });
  }

  function openDeleteGroup(group: Group) {
    setFeedback(null);
    setConfirmState({
      kind: "delete-group",
      group,
    });
  }

  function openMembersForm(group: Group) {
    setFeedback(null);
    setGroupMembersState({
      group,
    });
  }

  function selectGroup(groupId: string) {
    setSelectedGroupId(groupId);
  }

  function clearSelectedGroup() {
    setSelectedGroupId(null);
  }

  function handleSaveGroup(payload: {
    name: string;
    description: string | null;
  }) {
    const now = new Date().toISOString();

    if (groupForm?.mode === "edit" && groupForm.group) {
      const updatedGroup: Group = {
        ...groupForm.group,
        name: payload.name,
        description: payload.description,
        updated_at: now,
      };

      setGroups((currentGroups) =>
        currentGroups.map((currentGroup) =>
          currentGroup.id === updatedGroup.id ? updatedGroup : currentGroup,
        ),
      );
      setSelectedGroupId(updatedGroup.id);
      setFeedback({
        tone: "success",
        message: `El grupo "${updatedGroup.name}" fue actualizado localmente.`,
      });
      setGroupForm(null);
      return;
    }

    const newGroup: Group = {
      id: createLocalId("group"),
      tenant_id: session.tenant.id,
      name: payload.name,
      description: payload.description,
      created_at: now,
      updated_at: now,
    };

    setGroups((currentGroups) => [newGroup, ...currentGroups]);
    setSelectedGroupId(newGroup.id);
    setFeedback({
      tone: "success",
      message: `El grupo "${newGroup.name}" fue creado localmente y quedó abierto.`,
    });
    setGroupForm(null);
  }

  function handleConfirmGroupDelete() {
    if (!confirmState || confirmState.kind !== "delete-group") {
      return;
    }

    const { group } = confirmState;

    setGroups((currentGroups) => {
      const nextGroups = currentGroups.filter(
        (currentGroup) => currentGroup.id !== group.id,
      );

      setSelectedGroupId((currentSelectedGroupId) =>
        currentSelectedGroupId === group.id
          ? nextGroups[0]?.id ?? null
          : currentSelectedGroupId,
      );

      return nextGroups;
    });

    setMemberships((currentMemberships) =>
      currentMemberships.filter((membership) => membership.group_id !== group.id),
    );
    setFeedback({
      tone: "success",
      message:
        "El grupo fue eliminado localmente. Sus asignaciones simuladas de integrantes también se removieron.",
    });
    setConfirmState(null);
  }

  function handleAddMembers(userIds: string[]) {
    if (!groupMembersState) {
      return;
    }

    const now = new Date().toISOString();
    const groupId = groupMembersState.group.id;
    const existingUserIdSet = new Set(
      getGroupMemberIds(memberships, groupId),
    );
    const uniqueUserIds = userIds.filter(
      (userId) => !existingUserIdSet.has(userId),
    );

    if (uniqueUserIds.length === 0) {
      setFeedback({
        tone: "error",
        message: "No se agregaron integrantes porque todos ya pertenecían al grupo.",
      });
      setGroupMembersState(null);
      return;
    }

    const newMemberships = uniqueUserIds.map<GroupMembership>((userId) => ({
      id: createLocalId("group-membership"),
      tenant_id: session.tenant.id,
      group_id: groupId,
      user_id: userId,
      status: "active",
      created_at: now,
      updated_at: now,
    }));

    setMemberships((currentMemberships) => [
      ...newMemberships,
      ...currentMemberships,
    ]);
    setFeedback({
      tone: "success",
      message: `Se agregaron ${formatRelativeCount(newMemberships.length)} al grupo "${groupMembersState.group.name}".`,
    });
    setGroupMembersState(null);
  }

  function handleRemoveMemberConfirm() {
    if (!confirmState || confirmState.kind !== "remove-member") {
      return;
    }

    const { group, user } = confirmState;

    setMemberships((currentMemberships) =>
      currentMemberships.filter(
        (membership) =>
          !(
            membership.group_id === group.id &&
            membership.user_id === user.id
          ),
      ),
    );
    setFeedback({
      tone: "success",
      message: `${user.name} fue removido del grupo "${group.name}".`,
    });
    setConfirmState(null);
  }

  const filteredCount = filteredGroups.length;

  return (
    <div className="space-y-6">
      <section className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-[22px] font-semibold tracking-tight text-[#152436]">
              Grupos de acceso
            </h2>

            <p className="max-w-3xl text-[14px] leading-6 text-[#526173]">
              Gestiona grupos documentales, sus integrantes y cambios simulados desde estado local.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex h-11 items-center rounded-xl bg-[#427AC6] px-4 text-sm font-semibold text-white transition hover:bg-[#356AAE]"
          >
            Crear grupo
          </button>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
            <p className="text-sm font-semibold text-foreground">
              Roles, grupos y espacios
            </p>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Los roles definen acciones. Los grupos definen qué personas comparten necesidades de acceso documental. Los espacios y permisos se gestionan en la sección dedicada.
            </p>
          </div>

          {feedback && (
            <p
              role="status"
              aria-live="polite"
              className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${
                feedback.tone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : feedback.tone === "error"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-brand-soft bg-brand-soft text-brand"
              }`}
            >
              {feedback.message}
            </p>
          )}

          <div
            className={`grid items-start gap-6 transition-[grid-template-columns] duration-200 ease-out ${
              selectedGroup
                ? "xl:grid-cols-[minmax(0,0.46fr)_minmax(0,0.54fr)] xl:gap-8"
                : "grid-cols-1"
            }`}
          >
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="group-search"
                  className="block text-sm font-medium text-foreground"
                >
                  Buscar por nombre o descripción
                </label>

                <input
                  id="group-search"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Ej. legal, acceso general"
                  className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand-soft"
                />
              </div>

              <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Mostrando {formatNumber(filteredCount)} de{" "}
                  {formatNumber(groups.length)} grupos.
                </p>

                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="self-start font-semibold text-[#427AC6] transition hover:text-[#356AAE]"
                >
                  Limpiar búsqueda
                </button>
              </div>

              {filteredGroups.length === 0 ? (
                <EmptyState
                  title="No hay coincidencias"
                  description="Prueba con otro nombre o descripción."
                  action={
                    <button
                      type="button"
                      onClick={openCreateForm}
                      className="inline-flex rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
                    >
                      Crear grupo
                    </button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {filteredGroups.map((group) => {
                    const memberCount = getGroupMemberIds(
                      memberships,
                      group.id,
                    ).length;
                    const isSelected = selectedGroup?.id === group.id;

                    return (
                      <article
                        key={group.id}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSelected}
                        onClick={() => selectGroup(group.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            selectGroup(group.id);
                          }
                        }}
                        className={`cursor-pointer rounded-2xl border p-4 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-[#427AC6]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                          isSelected
                            ? "border-[#427AC6] bg-[#EEF4FB]"
                            : "border-[#D9E1EA] bg-white hover:border-[#B8C8DA] hover:bg-[#F8FBFF]"
                        }`}
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-sm font-semibold text-[#152436]">
                                {group.name}
                              </h3>

                              <span className="rounded-full border border-[#D9E1EA] bg-white px-2.5 py-1 text-xs font-semibold text-[#526173]">
                                {formatRelativeCount(memberCount)}
                              </span>
                            </div>

                            <p className="mt-2 text-sm leading-6 text-[#526173]">
                              {group.description ?? "Sin descripción"}
                            </p>

                            <p className="mt-3 text-xs text-[#526173]">
                              Actualizado el {formatDateTime(group.updated_at)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              openEditForm(group);
                            }}
                            className="rounded-lg border border-[#D9E1EA] px-3 py-2 text-sm font-semibold text-[#152436] transition hover:bg-[#F4F8FC]"
                          >
                            Editar grupo
                          </button>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              openDeleteGroup(group);
                            }}
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                          >
                            Eliminar grupo
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedGroup ? (
              <div className="space-y-4">
                <section className="rounded-2xl border border-[#D9E1EA] bg-white">
                  <div className="border-b border-[#D9E1EA] px-5 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#526173]">
                          Grupo seleccionado
                        </p>

                        <h3 className="mt-2 text-lg font-semibold text-[#152436]">
                          {selectedGroup.name}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-[#526173]">
                          {selectedGroup.description ?? "Sin descripción"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openMembersForm(selectedGroup)}
                          className="rounded-lg bg-[#427AC6] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#356AAE]"
                        >
                          Agregar integrantes
                        </button>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openEditForm(selectedGroup);
                          }}
                          className="rounded-lg border border-[#D9E1EA] px-3 py-2 text-sm font-semibold text-[#152436] transition hover:bg-[#F4F8FC]"
                        >
                          Editar grupo
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={clearSelectedGroup}
                      className="mt-4 inline-flex text-sm font-medium text-[#427AC6] transition hover:text-[#356AAE]"
                    >
                      ← Volver a lista
                    </button>
                  </div>

                  <div className="space-y-4 px-5 py-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <article className="rounded-xl border border-[#D9E1EA] bg-[#F8FBFF] px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#526173]">
                          Integrantes
                        </p>

                        <p className="mt-2 text-lg font-semibold text-[#152436]">
                          {formatNumber(selectedGroupMembers.length)}
                        </p>
                      </article>

                      <article className="rounded-xl border border-[#D9E1EA] bg-[#F8FBFF] px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#526173]">
                          Actualización
                        </p>

                        <p className="mt-2 text-sm font-semibold text-[#152436]">
                          {formatDateTime(selectedGroup.updated_at)}
                        </p>
                      </article>

                      <article className="rounded-xl border border-[#D9E1EA] bg-[#F8FBFF] px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#526173]">
                          Estado
                        </p>

                        <p className="mt-2 text-sm font-semibold text-[#152436]">
                          Simulado
                        </p>
                      </article>
                    </div>

                    <div className="rounded-xl border border-[#D9E1EA] bg-[#F8FBFF] px-4 py-3 text-sm leading-6 text-[#526173]">
                      Remover integrantes solo cambia la membresía local del grupo. No afecta roles ni documentos.
                    </div>

                    {selectedGroupMembers.length === 0 ? (
                      <EmptyState
                        title="Aún no hay integrantes"
                        description="Usa Agregar integrantes para sumar usuarios administrables a este grupo."
                        action={
                          <button
                            type="button"
                            onClick={() => openMembersForm(selectedGroup)}
                            className="inline-flex rounded-lg bg-[#427AC6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#356AAE]"
                          >
                            Agregar integrantes
                          </button>
                        }
                      />
                    ) : (
                      <div className="space-y-3">
                        {selectedGroupMembers.map(({ user, membership }) => (
                          <article
                            key={membership.id}
                            className="rounded-2xl border border-[#D9E1EA] bg-white px-4 py-4"
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="truncate text-sm font-semibold text-[#152436]">
                                    {user.name}
                                  </h4>

                                  <span className="rounded-full border border-[#D9E1EA] bg-[#F8FBFF] px-2.5 py-1 text-xs font-semibold text-[#526173]">
                                    {companyAdminStatusLabels[user.status]}
                                  </span>
                                </div>

                                <p className="mt-1 break-all text-sm text-[#526173]">
                                  {user.email}
                                </p>

                                <p className="mt-3 text-sm text-[#152436]">
                                  Rol:{" "}
                                  <span className="font-semibold">
                                    {companyAdminRoleLabels[user.role]}
                                  </span>
                                </p>

                                <p className="mt-1 text-sm text-[#526173]">
                                  Membresía:{" "}
                                  <span className="font-semibold text-[#152436]">
                                    {companyAdminStatusLabels[membership.status]}
                                  </span>
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmState({
                                    kind: "remove-member",
                                    group: selectedGroup,
                                    user,
                                  })
                                }
                                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                              >
                                Quitar del grupo
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            ) : (
              <p className="text-sm leading-6 text-[#526173]">
                Selecciona un grupo para revisar integrantes y configuración.
              </p>
            )}
          </div>
        </div>
      </section>

      <GroupForm
        key={`group-form-${groupForm?.mode ?? "closed"}-${groupForm?.group?.id ?? "new"}`}
        open={groupForm !== null}
        mode={groupForm?.mode ?? "create"}
        group={groupForm?.group ?? null}
        existingGroups={groups}
        onClose={() => setGroupForm(null)}
        onSubmit={handleSaveGroup}
      />

      <GroupMembersForm
        key={`group-members-${groupMembersState?.group.id ?? "closed"}`}
        open={groupMembersState !== null}
        group={groupMembersState?.group ?? null}
        users={administrableUsers}
        existingUserIds={selectedGroupMemberIds}
        onClose={() => setGroupMembersState(null)}
        onSubmit={handleAddMembers}
      />

      <ConfirmDialog
        open={confirmState !== null}
        title={
          confirmState?.kind === "delete-group"
            ? "Eliminar grupo"
            : "Quitar integrante"
        }
        description={
          confirmState?.kind === "delete-group" ? (
            <p>
              Eliminar este grupo quitará sus asignaciones simuladas de integrantes. Los documentos y espacios no se eliminarán.
            </p>
          ) : confirmState?.kind === "remove-member" ? (
            <p>
              Se quitará a{" "}
              <span className="font-semibold text-foreground">
                {confirmState.user.name}
              </span>{" "}
              del grupo{" "}
              <span className="font-semibold text-foreground">
                {confirmState.group.name}
              </span>
              . Esta acción solo remueve la membresía local.
            </p>
          ) : null
        }
        confirmLabel={
          confirmState?.kind === "delete-group"
            ? "Eliminar grupo"
            : "Quitar del grupo"
        }
        tone="danger"
        onCancel={() => setConfirmState(null)}
        onConfirm={
          confirmState?.kind === "delete-group"
            ? handleConfirmGroupDelete
            : handleRemoveMemberConfirm
        }
      />
    </div>
  );
}
