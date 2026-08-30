"use client";

import { useState, type FormEvent } from "react";

import type {
  PlatformSetupInitialGroup,
} from "@/types/platform-setup";

type SetupGroupFormProps = {
  open: boolean;
  mode: "create" | "edit";
  group: PlatformSetupInitialGroup | null;
  existingGroups: PlatformSetupInitialGroup[];
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    description: string | null;
  }) => void;
};

function normalizeValue(value: string) {
  return value.trim().toLowerCase();
}

export function SetupGroupForm({
  open,
  mode,
  group,
  existingGroups,
  onClose,
  onSubmit,
}: SetupGroupFormProps) {
  const [name, setName] = useState(group?.name ?? "");
  const [description, setDescription] = useState(group?.description ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) {
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    const normalizedName = normalizeValue(trimmedName);

    if (trimmedName.length === 0) {
      setErrorMessage("El nombre del grupo es obligatorio.");
      return;
    }

    const duplicateExists = existingGroups.some((existingGroup) => {
      if (group && existingGroup.id === group.id) {
        return false;
      }

      return normalizeValue(existingGroup.name) === normalizedName;
    });

    if (duplicateExists) {
      setErrorMessage("Ya existe un grupo con ese nombre.");
      return;
    }

    setIsSubmitting(true);
    onSubmit({
      name: trimmedName,
      description: description.trim().length > 0 ? description.trim() : null,
    });
    setIsSubmitting(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="setup-group-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-5 py-8"
    >
      <button
        type="button"
        aria-label="Cerrar formulario"
        onClick={onClose}
        className="absolute inset-0 bg-black/35"
      />

      <section className="relative w-full max-w-lg rounded-[16px] border border-[#E8EDF3] bg-white p-6 shadow-[0_12px_30px_rgba(21,36,54,0.08)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="setup-group-form-title"
              className="text-[20px] font-semibold tracking-tight text-[#152436]"
            >
              {mode === "create" ? "Crear grupo" : "Editar grupo"}
            </h2>

            <p className="mt-2 text-[14px] leading-6 text-[#526173]">
              Los grupos organizan integrantes que comparten necesidades de acceso documental.
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
          <div>
            <label
              htmlFor="setup-group-name"
              className="block text-[14px] font-semibold text-[#152436]"
            >
              Nombre *
            </label>

            <input
              id="setup-group-name"
              name="name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej. Contabilidad"
              className="mt-2 w-full rounded-xl border border-[#D9E1EA] bg-white px-4 py-3 text-[14px] text-[#152436] outline-none transition placeholder:text-[#7D8A99] focus:border-[#427AC6] focus:ring-2 focus:ring-[rgba(66,122,198,0.16)]"
            />
          </div>

          <div>
            <label
              htmlFor="setup-group-description"
              className="block text-[14px] font-semibold text-[#152436]"
            >
              Descripción opcional
            </label>

            <textarea
              id="setup-group-description"
              name="description"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ej. Integrantes con acceso documental al área financiera."
              className="mt-2 w-full rounded-xl border border-[#D9E1EA] bg-white px-4 py-3 text-[14px] text-[#152436] outline-none transition placeholder:text-[#7D8A99] focus:border-[#427AC6] focus:ring-2 focus:ring-[rgba(66,122,198,0.16)]"
            />
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            >
              {errorMessage}
            </p>
          )}

          <p className="rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm leading-6 text-muted-foreground">
            Este cambio es local y no modifica backend, permisos por espacio ni documentos.
          </p>

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
              {isSubmitting
                ? "Guardando..."
                : mode === "create"
                  ? "Crear grupo"
                  : "Guardar cambios"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
