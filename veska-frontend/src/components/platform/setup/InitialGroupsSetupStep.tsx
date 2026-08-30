import { EmptyState } from "@/components/shared/EmptyState";
import type {
  PlatformSetupInitialGroup,
  PlatformSetupInitialGroupParticipant,
} from "@/types/platform-setup";

type NoticeTone = "success" | "error" | "info";

type InitialGroupsSetupStepProps = {
  groups: PlatformSetupInitialGroup[];
  selectedGroupId: string | null;
  participants: PlatformSetupInitialGroupParticipant[];
  totalAssignments: number;
  warningMessage: string | null;
  feedback: string | null;
  feedbackTone: NoticeTone | null;
  onSelectGroup: (groupId: string) => void;
  onCreateGroup: () => void;
  onEditGroup: (group: PlatformSetupInitialGroup) => void;
  onDeleteGroup: (group: PlatformSetupInitialGroup) => void;
  onManageMembers: (group: PlatformSetupInitialGroup) => void;
};

const sourceLabels: Record<
  PlatformSetupInitialGroupParticipant["source"],
  string
> = {
  initial_admin: "Administrador inicial",
  manual: "Manual",
  csv: "CSV",
};

const roleLabels: Record<PlatformSetupInitialGroupParticipant["role"], string> = {
  platform_admin: "platform_admin",
  company_admin: "company_admin",
  company_user: "company_user",
  read_only: "read_only",
};

function noticeClasses(tone: NoticeTone) {
  switch (tone) {
    case "success":
      return "border-[#C9DDF7] bg-[#EEF4FB] text-[#152436]";
    case "error":
      return "border-red-200 bg-red-50 text-red-800";
    case "info":
      return "border-[#E8EDF3] bg-[#F7F9FC] text-[#526173]";
  }
}

function formatMemberCount(count: number) {
  return `${count} integrante${count === 1 ? "" : "s"}`;
}

function buildGroupDescription(group: PlatformSetupInitialGroup) {
  return group.description?.trim().length
    ? group.description
    : "Sin descripción";
}

export function InitialGroupsSetupStep({
  groups,
  selectedGroupId,
  participants,
  totalAssignments,
  warningMessage,
  feedback,
  feedbackTone,
  onSelectGroup,
  onCreateGroup,
  onEditGroup,
  onDeleteGroup,
  onManageMembers,
}: InitialGroupsSetupStepProps) {
  const selectedGroup =
    groups.find((group) => group.id === selectedGroupId) ?? groups[0] ?? null;

  const selectedGroupMembers = selectedGroup
    ? participants.filter((participant) =>
        selectedGroup.member_ids.includes(participant.id),
      )
    : [];

  return (
    <section className="space-y-5">
      {warningMessage && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          {warningMessage}
        </p>
      )}

      {feedback && feedbackTone && (
        <p
          role={feedbackTone === "error" ? "alert" : undefined}
          className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${noticeClasses(feedbackTone)}`}
        >
          {feedback}
        </p>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <article className="space-y-4 rounded-2xl border border-[#E8EDF3] bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-[15px] font-semibold text-[#152436]">
                Grupos creados
              </h3>

              <p className="mt-1 text-[14px] leading-6 text-[#526173]">
                Los grupos se guardan solo en memoria local durante el setup asistido.
              </p>
            </div>

            <button
              type="button"
              onClick={onCreateGroup}
              className="rounded-xl bg-[#427AC6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#356AAE]"
            >
              Crear grupo
            </button>
          </div>

          <div className="rounded-xl border border-[#E8EDF3] bg-[#F7F9FC] px-4 py-3 text-sm leading-6 text-[#526173]">
            Grupos iniciales: {groups.length} · Asignaciones de integrantes: {totalAssignments}
          </div>

          <div className="max-h-[28rem] space-y-3 overflow-auto pr-1">
            {groups.length === 0 ? (
              <EmptyState
                title="Todavía no hay grupos"
                description="Puedes seguir adelante sin crear grupos, aunque normalmente conviene prepararlos antes de asignar permisos documentales."
                action={
                  <button
                    type="button"
                    onClick={onCreateGroup}
                    className="rounded-xl border border-[#D9E1EA] px-4 py-2.5 text-sm font-semibold text-[#152436] transition hover:bg-[#F7F9FC]"
                  >
                    Crear primer grupo
                  </button>
                }
              />
            ) : (
              groups.map((group) => {
                const isSelected = group.id === selectedGroup?.id;

                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => onSelectGroup(group.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-[#427AC6] bg-[#EEF4FB]"
                        : "border-[#E8EDF3] bg-white hover:bg-[#F7F9FC]"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#152436]">
                          {group.name}
                        </p>

                        <p className="mt-1 max-h-12 overflow-hidden text-sm leading-6 text-[#526173]">
                          {buildGroupDescription(group)}
                        </p>
                      </div>

                      <span className="rounded-full border border-[#E8EDF3] bg-[#F7F9FC] px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
                        {formatMemberCount(group.member_ids.length)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </article>

        <article className="space-y-4 rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-[15px] font-semibold text-[#152436]">
                Detalle del grupo
              </h3>

              <p className="mt-1 text-[14px] leading-6 text-[#526173]">
                Revisa y gestiona integrantes desde este panel local.
              </p>
            </div>

            {selectedGroup ? (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onManageMembers(selectedGroup)}
                  className="rounded-xl bg-[#427AC6] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#356AAE]"
                >
                  Gestionar integrantes
                </button>

                <button
                  type="button"
                  onClick={() => onEditGroup(selectedGroup)}
                  className="rounded-xl border border-[#D9E1EA] bg-white px-3 py-2 text-sm font-semibold text-[#152436] transition hover:bg-[#F7F9FC]"
                >
                  Editar grupo
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteGroup(selectedGroup)}
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                >
                  Eliminar
                </button>
              </div>
            ) : null}
          </div>

          {selectedGroup ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#E8EDF3] bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
                    Nombre
                  </p>

                  <p className="mt-2 text-sm font-semibold text-[#152436]">
                    {selectedGroup.name}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E8EDF3] bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
                    Integrantes
                  </p>

                  <p className="mt-2 text-sm font-semibold text-[#152436]">
                    {formatMemberCount(selectedGroup.member_ids.length)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#E8EDF3] bg-white px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
                  Descripción
                </p>

                <p className="mt-2 text-sm leading-6 text-[#152436]">
                  {buildGroupDescription(selectedGroup)}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-surface px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    Integrantes visibles
                  </p>

                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {selectedGroupMembers.length}
                  </p>
                </div>

                <div className="mt-4 max-h-72 space-y-2 overflow-auto pr-1">
                  {selectedGroupMembers.length === 0 ? (
                    <p className="rounded-xl border border-border bg-surface-muted px-4 py-4 text-sm text-muted-foreground">
                      Este grupo todavía no tiene integrantes asignados.
                    </p>
                  ) : (
                    selectedGroupMembers.map((member) => (
                      <div
                        key={member.id}
                        className="rounded-xl border border-border bg-surface-muted px-4 py-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {member.name}
                            </p>

                            <p className="text-sm text-muted-foreground">
                              {member.email}
                            </p>
                          </div>

                          <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {sourceLabels[member.source]}
                          </span>
                        </div>

                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          {roleLabels[member.role]}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Selecciona un grupo"
              description="El detalle del grupo aparecerá aquí. Si todavía no tienes grupos, puedes crear uno o continuar con el wizard."
              action={
                <button
                  type="button"
                  onClick={onCreateGroup}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
                >
                  Crear grupo
                </button>
              }
            />
          )}
        </article>
      </div>
    </section>
  );
}
