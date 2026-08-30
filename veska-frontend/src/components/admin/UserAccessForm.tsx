"use client";

import { useState, type FormEvent } from "react";

import {
  companyAdminRoleOptions,
  type CompanyAdminUserRole,
} from "@/mocks/company-admin.mock";

type UserAccessMode = "authorize" | "invite";

type UserAccessFormProps = {
  mode: UserAccessMode;
  open: boolean;
  existingEmails: string[];
  onClose: () => void;
  onSubmit: (payload: {
    email: string;
    role: CompanyAdminUserRole;
  }) => void;
};

const modeContent: Record<
  UserAccessMode,
  {
    title: string;
    description: string;
    submitLabel: string;
    note: string;
  }
> = {
  authorize: {
    title: "Autorizar email",
    description:
      "Agrega un correo autorizado para permitir acceso futuro mediante Microsoft o Google.",
    submitLabel: "Autorizar email",
    note: "El correo quedará pendiente hasta que el usuario acceda con Microsoft o Google.",
  },
  invite: {
    title: "Invitar usuario",
    description:
      "Prepara una invitación local para un nuevo usuario del workspace.",
    submitLabel: "Invitar usuario",
    note: "La invitación se preparará localmente mientras conectamos el backend.",
  },
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function UserAccessForm({
  mode,
  open,
  existingEmails,
  onClose,
  onSubmit,
}: UserAccessFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CompanyAdminUserRole>("company_user");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) {
    return null;
  }

  const content = modeContent[mode];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      setErrorMessage("Ingresa un correo válido.");
      return;
    }

    if (
      existingEmails.some(
        (existingEmail) =>
          existingEmail.trim().toLowerCase() === normalizedEmail,
      )
    ) {
      setErrorMessage("Ese correo ya existe en la lista.");
      return;
    }

    setIsSubmitting(true);
    onSubmit({
      email: normalizedEmail,
      role,
    });
    setIsSubmitting(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-access-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-5 sm:py-8"
    >
      <button
        type="button"
        aria-label="Cerrar formulario"
        onClick={onClose}
        className="absolute inset-0 bg-black/35"
      />

      <section className="relative w-full max-w-[620px] rounded-[20px] border border-[#E8EDF3] bg-white p-5 shadow-[0_14px_40px_rgba(21,36,54,0.10)] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="user-access-title"
              className="text-[24px] font-semibold leading-[1.2] tracking-tight text-[#152436] sm:text-[26px]"
            >
              {content.title}
            </h2>

            <p className="mt-2 max-w-[44rem] text-[14px] leading-6 text-[#526173] sm:text-[15px]">
              {content.description}
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
              htmlFor="access-email"
              className="block text-[14px] font-semibold text-[#152436]"
            >
              Correo electrónico
            </label>

            <input
              id="access-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              autoFocus
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="usuario@empresa.cl"
              className="mt-2 w-full rounded-xl border border-[#D9E1EA] bg-white px-4 py-3 text-[14px] text-[#152436] outline-none transition placeholder:text-[#7D8A99] focus:border-[#427AC6] focus:ring-2 focus:ring-[rgba(66,122,198,0.16)]"
            />
          </div>

          <div>
            <label
              htmlFor="access-role"
              className="block text-[14px] font-semibold text-[#152436]"
            >
              Rol inicial
            </label>

            <select
              id="access-role"
              name="role"
              value={role}
              onChange={(event) =>
                setRole(event.target.value as CompanyAdminUserRole)
              }
              className="mt-2 w-full rounded-xl border border-[#D9E1EA] bg-white px-4 py-3 text-[14px] text-[#152436] outline-none transition focus:border-[#427AC6] focus:ring-2 focus:ring-[rgba(66,122,198,0.16)]"
            >
              {companyAdminRoleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <p className="rounded-xl border border-[#E8EDF3] bg-[#F7F9FC] px-4 py-3 text-[14px] leading-6 text-[#526173]">
            {content.note}
          </p>

          {errorMessage && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] leading-6 text-red-700"
            >
              {errorMessage}
            </p>
          )}

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
              {isSubmitting ? "Procesando..." : content.submitLabel}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
