"use client";

import { useMemo, useState } from "react";

import { CompanyUserTable } from "@/components/admin/CompanyUserTable";
import { UserAccessForm } from "@/components/admin/UserAccessForm";
import {
  companyAdminRoleLabels,
  companyAdminStatusOptions,
  mockCompanyAdminUsers,
  type CompanyAdminUser,
  type CompanyAdminUserRole,
} from "@/mocks/company-admin.mock";
import { formatNumber } from "@/lib/formatters";
import type { WorkspaceSession } from "@/types/auth";

type CompanyUsersPanelProps = {
  session: WorkspaceSession;
};

type AccessDialogState =
  | {
      mode: "authorize" | "invite";
    }
  | null;

type StatusActionState =
  | {
      user: CompanyAdminUser;
      action: "deactivate" | "cancel-pending";
    }
  | null;

type FeedbackState =
  | {
      tone: "success" | "error" | "info";
      message: string;
    }
  | null;

function normalizeValue(value: string) {
  return value.trim().toLowerCase();
}

function getDisplayNameFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? email;
  const words = localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1));

  return words.join(" ") || email;
}

function createLocalId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function CompanyUsersPanel({
  session,
}: CompanyUsersPanelProps) {
  const [users, setUsers] = useState<CompanyAdminUser[]>(
    mockCompanyAdminUsers,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    (typeof companyAdminStatusOptions)[number]["value"]
  >("all");
  const [roleFilter, setRoleFilter] = useState<
    CompanyAdminUserRole | "all"
  >("all");
  const [accessDialog, setAccessDialog] =
    useState<AccessDialogState>(null);
  const [statusAction, setStatusAction] =
    useState<StatusActionState>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = normalizeValue(searchQuery);

    return users.filter((user) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        normalizeValue(user.name).includes(normalizedQuery) ||
        normalizeValue(user.email).includes(normalizedQuery);

      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;

      const matchesRole =
        roleFilter === "all" || user.role === roleFilter;

      return matchesQuery && matchesStatus && matchesRole;
    });
  }, [roleFilter, searchQuery, statusFilter, users]);

  const existingEmails = useMemo(
    () => users.map((user) => user.email),
    [users],
  );

  function clearFilters() {
    setSearchQuery("");
    setStatusFilter("all");
    setRoleFilter("all");
  }

  function handleOpenAccessDialog(mode: "authorize" | "invite") {
    setFeedback(null);
    setAccessDialog({ mode });
  }

  function handleCreateLocalUser(payload: {
    email: string;
    role: CompanyAdminUserRole;
  }) {
    const displayName = getDisplayNameFromEmail(payload.email);
    const now = new Date().toISOString();

    setUsers((currentUsers) => [
      {
        id: createLocalId("company-user"),
        tenant_id: session.tenant.id,
        name: displayName,
        email: payload.email,
        initials: displayName
          .split(" ")
          .map((part) => part.charAt(0))
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        role: payload.role,
        status: "pending",
        auth_provider: "local",
        avatar_url: null,
        created_at: now,
        updated_at: now,
      },
      ...currentUsers,
    ]);

    const mode = accessDialog?.mode ?? "authorize";

    setFeedback({
      tone: "success",
      message:
        mode === "authorize"
          ? "Email autorizado. El usuario quedó en estado pending para su acceso futuro por Microsoft o Google."
          : "La invitación fue preparada localmente durante development.",
    });
    setAccessDialog(null);
  }

  function handleRequestStatusChange(user: CompanyAdminUser) {
    if (user.email === session.user.email && user.status !== "inactive") {
      setFeedback({
        tone: "error",
        message:
          "No puedes desactivar tu propia sesión simulada.",
      });
      return;
    }

    if (user.status === "inactive") {
      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === user.id
            ? {
                ...currentUser,
                status: "active",
                updated_at: new Date().toISOString(),
              }
            : currentUser,
        ),
      );

      setFeedback({
        tone: "success",
        message: `${user.name} fue reactivado localmente.`,
      });
      return;
    }

    setStatusAction({
      user,
      action:
        user.status === "pending" ? "cancel-pending" : "deactivate",
    });
  }

  function handleConfirmStatusAction() {
    if (!statusAction) {
      return;
    }

    const nextStatus = "inactive" as const;
    const { user, action } = statusAction;

    setUsers((currentUsers) =>
      currentUsers.map((currentUser) =>
        currentUser.id === user.id
          ? {
              ...currentUser,
              status: nextStatus,
              updated_at: new Date().toISOString(),
            }
          : currentUser,
      ),
    );

    setFeedback({
      tone: "success",
      message:
        action === "cancel-pending"
          ? `${user.name} fue marcado como acceso pendiente cancelado.`
          : `${user.name} fue desactivado localmente.`,
    });

    setStatusAction(null);
  }

  const feedbackClassName =
    feedback?.tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : feedback?.tone === "error"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-brand-soft bg-brand-soft text-brand";

  const filteredCount = filteredUsers.length;

  return (
    <div className="space-y-6">
      <section className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-[22px] font-semibold tracking-tight text-[#152436]">
              Usuarios
            </h2>

            <p className="max-w-3xl text-[14px] leading-6 text-[#526173]">
              Los roles definen acciones; grupos y espacios determinan acceso documental.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleOpenAccessDialog("authorize")}
              className="inline-flex h-11 items-center rounded-xl border border-[#D9E1EA] bg-white px-4 text-sm font-semibold text-[#152436] transition hover:bg-[#F7F9FC]"
            >
              Autorizar email
            </button>

            <button
              type="button"
              onClick={() => handleOpenAccessDialog("invite")}
              className="inline-flex h-11 items-center rounded-xl bg-[#427AC6] px-4 text-sm font-semibold text-white transition hover:bg-[#356AAE]"
            >
              Invitar usuario
            </button>
          </div>
        </div>

        {feedback && (
          <p
            role="status"
            aria-live="polite"
            className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${feedbackClassName}`}
          >
            {feedback.message}
          </p>
        )}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_auto]">
          <div>
            <label
              htmlFor="admin-user-search"
              className="block text-sm font-medium text-[#526173]"
            >
              Buscar por nombre o email
            </label>

            <input
              id="admin-user-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Ej. Maria, legal@empresa.cl"
              className="mt-2 w-full rounded-xl border border-[#D9E1EA] bg-white px-3 py-2.5 text-sm text-[#152436] outline-none transition placeholder:text-[#94A3B3] focus:border-[#427AC6] focus:ring-2 focus:ring-[#427AC6]/15"
            />
          </div>

          <div>
            <label
              htmlFor="admin-user-status"
              className="block text-sm font-medium text-[#526173]"
            >
              Estado
            </label>

            <select
              id="admin-user-status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    (typeof companyAdminStatusOptions)[number]["value"],
                )
              }
              className="mt-2 w-full rounded-xl border border-[#D9E1EA] bg-white px-3 py-2.5 text-sm text-[#152436] outline-none transition focus:border-[#427AC6] focus:ring-2 focus:ring-[#427AC6]/15"
            >
              {companyAdminStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="admin-user-role"
              className="block text-sm font-medium text-[#526173]"
            >
              Rol
            </label>

            <select
              id="admin-user-role"
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value as CompanyAdminUserRole | "all")
              }
              className="mt-2 w-full rounded-xl border border-[#D9E1EA] bg-white px-3 py-2.5 text-sm text-[#152436] outline-none transition focus:border-[#427AC6] focus:ring-2 focus:ring-[#427AC6]/15"
            >
              <option value="all">Todos los roles</option>
              {Object.entries(companyAdminRoleLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="self-end justify-self-start text-sm font-medium text-[#526173] transition hover:text-[#152436] sm:pb-0.5"
          >
            Limpiar filtros
          </button>
        </div>

        <div className="flex flex-col gap-2 text-sm text-[#7D8A99] sm:flex-row sm:items-center sm:justify-between">
          <p>
            Mostrando {formatNumber(filteredCount)} de {formatNumber(users.length)} usuarios.
          </p>
        </div>

        <CompanyUserTable
          users={filteredUsers}
          currentUserEmail={session.user.email}
          onToggleStatus={handleRequestStatusChange}
        />
      </section>

      <UserAccessForm
        mode={accessDialog?.mode ?? "authorize"}
        open={accessDialog !== null}
        existingEmails={existingEmails}
        onClose={() => setAccessDialog(null)}
        onSubmit={handleCreateLocalUser}
      />

      {statusAction && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-status-confirm-title"
          className="fixed inset-0 z-50 flex items-center justify-center px-5 py-8"
        >
          <button
            type="button"
            aria-label="Cerrar confirmación"
            onClick={() => setStatusAction(null)}
            className="absolute inset-0 bg-black/35"
          />

          <section className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h2
              id="admin-status-confirm-title"
              className="text-lg font-semibold text-foreground"
            >
              {statusAction.action === "cancel-pending"
                ? "Cancelar acceso pendiente"
                : "Desactivar usuario"}
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Vas a aplicar este cambio sobre{" "}
              <span className="font-semibold text-foreground">
                {statusAction.user.name}
              </span>
              .
            </p>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {statusAction.action === "cancel-pending"
                ? "El acceso quedará desactivado localmente. Podrás reactivarlo después."
                : "El acceso quedará desactivado localmente. Esta acción no afecta usuarios reales."}
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setStatusAction(null)}
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmStatusAction}
                className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-85"
              >
                Confirmar
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
