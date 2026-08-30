"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import type {
  InvitationPreview,
} from "@/types/invitations";

const MIN_PASSWORD_LENGTH = 8;

type AcceptInvitationFormProps = {
  invitation: InvitationPreview;
};

type BlockedInvitationState = {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  tone: "warning" | "error";
  icon: string;
  accentClassName: string;
};

const blockedInvitationStates: Partial<
  Record<InvitationPreview["status"], BlockedInvitationState>
> = {
  expired: {
    title: "Tu invitación expiró",
    description:
      "Solicita una nueva invitación al administrador de tu empresa para continuar.",
    actionLabel: "Volver al login",
    actionHref: "/login",
    tone: "warning",
    icon: "!",
    accentClassName: "bg-[#FFF6E5] text-[#A56A12]",
  },
  invalid: {
    title: "No pudimos validar esta invitación",
    description:
      "El enlace no es válido o ya no está disponible. Solicita una nueva invitación al administrador de tu empresa.",
    actionLabel: "Volver al login",
    actionHref: "/login",
    tone: "error",
    icon: "×",
    accentClassName: "bg-[#FDECEC] text-[#B44545]",
  },
};

export function AcceptInvitationForm({
  invitation,
}: AcceptInvitationFormProps) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAcceptedInvitation, setHasAcceptedInvitation] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (name.trim().length < 2) {
      setErrorMessage("Ingresa tu nombre para continuar.");
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(
        `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
      );
      return;
    }

    if (password !== passwordConfirmation) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    setIsSubmitting(false);
    setHasAcceptedInvitation(true);
  }

  if (invitation.status === "expired" || invitation.status === "invalid") {
    const blockedState = blockedInvitationStates[invitation.status]!;

    return (
      <div className="flex h-full w-full flex-col justify-center py-1 md:py-2">
        <div className="w-full space-y-5">
          <div className="space-y-4">
            <div
              aria-hidden="true"
              className={`flex h-14 w-14 items-center justify-center rounded-full text-[24px] font-semibold ${blockedState.accentClassName}`}
            >
              {blockedState.icon}
            </div>

            <div className="space-y-3">
              <h2 className="text-[24px] font-semibold tracking-tight text-[#152436] sm:text-[28px]">
                {blockedState.title}
              </h2>

              <p className="max-w-[440px] text-[15px] leading-7 text-[#526173] sm:text-[16px]">
                {blockedState.description}
              </p>
            </div>
          </div>

          <Link
            href={blockedState.actionHref}
            className="inline-flex h-12 w-full max-w-[360px] items-center justify-center rounded-lg bg-[#427AC6] px-4 text-[15px] font-medium text-white transition hover:bg-[#356AAE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6]/15 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {blockedState.actionLabel}
          </Link>
        </div>
      </div>
    );
  }

  if (hasAcceptedInvitation) {
    return (
      <div className="flex h-full w-full flex-col justify-center py-1 md:py-2">
        <div className="w-full space-y-5">
          <div className="space-y-4">
            <div
              aria-hidden="true"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF7EF] text-[24px] font-semibold text-[#2E7D4F]"
            >
              ✓
            </div>

            <div className="space-y-3">
              <h2 className="text-[24px] font-semibold tracking-tight text-[#152436] sm:text-[28px]">
                Cuenta activada
              </h2>

              <p className="max-w-[440px] text-[15px] leading-7 text-[#526173] sm:text-[16px]">
                Tu cuenta fue activada correctamente. Ya puedes iniciar sesión
                y acceder al workspace de tu empresa.
              </p>
            </div>
          </div>

          <Link
            href="/login"
            className="inline-flex h-12 w-full max-w-[360px] items-center justify-center rounded-lg bg-[#427AC6] px-4 text-[15px] font-medium text-white transition hover:bg-[#356AAE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6]/15 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Ir al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="invitation-name"
            className="block text-[14px] font-medium text-foreground sm:text-[15px]"
          >
            Nombre
          </label>

          <input
            id="invitation-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ingresa tu nombre"
            className="mt-2 h-12 w-full rounded-lg border border-border bg-white px-4 text-[15px] text-foreground outline-none transition placeholder:text-[#7D8A99] focus:border-[#427AC6] focus:ring-2 focus:ring-[#427AC6]/15"
          />
        </div>

        <div>
          <label
            htmlFor="invitation-password"
            className="block text-[14px] font-medium text-foreground sm:text-[15px]"
          >
            Contraseña
          </label>

          <input
            id="invitation-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Crea una contraseña"
            className="mt-2 h-12 w-full rounded-lg border border-border bg-white px-4 text-[15px] text-foreground outline-none transition placeholder:text-[#7D8A99] focus:border-[#427AC6] focus:ring-2 focus:ring-[#427AC6]/15"
          />

          <p className="mt-2 text-[13px] leading-5 text-muted-foreground">
            Debe contener al menos {MIN_PASSWORD_LENGTH} caracteres.
          </p>
        </div>

        <div>
          <label
            htmlFor="invitation-password-confirmation"
            className="block text-[14px] font-medium text-foreground sm:text-[15px]"
          >
            Confirmar contraseña
          </label>

          <input
            id="invitation-password-confirmation"
            name="passwordConfirmation"
            type="password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            value={passwordConfirmation}
            onChange={(event) =>
              setPasswordConfirmation(event.target.value)
            }
            placeholder="Repite tu contraseña"
            className="mt-2 h-12 w-full rounded-lg border border-border bg-white px-4 text-[15px] text-foreground outline-none transition placeholder:text-[#7D8A99] focus:border-[#427AC6] focus:ring-2 focus:ring-[#427AC6]/15"
          />
        </div>

        {errorMessage && (
          <div
            role="alert"
            aria-live="polite"
            className="rounded-lg border border-border bg-[#F7F9FC] px-4 py-3"
          >
            <p className="text-sm font-medium text-foreground">
              {errorMessage}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-lg bg-[#427AC6] px-4 text-[15px] font-medium text-white transition hover:bg-[#356AAE] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Activando cuenta..." : "Activar cuenta"}
        </button>
      </form>
    </div>
  );
}
