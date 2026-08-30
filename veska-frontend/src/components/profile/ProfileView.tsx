"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  NEW_CHAT_DRAFT_STORAGE_KEY,
  NEW_CHAT_RESET_STORAGE_KEY,
} from "@/components/chats/new-chat-session";
import { mockGroupMemberships, mockGroups } from "@/mocks/groups.mock";
import { mockAccessibleSpaces } from "@/mocks/spaces.mock";
import { mockUsers } from "@/mocks/users.mock";
import type { WorkspaceSession } from "@/types/auth";

type ProfileViewProps = {
  session: WorkspaceSession;
};

const authProviderLabels: Record<
  WorkspaceSession["user"]["auth_provider"],
  string
> = {
  microsoft: "Microsoft",
  google: "Google",
  local: "Contraseña local",
};

const accountStatusLabels: Record<
  WorkspaceSession["user"]["status"],
  string
> = {
  active: "Activa",
  pending: "Pendiente",
  inactive: "Inactiva",
};

const membershipStatusLabels: Record<
  WorkspaceSession["membership"]["status"],
  string
> = {
  active: "Activa",
  pending: "Pendiente",
  inactive: "Inactiva",
};

const roleLabels: Record<WorkspaceSession["user"]["role"], string> = {
  platform_admin: "Administrador de Veska",
  company_admin: "Administrador de empresa",
  company_user: "Usuario de empresa",
  read_only: "Solo lectura",
};

function getAssignedGroupNames(session: WorkspaceSession) {
  const groupsById = new Map(mockGroups.map((group) => [group.id, group]));
  const currentUser = mockUsers.find(
    (user) =>
      user.email === session.user.email &&
      user.tenant_id === session.tenant.id,
  );

  const groupIds = mockGroupMemberships
    .filter(
      (membership) =>
        membership.user_id === currentUser?.id &&
        membership.tenant_id === session.tenant.id &&
        membership.status === "active",
    )
    .map((membership) => membership.group_id);

  return groupIds
    .map((groupId) => groupsById.get(groupId)?.name)
    .filter((groupName): groupName is string => Boolean(groupName));
}

function getGroupSummaryLabel(groupNames: string[]) {
  if (groupNames.length === 0) {
    return "Sin grupos asignados";
  }

  return groupNames.join(", ");
}

function getSpaceCountLabel(spaceCount: number) {
  if (spaceCount === 1) {
    return "1 espacio";
  }

  return `${spaceCount} espacios`;
}

function ProfileRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
      <dt className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#7D8A99]">
        {label}
      </dt>

      <dd className="text-[15px] leading-6 text-[#152436] sm:text-right">
        {value}
      </dd>
    </div>
  );
}

function ProfileSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[#E8EDF3] pt-8">
      <h2 className="text-[17px] font-semibold leading-tight text-[#152436]">
        {title}
      </h2>

      <dl className="mt-4 divide-y divide-[#E8EDF3] border-t border-[#E8EDF3]">
        {children}
      </dl>
    </section>
  );
}

function ReportProblemIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="h-[26px] w-[26px]"
    >
      <path
        d="M10 2.75c3.99 0 7.25 3.07 7.25 6.85 0 2.23-1.15 4.18-2.93 5.44-.53.38-.86.99-.86 1.66v.17H6.54v-.15c0-.66-.31-1.27-.84-1.65C3.87 13.75 2.75 11.8 2.75 9.6c0-3.79 3.26-6.85 7.25-6.85Z"
        fill="currentColor"
        opacity=".18"
      />
      <path
        d="M10 5.2v4.3"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
      <circle cx="10" cy="12.7" r="1" fill="currentColor" />
    </svg>
  );
}

export function ProfileView({ session }: ProfileViewProps) {
  const router = useRouter();
  const [reportFeedback, setReportFeedback] = useState("");
  const assignedGroupNames = getAssignedGroupNames(session);
  const accessibleSpaceCount = mockAccessibleSpaces.filter(
    (space) => space.tenant_id === session.tenant.id,
  ).length;
  const accountStatusLabel =
    accountStatusLabels[session.user.status] ?? "Activa";
  const membershipStatusLabel =
    membershipStatusLabels[session.membership.status] ?? "Activa";

  useEffect(() => {
    if (!reportFeedback) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setReportFeedback("");
    }, 3500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [reportFeedback]);

  function handleLogout() {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(NEW_CHAT_DRAFT_STORAGE_KEY);
      window.sessionStorage.removeItem(NEW_CHAT_RESET_STORAGE_KEY);
    }

    router.push("/login");
  }

  function handleReportProblem() {
    setReportFeedback(
      "La opción para reportar problemas estará disponible próximamente.",
    );
  }

  return (
    <div className="mx-auto max-w-[1120px] space-y-10 px-1 pb-10 pt-1 sm:px-0">
      <section className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="max-w-4xl space-y-2">
          <h1 className="text-[clamp(1.75rem,2.3vw,2.05rem)] font-semibold leading-tight tracking-tight text-[#152436] sm:text-[clamp(2rem,2.5vw,2.125rem)]">
            Mi perfil
          </h1>

          <p className="max-w-2xl text-[14px] leading-6 text-[#526173] sm:text-[15px]">
            Revisa la información asociada a tu cuenta en Veska.
          </p>
        </div>

        <div className="flex flex-row items-center gap-3 sm:items-start">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E8C9C9] bg-[#FFF5F5] px-5 text-[14px] font-semibold text-[#8C3A3A] transition hover:bg-[#FFECEC] sm:h-12 sm:px-6"
          >
            Cerrar sesión
          </button>

          {/* Se conectará al logout real cuando exista el flujo de auth correspondiente. */}
          <button
            type="button"
            onClick={handleReportProblem}
            className="group relative inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-transparent text-[#427AC6] transition-[width,color] duration-200 hover:w-[170px] hover:text-[#356AAE] sm:h-12 sm:w-12 sm:hover:w-[170px]"
          >
            <span className="flex h-full w-full items-center justify-center opacity-100 transition-opacity duration-150 group-hover:opacity-0">
              <ReportProblemIcon />
            </span>

            <span className="pointer-events-none absolute flex items-center justify-center whitespace-nowrap px-4 text-[14px] font-semibold opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              Reportar problema
            </span>
          </button>
        </div>

        {reportFeedback && (
          <p className="max-w-[260px] text-[13px] leading-5 text-[#7D8A99] sm:ml-auto sm:max-w-[320px] sm:text-right">
            {reportFeedback}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-5 border-b border-[#E8EDF3] pb-8 sm:flex-row sm:items-start sm:gap-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#EEF4FB] text-[20px] font-semibold tracking-tight text-[#152436]">
          {session.user.initials}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[23px] font-semibold leading-tight text-[#152436] sm:text-[25px]">
            {session.user.name}
          </p>

          <p className="mt-1 text-[15px] leading-6 text-[#526173]">
            {session.user.email}
          </p>

          <p className="mt-2 text-[13px] leading-5 text-[#7D8A99]">
            Acceso con {authProviderLabels[session.user.auth_provider]} ·{" "}
            {accountStatusLabel}
          </p>
        </div>
      </section>

      <ProfileSection title="Cuenta">
        <ProfileRow label="Nombre" value={session.user.name} />
        <ProfileRow label="Email" value={session.user.email} />
        <ProfileRow
          label="Proveedor de acceso"
          value={authProviderLabels[session.user.auth_provider]}
        />
        <ProfileRow label="Estado de cuenta" value={accountStatusLabel} />
      </ProfileSection>

      <ProfileSection title="Empresa actual">
        <ProfileRow label="Empresa" value={session.tenant.name} />
        <ProfileRow label="Rol" value={roleLabels[session.user.role]} />
        <ProfileRow label="Membresía" value={membershipStatusLabel} />
      </ProfileSection>

      <ProfileSection title="Acceso documental">
        <ProfileRow
          label="Espacios accesibles"
          value={getSpaceCountLabel(accessibleSpaceCount)}
        />
        <ProfileRow
          label="Grupos asignados"
          value={getGroupSummaryLabel(assignedGroupNames)}
        />
      </ProfileSection>

    </div>
  );
}
