"use client";

import { useMemo, useState, type FormEvent } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import {
  companyAdminRoleLabels,
  companyAdminStatusLabels,
  type CompanyAdminUser,
} from "@/mocks/company-admin.mock";
import type { Group } from "@/types/groups";

type GroupMembersFormProps = {
  open: boolean;
  group: Group | null;
  users: CompanyAdminUser[];
  existingUserIds: string[];
  onClose: () => void;
  onSubmit: (userIds: string[]) => void;
};

function normalizeValue(value: string) {
  return value.trim().toLowerCase();
}

export function GroupMembersForm({
  open,
  group,
  users,
  existingUserIds,
  onClose,
  onSubmit,
}: GroupMembersFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eligibleUsers = useMemo(() => {
    const normalizedQuery = normalizeValue(searchQuery);

    return users.filter((user) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        normalizeValue(user.name).includes(normalizedQuery) ||
        normalizeValue(user.email).includes(normalizedQuery);

      return matchesQuery;
    });
  }, [searchQuery, users]);

  if (!open || !group) {
    return null;
  }

  function toggleUserId(userId: string) {
    setSelectedUserIds((currentIds) =>
      currentIds.includes(userId)
        ? currentIds.filter((currentId) => currentId !== userId)
        : [...currentIds, userId],
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const uniqueSelectedIds = selectedUserIds.filter(
      (userId) => !existingUserIds.includes(userId),
    );

    if (uniqueSelectedIds.length === 0) {
      setErrorMessage("Selecciona al menos un usuario que todavía no pertenezca al grupo.");
      return;
    }

    setIsSubmitting(true);
    onSubmit(uniqueSelectedIds);
    setIsSubmitting(false);
  }

  const hasAvailableUsers = eligibleUsers.some(
    (user) => !existingUserIds.includes(user.id),
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="group-members-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-5 py-8"
    >
      <button
        type="button"
        aria-label="Cerrar formulario"
        onClick={onClose}
        className="absolute inset-0 bg-black/35"
      />

      <section className="relative flex max-h-[calc(100vh-4rem)] w-[calc(100%-2rem)] max-w-[48rem] flex-col overflow-hidden rounded-[20px] border border-[#E8EDF3] bg-white shadow-[0_18px_50px_rgba(21,36,54,0.12)] sm:w-full">
        <div className="border-b border-[#E8EDF3] px-5 py-5 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 id="group-members-title" className="text-[24px] font-semibold leading-[1.2] text-[#152436] sm:text-[26px]">
                Agregar integrantes
              </h2>

              <p className="mt-2 max-w-[44rem] text-[14px] leading-6 text-[#526173] sm:text-[15px]">
                Selecciona usuarios administrables para sumarlos a{" "}
                <span className="font-semibold text-[#152436]">{group.name}</span>.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 shrink-0 items-center rounded-xl border border-[#D9E1EA] bg-white px-4 text-sm font-medium text-[#526173] transition hover:bg-[#F7F9FC] hover:text-[#152436]"
            >
              Cerrar
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col space-y-5 overflow-y-auto px-5 py-5 sm:px-8">
            <div>
              <label
                htmlFor="group-member-search"
                className="block text-[14px] font-semibold text-[#152436]"
              >
                Buscar usuarios
              </label>

              <input
                id="group-member-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Ej. María, operaciones@empresa.cl"
                className="mt-2 w-full rounded-xl border border-[#D9E1EA] bg-white px-4 py-3 text-[14px] text-[#152436] outline-none transition placeholder:text-[#7D8A99] focus:border-[#427AC6] focus:ring-2 focus:ring-[rgba(66,122,198,0.16)]"
              />
            </div>

            <div className="rounded-xl border border-[#E8EDF3] bg-[#F7F9FC] px-4 py-3 text-[14px] leading-6 text-[#526173]">
              Los usuarios que ya pertenecen al grupo aparecen deshabilitados para evitar duplicados.
            </div>

            {eligibleUsers.length === 0 ? (
              <EmptyState
                title="No hay usuarios coincidentes"
                description="Prueba con otro nombre o correo."
              />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-[#E8EDF3] bg-white">
                {eligibleUsers.map((user) => {
                  const isAlreadyMember = existingUserIds.includes(user.id);
                  const isSelected = selectedUserIds.includes(user.id);

                  return (
                    <label
                      key={user.id}
                      className={`flex items-start gap-3 border-b border-[#E8EDF3] px-4 py-4 transition last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl ${
                        isAlreadyMember
                          ? "cursor-not-allowed bg-[#F7F9FC] opacity-70"
                          : isSelected
                            ? "cursor-pointer border-l-2 border-l-[#427AC6] bg-[#EEF4FB]"
                            : "cursor-pointer bg-white hover:bg-[#F7F9FC]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-[#D9E1EA] text-[#427AC6] focus:ring-[#427AC6] focus:ring-offset-0"
                        checked={isSelected}
                        disabled={isAlreadyMember}
                        onChange={() => toggleUserId(user.id)}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[14px] font-semibold text-[#152436]">
                            {user.name}
                          </p>

                          <span className="rounded-full border border-[#E8EDF3] bg-[#F7F9FC] px-2.5 py-1 text-[11px] font-semibold text-[#526173]">
                            {companyAdminStatusLabels[user.status]}
                          </span>

                          <span className="rounded-full border border-[#E8EDF3] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#152436]">
                            {companyAdminRoleLabels[user.role]}
                          </span>
                        </div>

                        <p className="mt-1 break-all text-[14px] text-[#526173]">
                          {user.email}
                        </p>

                        {isAlreadyMember ? (
                          <p className="mt-2 text-[12px] font-medium text-[#7D8A99]">
                            Ya pertenece a este grupo.
                          </p>
                        ) : null}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {!hasAvailableUsers && eligibleUsers.length > 0 ? (
              <p className="rounded-xl border border-[#E8EDF3] bg-[#F7F9FC] px-4 py-3 text-[14px] leading-6 text-[#526173]">
                Todos los usuarios visibles ya son integrantes del grupo.
              </p>
            ) : null}

            {errorMessage && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] leading-6 text-red-700"
              >
                {errorMessage}
              </p>
            )}
          </div>

          <div className="border-t border-[#E8EDF3] px-5 py-4 sm:px-8">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[14px] text-[#526173]">
                {selectedUserIds.length} seleccionado{selectedUserIds.length === 1 ? "" : "s"}.
              </p>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-[#D9E1EA] bg-white px-5 text-sm font-semibold text-[#152436] transition hover:bg-[#F7F9FC]"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-[#427AC6] px-5 text-sm font-semibold text-white transition hover:bg-[#356AAE] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Guardando..." : "Agregar integrantes"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
