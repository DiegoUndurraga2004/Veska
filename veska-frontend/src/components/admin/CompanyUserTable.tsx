import { EmptyState } from "@/components/shared/EmptyState";
import {
  companyAdminAuthProviderLabels,
  companyAdminRoleLabels,
  companyAdminStatusLabels,
  type CompanyAdminUser,
} from "@/mocks/company-admin.mock";

type CompanyUserTableProps = {
  users: CompanyAdminUser[];
  currentUserEmail: string;
  onToggleStatus: (user: CompanyAdminUser) => void;
};

function getStatusBadgeClassName(status: CompanyAdminUser["status"]) {
  if (status === "active") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "pending") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-border bg-surface-muted text-muted-foreground";
}

function getProviderBadgeClassName(
  provider: CompanyAdminUser["auth_provider"],
) {
  if (provider === "microsoft") {
    return "border-slate-200 bg-slate-50 text-slate-700";
  }

  if (provider === "google") {
    return "border-brand-soft bg-brand-soft text-brand";
  }

  return "border-border bg-surface text-foreground";
}

function getPrimaryActionLabel(status: CompanyAdminUser["status"]) {
  if (status === "active") {
    return "Desactivar";
  }

  if (status === "pending") {
    return "Cancelar acceso";
  }

  return "Reactivar";
}

export function CompanyUserTable({
  users,
  currentUserEmail,
  onToggleStatus,
}: CompanyUserTableProps) {
  if (users.length === 0) {
    return (
      <EmptyState
        title="No hay coincidencias"
        description="Prueba con otro nombre, correo, rol o estado."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="md:hidden">
        <ul className="space-y-3">
          {users.map((user) => {
            const isSelf = user.email === currentUserEmail;
            const primaryActionLabel = getPrimaryActionLabel(user.status);
            const actionDisabled = isSelf && user.status !== "inactive";

            return (
              <li
                key={user.id}
              className="rounded-2xl border border-[#E8EDF3] bg-white p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user.name}
                    </p>

                    <p className="mt-1 break-all text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>

                  <span
                    className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClassName(
                      user.status,
                    )}`}
                  >
                    {companyAdminStatusLabels[user.status]}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Rol
                    </p>
                    <p className="mt-1 text-foreground">
                      {companyAdminRoleLabels[user.role]}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Acceso
                    </p>
                    <p className="mt-1 text-foreground">
                      {companyAdminAuthProviderLabels[user.auth_provider]}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getProviderBadgeClassName(
                      user.auth_provider,
                    )}`}
                  >
                    {companyAdminAuthProviderLabels[user.auth_provider]}
                  </span>

                  {isSelf && user.status !== "inactive" ? (
                    <span className="text-xs font-medium text-muted-foreground">
                      Tu sesión no puede desactivarse a sí misma.
                    </span>
                  ) : null}
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    disabled={actionDisabled}
                    onClick={() => onToggleStatus(user)}
                  className="rounded-lg border border-[#D9E1EA] px-3 py-2 text-sm font-semibold text-[#152436] transition hover:bg-[#F7F9FC] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionDisabled ? "Tu sesión" : primaryActionLabel}
                </button>
              </div>
            </li>
            );
          })}
        </ul>
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-[#E8EDF3] bg-white md:block">
        <div className="overflow-x-auto">
          <table className="min-w-[920px] w-full border-collapse text-left">
            <thead className="bg-[#F7F9FC]">
              <tr className="border-b border-[#E8EDF3]">
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
                  Nombre
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
                  Email
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
                  Rol
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
                  Estado
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
                  Acceso
                </th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
                  Acción
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E8EDF3]">
              {users.map((user) => {
                const isSelf = user.email === currentUserEmail;
                const primaryActionLabel = getPrimaryActionLabel(user.status);
                const actionDisabled = isSelf && user.status !== "inactive";

                return (
                <tr key={user.id} className="transition hover:bg-[#F7F9FC]">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-foreground">
                        {user.name}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {user.email}
                    </td>

                    <td className="px-5 py-4 text-sm text-foreground">
                      {companyAdminRoleLabels[user.role]}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClassName(
                          user.status,
                        )}`}
                      >
                        {companyAdminStatusLabels[user.status]}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getProviderBadgeClassName(
                          user.auth_provider,
                        )}`}
                      >
                        {companyAdminAuthProviderLabels[user.auth_provider]}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {isSelf && user.status !== "inactive" ? (
                          <span className="text-xs font-medium text-muted-foreground">
                            Tu sesión
                          </span>
                        ) : null}

                        <button
                          type="button"
                          disabled={actionDisabled}
                          onClick={() => onToggleStatus(user)}
                          className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {actionDisabled ? "Protegido" : primaryActionLabel}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
