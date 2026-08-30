"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function LoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="email"
          className="block text-[14px] font-medium text-foreground sm:text-[15px]"
        >
          Correo electrónico
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="usuario@empresa.cl"
          disabled={isSubmitting}
          className="mt-2 h-12 w-full rounded-lg border border-border bg-white px-4 text-[15px] text-foreground outline-none transition placeholder:text-[#7D8A99] focus:border-[#427AC6] focus:ring-2 focus:ring-[#427AC6]/15 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted-foreground"
        />
      </div>

      <div>
        <div className="flex items-center justify-between gap-4">
          <label
            htmlFor="password"
            className="block text-[14px] font-medium text-foreground sm:text-[15px]"
          >
            Contraseña
          </label>

          <Link
            href="/forgot-password"
            className="text-[14px] font-medium text-[#427AC6] transition hover:text-[#356AAE] sm:text-[15px]"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Ingresa tu contraseña"
          disabled={isSubmitting}
          className="mt-2 h-12 w-full rounded-lg border border-border bg-white px-4 text-[15px] text-foreground outline-none transition placeholder:text-[#7D8A99] focus:border-[#427AC6] focus:ring-2 focus:ring-[#427AC6]/15 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted-foreground"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full rounded-lg bg-[#427AC6] px-4 text-[15px] font-medium text-white transition hover:bg-[#356AAE] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
