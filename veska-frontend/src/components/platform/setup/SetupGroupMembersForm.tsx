"use client";

import { useMemo, useState, type FormEvent } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import type {
  PlatformSetupInitialGroup,
  PlatformSetupInitialGroupParticipant,
} from "@/types/platform-setup";

type SetupGroupMembersFormProps = {
  open: boolean;
  group: PlatformSetupInitialGroup | null;
  participants: PlatformSetupInitialGroupParticipant[];
  onClose: () => void;
  onSubmit: (memberIds: string[]) => void;
};

function normalizeValue(value: string) {
  return value.trim().toLowerCase();
}

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

const providerLabels: Record<
  PlatformSetupInitialGroupParticipant["auth_provider"],
  string
> = {
  microsoft: "Microsoft",
  google: "Google",
  local: "local",
};

export function SetupGroupMembersForm({
  open,
  group,
  participants,
  onClose,
  onSubmit,
}: SetupGroupMembersFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    () => Array.from(new Set(group?.member_ids ?? [])),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredParticipants = useMemo(() => {
    const normalizedQuery = normalizeValue(searchQuery);

    return participants.filter((participant) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        normalizeValue(participant.name).includes(normalizedQuery) ||
        normalizeValue(participant.email).includes(normalizedQuery);

      return matchesQuery;
    });
  }, [participants, searchQuery]);

  if (!open || !group) {
    return null;
  }

  function toggleMemberId(memberId: string) {
    setSelectedMemberIds((currentIds) =>
      currentIds.includes(memberId)
        ? currentIds.filter((currentId) => currentId !== memberId)
        : [...currentIds, memberId],
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    setIsSubmitting(true);
    onSubmit(Array.from(new Set(selectedMemberIds)));
    setIsSubmitting(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="setup-group-members-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-5 py-8"
    >
      <button
        type="button"
        aria-label="Cerrar formulario"
        onClick={onClose}
        className="absolute inset-0 bg-black/35"
      />

      <section className="relative flex max-h-[calc(100vh-4rem)] w-full max-w-4xl flex-col rounded-[16px] border border-[#E8EDF3] bg-white shadow-[0_12px_30px_rgba(21,36,54,0.08)]">
        <div className="border-b border-[#E8EDF3] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="setup-group-members-title"
                className="text-[20px] font-semibold tracking-tight text-[#152436]"
              >
                Gestionar integrantes
              </h2>

              <p className="mt-2 text-[14px] leading-6 text-[#526173]">
                Selecciona integrantes para{" "}
                <span className="font-semibold text-foreground">{group.name}</span>.
                Puedes agregar y quitar miembros sin tocar usuarios ni roles.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#D9E1EA] px-3 py-1.5 text-sm font-medium text-[#526173] transition hover:bg-[#F7F9FC] hover:text-[#152436]"
            >
              Cerrar
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-5 overflow-y-auto px-6 py-5">
            <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <label className="space-y-2">
                <span className="text-[14px] font-semibold text-[#152436]">
                  Buscar integrantes
                </span>

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Ej. María, legal@empresa.cl"
                  className="w-full rounded-xl border border-[#D9E1EA] bg-white px-4 py-3 text-[14px] text-[#152436] outline-none transition placeholder:text-[#7D8A99] focus:border-[#427AC6] focus:ring-2 focus:ring-[rgba(66,122,198,0.16)]"
                />
              </label>

              <div className="rounded-xl border border-[#E8EDF3] bg-[#F7F9FC] px-4 py-3 text-[14px] leading-6 text-[#526173]">
                El administrador inicial aparece identificado de forma estable como <span className="font-semibold text-foreground">Administrador inicial</span>.
              </div>
            </div>

            {participants.length === 0 ? (
              <EmptyState
                title="No hay integrantes disponibles"
                description="Primero agrega el administrador inicial o usuarios iniciales para poder asignarlos a grupos."
              />
            ) : filteredParticipants.length === 0 ? (
              <EmptyState
                title="No hay coincidencias"
                description="Prueba con otro nombre o correo."
              />
            ) : (
              <div className="grid gap-3">
                {filteredParticipants.map((participant) => {
                  const isSelected = selectedMemberIds.includes(participant.id);

                  return (
                    <label
                      key={participant.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 transition ${
                        isSelected
                          ? "border-[#427AC6] bg-[#EEF4FB]"
                          : "border-[#E8EDF3] bg-white hover:bg-[#F7F9FC]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-[#D9E1EA] text-[#427AC6] focus:ring-[#427AC6]"
                        checked={isSelected}
                        onChange={() => toggleMemberId(participant.id)}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-[#152436]">
                            {participant.name}
                          </p>

                            <span className="rounded-full border border-[#E8EDF3] bg-[#F7F9FC] px-2.5 py-1 text-xs font-semibold text-[#526173]">
                            {sourceLabels[participant.source]}
                          </span>

                            <span className="rounded-full border border-[#E8EDF3] bg-white px-2.5 py-1 text-xs font-semibold text-[#152436]">
                            {roleLabels[participant.role]}
                          </span>
                        </div>

                        <p className="mt-1 break-all text-sm text-[#526173]">
                          {participant.email}
                        </p>

                        <p className="mt-2 text-xs leading-5 text-[#526173]">
                          {providerLabels[participant.auth_provider]}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {errorMessage && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
              >
                {errorMessage}
              </p>
            )}
          </div>

          <div className="border-t border-[#E8EDF3] px-6 py-4">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#526173]">
                {selectedMemberIds.length} integrante{selectedMemberIds.length === 1 ? "" : "s"} seleccionado{selectedMemberIds.length === 1 ? "" : "s"}.
              </p>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onClose}
                className="rounded-lg border border-[#D9E1EA] px-4 py-2.5 text-sm font-semibold text-[#152436] transition hover:bg-[#F7F9FC]"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                className="rounded-lg bg-[#427AC6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#356AAE] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
