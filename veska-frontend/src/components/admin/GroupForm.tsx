"use client";

import { useState, type FormEvent } from "react";

import type { Group } from "@/types/groups";

type GroupFormMode = "create" | "edit";

type GroupFormProps = {
  open: boolean;
  mode: GroupFormMode;
  group: Group | null;
  existingGroups: Group[];
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    description: string | null;
  }) => void;
};

function normalizeValue(value: string) {
  return value.trim().toLowerCase();
}

export function GroupForm({
  open,
  mode,
  group,
  existingGroups,
  onClose,
  onSubmit,
}: GroupFormProps) {
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

      return (
        normalizeValue(existingGroup.name) === normalizedName
      );
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
      aria-labelledby="group-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-5 py-8"
    >
      <button
        type="button"
        aria-label="Cerrar formulario"
        onClick={onClose}
        className="absolute inset-0 bg-black/35"
      />

      <section className="relative w-[calc(100%-2rem)] max-w-[40rem] rounded-[20px] border border-[#E8EDF3] bg-white px-5 py-6 shadow-[0_18px_50px_rgba(21,36,54,0.12)] sm:w-full sm:px-8 sm:py-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id="group-form-title" className="text-[24px] font-semibold leading-[1.2] text-[#152436] sm:text-[26px]">
              {mode === "create" ? "Crear grupo" : "Editar grupo"}
            </h2>

            <p className="mt-2 max-w-[44rem] text-[14px] leading-6 text-[#526173] sm:text-[15px]">
              {mode === "create"
                ? "Crea un grupo para organizar usuarios con necesidades compartidas de acceso documental."
                : "Actualiza el nombre y descripción del grupo de acceso."}
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

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label
              htmlFor="group-name"
              className="block text-[14px] font-semibold text-[#152436]"
            >
              Nombre *
            </label>

            <input
              id="group-name"
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
              htmlFor="group-description"
              className="block text-[14px] font-semibold text-[#152436]"
            >
              Descripción opcional
            </label>

            <textarea
              id="group-description"
              name="description"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ej. Acceso documental del equipo financiero."
              className="mt-2 w-full rounded-xl border border-[#D9E1EA] bg-white px-4 py-3 text-[14px] text-[#152436] outline-none transition placeholder:text-[#7D8A99] focus:border-[#427AC6] focus:ring-2 focus:ring-[rgba(66,122,198,0.16)]"
            />
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] leading-6 text-red-700"
            >
              {errorMessage}
            </p>
          )}

          <p className="rounded-xl border border-[#E8EDF3] bg-[#F7F9FC] px-4 py-3 text-[14px] leading-6 text-[#526173]">
            Podrás agregar integrantes después de crear el grupo.
          </p>

          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
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
              {isSubmitting ? "Guardando..." : mode === "create" ? "Crear grupo" : "Guardar cambios"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
