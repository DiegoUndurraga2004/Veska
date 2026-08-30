"use client";

import { useState, type FormEvent } from "react";

import type { CompanyAdminUser } from "@/mocks/company-admin.mock";
import type { Group } from "@/types/groups";
import type {
  Space,
  SpaceAccessLevel,
  SpacePermission,
  SpacePermissionSource,
} from "@/types/spaces";

type SpacePermissionRecipientType = "group" | "user";

type SpacePermissionFormProps = {
  open: boolean;
  space: Space | null;
  groups: Group[];
  users: CompanyAdminUser[];
  existingPermissions: SpacePermission[];
  onClose: () => void;
  onSubmit: (payload: {
    recipientType: SpacePermissionRecipientType;
    recipientId: string;
    accessLevel: SpaceAccessLevel;
    source: SpacePermissionSource;
  }) => void;
};

const accessLevelOptions: {
  value: SpaceAccessLevel;
  label: string;
}[] = [
  { value: "read", label: "Lectura" },
  { value: "write", label: "Lectura y carga" },
  { value: "manage", label: "Administración" },
];

const sourceOptions: {
  value: SpacePermissionSource;
  label: string;
}[] = [
  { value: "direct", label: "Permiso directo" },
  { value: "override", label: "Excepción local" },
];

function getFirstRecipientId(
  recipientType: SpacePermissionRecipientType,
  groups: Group[],
  users: CompanyAdminUser[],
) {
  return recipientType === "group" ? groups[0]?.id ?? "" : users[0]?.id ?? "";
}

export function SpacePermissionForm({
  open,
  space,
  groups,
  users,
  existingPermissions,
  onClose,
  onSubmit,
}: SpacePermissionFormProps) {
  const canUseOverride = Boolean(space?.parent_space_id);
  const [recipientType, setRecipientType] =
    useState<SpacePermissionRecipientType>("group");
  const [recipientId, setRecipientId] = useState(
    getFirstRecipientId("group", groups, users),
  );
  const [accessLevel, setAccessLevel] = useState<SpaceAccessLevel>("read");
  const [source, setSource] = useState<SpacePermissionSource>("direct");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open || !space) {
    return null;
  }

  const selectableRecipients =
    recipientType === "group" ? groups : users;

  function handleRecipientTypeChange(
    nextRecipientType: SpacePermissionRecipientType,
  ) {
    setRecipientType(nextRecipientType);
    setRecipientId(
      getFirstRecipientId(nextRecipientType, groups, users),
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (recipientId.length === 0) {
      setErrorMessage("Selecciona un destinatario.");
      return;
    }

    if (source === "override" && !canUseOverride) {
      setErrorMessage("Las excepciones solo están disponibles en subespacios.");
      return;
    }

    const duplicateExists = existingPermissions.some((permission) => {
      const sameRecipient =
        recipientType === "group"
          ? permission.group_id === recipientId
          : permission.user_id === recipientId;

      return (
        sameRecipient &&
        permission.access_level === accessLevel &&
        permission.source === source
      );
    });

    if (duplicateExists) {
      setErrorMessage("Ya existe un permiso exacto con esos datos.");
      return;
    }

    setIsSubmitting(true);
    onSubmit({
      recipientType,
      recipientId,
      accessLevel,
      source,
    });
    setIsSubmitting(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="space-permission-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-5 py-8"
    >
      <button
        type="button"
        aria-label="Cerrar formulario"
        onClick={onClose}
        className="absolute inset-0 bg-black/35"
      />

      <section className="relative w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="space-permission-form-title"
              className="text-lg font-semibold text-[#152436]"
            >
              Agregar permiso
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#526173]">
              Configura un permiso local para{" "}
              <span className="font-semibold text-[#152436]">{space.name}</span>.
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

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="space-permission-recipient-type"
                className="block text-sm font-medium text-[#152436]"
              >
                Tipo de destinatario
              </label>

              <select
                id="space-permission-recipient-type"
                value={recipientType}
                onChange={(event) =>
                  handleRecipientTypeChange(
                    event.target.value as SpacePermissionRecipientType,
                  )
                }
                className="mt-2 w-full rounded-lg border border-[#D9E1EA] bg-white px-3 py-2.5 text-sm text-[#152436] outline-none transition focus:border-[#427AC6] focus:ring-2 focus:ring-[#427AC6]/20"
              >
                <option value="group">Grupo</option>
                <option value="user">Usuario</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="space-permission-recipient"
                className="block text-sm font-medium text-[#152436]"
              >
                Destinatario
              </label>

              <select
                id="space-permission-recipient"
                value={recipientId}
                onChange={(event) => setRecipientId(event.target.value)}
                className="mt-2 w-full rounded-lg border border-[#D9E1EA] bg-white px-3 py-2.5 text-sm text-[#152436] outline-none transition focus:border-[#427AC6] focus:ring-2 focus:ring-[#427AC6]/20"
              >
                {selectableRecipients.map((recipient) => (
                  <option key={recipient.id} value={recipient.id}>
                    {recipient.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="space-permission-level"
                className="block text-sm font-medium text-[#152436]"
              >
                Nivel
              </label>

              <select
                id="space-permission-level"
                value={accessLevel}
                onChange={(event) =>
                  setAccessLevel(event.target.value as SpaceAccessLevel)
                }
                className="mt-2 w-full rounded-lg border border-[#D9E1EA] bg-white px-3 py-2.5 text-sm text-[#152436] outline-none transition focus:border-[#427AC6] focus:ring-2 focus:ring-[#427AC6]/20"
              >
                {accessLevelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="space-permission-source"
                className="block text-sm font-medium text-[#152436]"
              >
                Tipo de regla
              </label>

              <select
                id="space-permission-source"
                value={source}
                onChange={(event) =>
                  setSource(event.target.value as SpacePermissionSource)
                }
                disabled={!canUseOverride}
                className="mt-2 w-full rounded-lg border border-[#D9E1EA] bg-white px-3 py-2.5 text-sm text-[#152436] outline-none transition focus:border-[#427AC6] focus:ring-2 focus:ring-[#427AC6]/20 disabled:cursor-not-allowed disabled:bg-[#F7F9FC] disabled:text-[#7D8A99]"
              >
                {sourceOptions
                  .filter((option) => canUseOverride || option.value === "direct")
                  .map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <p className="rounded-xl border border-[#E8EDF3] bg-[#F7F9FC] px-4 py-3 text-sm leading-6 text-[#526173]">
            Los permisos heredados se administran desde el espacio padre. Este
            formulario solo agrega permisos locales.
          </p>

          {!canUseOverride ? (
            <p className="rounded-xl border border-[#E8EDF3] bg-[#F7F9FC] px-4 py-3 text-sm leading-6 text-[#526173]">
              Este espacio es raíz, por lo que no admite excepciones de
              subespacio.
            </p>
          ) : null}

          {errorMessage && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            >
              {errorMessage}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
              {isSubmitting ? "Guardando..." : "Agregar permiso"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
