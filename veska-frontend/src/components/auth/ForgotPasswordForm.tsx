"use client";

import { useState, type FormEvent } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    setIsSubmitting(false);
    setHasSubmitted(true);
  }

  function handleReset() {
    setEmail("");
    setHasSubmitted(false);
  }

  if (hasSubmitted) {
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
            Revisa tu correo
          </p>

          <p className="mx-auto max-w-[540px] text-[15px] leading-7 text-[#526173] sm:text-[16px]">
            Si existe una cuenta asociada a ese correo, recibirás un enlace
            para restablecer tu contraseña.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex h-12 w-full max-w-[360px] items-center justify-center rounded-lg bg-[#427AC6] px-4 text-[15px] font-medium text-white transition hover:bg-[#356AAE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6]/15 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Intentar con otro correo
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="recovery-email"
          className="block text-[14px] font-medium text-[#152436] sm:text-[15px]"
        >
          Correo electrónico
        </label>

        <input
          id="recovery-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="usuario@empresa.cl"
          className="mt-2 h-12 w-full rounded-lg border border-[#D9E1EA] bg-white px-4 text-[15px] text-[#152436] outline-none transition placeholder:text-[#7D8A99] focus:border-[#427AC6] focus:ring-2 focus:ring-[#427AC6]/15"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full rounded-lg bg-[#427AC6] px-4 text-[15px] font-medium text-white transition hover:bg-[#356AAE] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6]/15 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        {isSubmitting ? "Enviando..." : "Enviar enlace de recuperación"}
      </button>

      <p className="text-center text-[14px] leading-5 text-[#7D8A99]">
        Recibirás instrucciones para definir una nueva contraseña.
      </p>
    </form>
  );
}
