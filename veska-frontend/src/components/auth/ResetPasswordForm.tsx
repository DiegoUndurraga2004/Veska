"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

const MIN_PASSWORD_LENGTH = 8;

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUpdatedPassword, setHasUpdatedPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

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
    setHasUpdatedPassword(true);
  }

  if (hasUpdatedPassword) {
    return (
      <div className="space-y-7 text-center">
        <div className="flex justify-center">
          <div
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF7EF] text-[18px] font-semibold text-[#2E7D4F]"
          >
            ✓
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[22px] font-semibold tracking-tight text-[#152436] sm:text-[24px]">
            Contraseña actualizada
          </p>

          <p className="mx-auto max-w-[540px] text-[15px] leading-7 text-[#526173] sm:text-[16px]">
            Tu contraseña fue actualizada correctamente. Ya puedes iniciar
            sesión con tus nuevas credenciales.
          </p>
        </div>

        <Link
          href="/login"
          className="inline-flex h-12 w-full max-w-[360px] items-center justify-center rounded-lg bg-[#427AC6] px-4 text-[15px] font-medium text-white transition hover:bg-[#356AAE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6]/15 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Volver al login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="new-password"
          className="block text-[14px] font-medium text-[#152436] sm:text-[15px]"
        >
          Nueva contraseña
        </label>

        <input
          id="new-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Ingresa tu nueva contraseña"
          className="mt-2 h-12 w-full rounded-lg border border-[#D9E1EA] bg-white px-4 text-[15px] text-[#152436] outline-none transition placeholder:text-[#7D8A99] focus:border-[#427AC6] focus:ring-2 focus:ring-[#427AC6]/15"
        />

        <p className="mt-2 text-[13px] leading-5 text-[#7D8A99]">
          Debe contener al menos {MIN_PASSWORD_LENGTH} caracteres.
        </p>
      </div>

      <div>
        <label
          htmlFor="password-confirmation"
          className="block text-[14px] font-medium text-[#152436] sm:text-[15px]"
        >
          Confirmar contraseña
        </label>

        <input
          id="password-confirmation"
          name="passwordConfirmation"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          value={passwordConfirmation}
          onChange={(event) => setPasswordConfirmation(event.target.value)}
          placeholder="Repite tu nueva contraseña"
          className="mt-2 h-12 w-full rounded-lg border border-[#D9E1EA] bg-white px-4 text-[15px] text-[#152436] outline-none transition placeholder:text-[#7D8A99] focus:border-[#427AC6] focus:ring-2 focus:ring-[#427AC6]/15"
        />
      </div>

      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-xl bg-[#F7F9FC] px-4 py-3"
        >
          <p className="text-[14px] font-medium text-[#152436]">
            {errorMessage}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full rounded-lg bg-[#427AC6] px-4 text-[15px] font-medium text-white transition hover:bg-[#356AAE] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6]/15 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        {isSubmitting ? "Actualizando..." : "Actualizar contraseña"}
      </button>

      <p className="text-center text-[14px] leading-5 text-[#7D8A99]">
        Utiliza una contraseña distinta a la que usas en otros servicios.
      </p>
    </form>
  );
}
