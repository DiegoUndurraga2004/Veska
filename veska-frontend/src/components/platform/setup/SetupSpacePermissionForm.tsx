"use client";

import { useMemo, useState, type FormEvent } from "react";

import type { PlatformSetupInitialAdminInput, PlatformSetupInitialGroup, PlatformSetupInitialUser, PlatformSetupSpacePermission, PlatformSetupSuggestedSpace } from "@/types/platform-setup";

type SetupSpacePermissionFormPayload = Omit<PlatformSetupSpacePermission, "id">;

type SetupSpacePermissionFormProps = {
  space: PlatformSetupSuggestedSpace | null;
  groups: PlatformSetupInitialGroup[];
  initialAdmin: PlatformSetupInitialAdminInput;
  initialUsers: PlatformSetupInitialUser[];
  existingPermissions: PlatformSetupSpacePermission[];
  onSubmit: (payload: SetupSpacePermissionFormPayload) => void;
};

type RecipientType = "group" | "user";

type Option = {
  id: string;
  label: string;
  description: string;
};

const accessLevelOptions: {
  value: PlatformSetupSpacePermission["access_level"];
  label: string;
}[] = [
  { value: "read", label: "Lectura" },
  { value: "write", label: "Lectura y carga" },
  { value: "manage", label: "Administración" },
];

const sourceOptions: {
  value: PlatformSetupSpacePermission["source"];
  label: string;
}[] = [
  {
    value: "direct",
    label: "Directo",
  },
  {
    value: "override",
    label: "Excepción",
  },
];

function getDefaultRecipientType(groups: PlatformSetupInitialGroup[]) {
  return groups.length > 0 ? "group" : "user";
}

function getGroupOptions(groups: PlatformSetupInitialGroup[]): Option[] {
  return groups.map((group) => ({
    id: group.id,
    label: `Grupo · ${group.name}`,
    description: group.description?.trim().length
      ? group.description
      : "Sin descripción",
  }));
}

function getUserOptions(
  initialAdmin: PlatformSetupInitialAdminInput,
  initialUsers: PlatformSetupInitialUser[],
): Option[] {
  const adminLabel =
    initialAdmin.full_name.trim().length > 0
      ? initialAdmin.full_name.trim()
      : "Administrador inicial";

  return [
    {
      id: initialAdmin.id,
      label: `Administrador inicial · ${adminLabel}`,
      description: initialAdmin.email,
    },
    ...initialUsers.map((user) => ({
      id: user.id,
      label: `Usuario · ${user.name}`,
      description: `${user.email} · ${user.source === "csv" ? "CSV" : "Manual"}`,
    })),
  ];
}

function getFirstOptionId(options: Option[]) {
  return options[0]?.id ?? "";
}

function getSourceLabel(source: PlatformSetupSpacePermission["source"]) {
  return source === "direct" ? "Directo" : "Excepción";
}

export function SetupSpacePermissionForm({
  space,
  groups,
  initialAdmin,
  initialUsers,
  existingPermissions,
  onSubmit,
}: SetupSpacePermissionFormProps) {
  const groupOptions = useMemo(() => getGroupOptions(groups), [groups]);
  const userOptions = useMemo(
    () => getUserOptions(initialAdmin, initialUsers),
    [initialAdmin, initialUsers],
  );

  const [recipientType, setRecipientType] = useState<RecipientType>(
    getDefaultRecipientType(groups),
  );
  const [recipientId, setRecipientId] = useState<string>(
    getFirstOptionId(groupOptions.length > 0 ? groupOptions : userOptions),
  );
  const [accessLevel, setAccessLevel] =
    useState<PlatformSetupSpacePermission["access_level"]>("read");
  const [source, setSource] =
    useState<PlatformSetupSpacePermission["source"]>("direct");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const availableRecipients =
    recipientType === "group" ? groupOptions : userOptions;
  const canUseOverride = Boolean(space?.parent_id);
  const effectiveRecipientId =
    recipientId.length > 0 &&
    availableRecipients.some((recipient) => recipient.id === recipientId)
      ? recipientId
      : getFirstOptionId(availableRecipients);

  function handleRecipientTypeChange(nextRecipientType: RecipientType) {
    const nextRecipientOptions =
      nextRecipientType === "group" ? groupOptions : userOptions;

    setRecipientType(nextRecipientType);
    setRecipientId(getFirstOptionId(nextRecipientOptions));
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!space) {
      setErrorMessage("Selecciona un espacio activo para configurar permisos.");
      return;
    }

    if (effectiveRecipientId.length === 0) {
      setErrorMessage("Selecciona un destinatario.");
      return;
    }

    if (source === "override" && !canUseOverride) {
      setErrorMessage("Las excepciones solo están disponibles en subespacios.");
      return;
    }

    const duplicateExists = existingPermissions.some((permission) => {
      if (permission.space_id !== space.id) {
        return false;
      }

      return (
        permission.target_type === recipientType &&
        permission.group_id === (recipientType === "group" ? effectiveRecipientId : null) &&
        permission.user_id === (recipientType === "user" ? effectiveRecipientId : null) &&
        permission.access_level === accessLevel &&
        permission.source === source
      );
    });

    if (duplicateExists) {
      setErrorMessage("Ya existe un permiso exacto con esos datos para este espacio.");
      return;
    }

    onSubmit({
      space_id: space.id,
      target_type: recipientType,
      group_id: recipientType === "group" ? effectiveRecipientId : null,
      user_id: recipientType === "user" ? effectiveRecipientId : null,
      access_level: accessLevel,
      source,
    });

    setSuccessMessage(
      `Permiso agregado: ${getSourceLabel(source)} en ${space.path}.`,
    );
  }

  if (!space) {
    return (
      <section className="space-y-4 rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] p-4">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">
            Agregar permiso
          </h4>

          <p className="text-sm leading-6 text-muted-foreground">
            Selecciona un espacio activo para habilitar este formulario.
          </p>
        </div>

        <p className="rounded-2xl border border-dashed border-[#E8EDF3] bg-white px-4 py-5 text-sm leading-6 text-[#526173]">
          No hay un espacio activo seleccionado.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] p-4">
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">
          Agregar permiso
        </h4>

        <p className="text-sm leading-6 text-muted-foreground">
          Configura permisos locales para{" "}
          <span className="font-semibold text-foreground">{space.path}</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Tipo de destinatario
            </span>

            <select
              value={recipientType}
              onChange={(event) =>
                handleRecipientTypeChange(event.target.value as RecipientType)
              }
              className="w-full rounded-xl border border-[#D9E1EA] bg-white px-3 py-2.5 text-sm text-[#152436] outline-none transition focus:border-[#427AC6] focus:ring-4 focus:ring-[#427AC6]/10"
            >
              <option value="group">Grupo</option>
              <option value="user">Usuario</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Destinatario
            </span>

            <select
              value={effectiveRecipientId}
              onChange={(event) => setRecipientId(event.target.value)}
              className="w-full rounded-xl border border-[#D9E1EA] bg-white px-3 py-2.5 text-sm text-[#152436] outline-none transition focus:border-[#427AC6] focus:ring-4 focus:ring-[#427AC6]/10"
            >
              {availableRecipients.length === 0 ? (
                <option value="">No hay destinatarios disponibles</option>
              ) : (
                availableRecipients.map((recipient) => (
                  <option key={recipient.id} value={recipient.id}>
                    {recipient.label}
                  </option>
                ))
              )}
            </select>

            {availableRecipients.length > 0 ? (
              <p className="text-xs leading-5 text-muted-foreground">
                {availableRecipients.find((recipient) => recipient.id === effectiveRecipientId)
                  ?.description ?? "Selecciona un destinatario disponible."}
              </p>
            ) : (
              <p className="text-xs leading-5 text-amber-800">
                No hay grupos o usuarios disponibles para asignar permisos.
              </p>
            )}
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Nivel de acceso
            </span>

            <select
              value={accessLevel}
              onChange={(event) =>
                setAccessLevel(
                  event.target.value as PlatformSetupSpacePermission["access_level"],
                )
              }
              className="w-full rounded-xl border border-[#D9E1EA] bg-white px-3 py-2.5 text-sm text-[#152436] outline-none transition focus:border-[#427AC6] focus:ring-4 focus:ring-[#427AC6]/10"
            >
              {accessLevelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Aplicar como
            </span>

            <select
              value={source}
              onChange={(event) =>
                setSource(
                  event.target.value as PlatformSetupSpacePermission["source"],
                )
              }
              className="w-full rounded-xl border border-[#D9E1EA] bg-white px-3 py-2.5 text-sm text-[#152436] outline-none transition focus:border-[#427AC6] focus:ring-4 focus:ring-[#427AC6]/10"
            >
              {sourceOptions
                .filter((option) => canUseOverride || option.value === "direct")
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>

            <p className="text-xs leading-5 text-muted-foreground">
              {canUseOverride
                ? "Puedes crear una excepción explícita solo en subespacios."
                : "Este espacio es raíz, por lo que solo admite permisos directos."}
            </p>
          </label>
        </div>

        <div className="rounded-2xl border border-[#E8EDF3] bg-white px-4 py-3 text-sm leading-6 text-[#526173]">
          Permisos visibles: directos, excepciones y herencias derivadas. Las
          herencias no se guardan como duplicados en el estado local.
        </div>

        {errorMessage ? (
          <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="rounded-2xl border border-[#C9DDF7] bg-[#EEF4FB] px-4 py-3 text-sm leading-6 text-[#152436]">
            {successMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={availableRecipients.length === 0}
          className="w-full rounded-xl bg-[#427AC6] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#356AAE] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Agregar permiso
        </button>
      </form>
    </section>
  );
}

export type { SetupSpacePermissionFormPayload };
