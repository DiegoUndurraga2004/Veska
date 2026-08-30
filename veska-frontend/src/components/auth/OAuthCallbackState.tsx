import Link from "next/link";

import { VeskaLogo } from "@/components/brand/VeskaLogo";

type OAuthProvider = "microsoft" | "google";
export type OAuthCallbackStatus =
  | "authorized"
  | "no_company"
  | "pending"
  | "inactive"
  | "oauth_error";

type OAuthCallbackStateProps = {
  provider: OAuthProvider;
  status: OAuthCallbackStatus;
};

export type OAuthCallbackContent = {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  tone: "success" | "warning" | "error";
};

const callbackStates: Record<
  OAuthCallbackStatus,
  OAuthCallbackContent
> = {
  authorized: {
    title: "Acceso autorizado",
    description:
      "Tu identidad fue validada correctamente. Ya puedes ingresar al workspace de tu empresa.",
    actionLabel: "Ir al dashboard",
    actionHref: "/dashboard",
    tone: "success",
  },
  no_company: {
    title: "No encontramos una empresa asociada",
    description:
      "Tu cuenta fue validada, pero todavía no está vinculada a una empresa en Veska. Contacta al administrador de tu organización.",
    actionLabel: "Volver al login",
    actionHref: "/login",
    tone: "warning",
  },
  pending: {
    title: "Tu cuenta aún no está activa",
    description:
      "Tu acceso está pendiente de aprobación. Contacta al administrador de tu empresa si necesitas ayuda.",
    actionLabel: "Volver al login",
    actionHref: "/login",
    tone: "warning",
  },
  inactive: {
    title: "Tu cuenta está desactivada",
    description:
      "No puedes acceder al workspace en este momento. Contacta al administrador de tu empresa.",
    actionLabel: "Volver al login",
    actionHref: "/login",
    tone: "error",
  },
  oauth_error: {
    title: "No pudimos completar el inicio de sesión",
    description:
      "Ocurrió un problema al validar tu identidad. Intenta nuevamente.",
    actionLabel: "Intentar nuevamente",
    actionHref: "/login?state=oauth_error",
    secondaryActionLabel: "Volver al login",
    secondaryActionHref: "/login",
    tone: "error",
  },
};

export function getOAuthCallbackContent(
  status: OAuthCallbackStatus,
): OAuthCallbackContent {
  return callbackStates[status];
}

// Futuro: este panel visual será reemplazado por el callback real.
// La secuencia efectiva deberá procesar la identidad OAuth, validar la
// sesión, consultar el backend, comprobar usuario activo, membresía activa,
// tenant activo, rol aplicable y redirigir o mostrar un error controlado.
export function OAuthCallbackState({
  provider,
  status,
}: OAuthCallbackStateProps) {
  const state = getOAuthCallbackContent(status);
  const toneStyles = {
    success: {
      badge: "bg-[#EAF7EF] text-[#2E7D4F]",
      icon: "✓",
      iconRing: "ring-[#2E7D4F]/10",
    },
    warning: {
      badge: "bg-[#FFF6E5] text-[#A56A12]",
      icon: "!",
      iconRing: "ring-[#A56A12]/10",
    },
    error: {
      badge: "bg-[#FDECEC] text-[#B44545]",
      icon: "×",
      iconRing: "ring-[#B44545]/10",
    },
  }[state.tone];

  return (
    <section
      data-provider={provider}
      className="mx-auto flex w-full max-w-[640px] flex-col px-6 py-16 sm:px-8 sm:py-20 lg:px-0 lg:py-24"
    >
      <div className="flex flex-col items-center text-center">
        <Link
          href="/login"
          className="inline-flex items-center"
        >
          <VeskaLogo
            variant="full"
            className="h-auto w-[156px] object-contain sm:w-[168px]"
          />
        </Link>

        <div className="mt-12 flex h-14 w-14 items-center justify-center rounded-full bg-white ring-1 ring-inset ring-border">
          <div
            aria-hidden="true"
            className={`flex h-11 w-11 items-center justify-center rounded-full text-[22px] font-semibold ${toneStyles.badge} ring-8 ${toneStyles.iconRing}`}
          >
            {toneStyles.icon}
          </div>
        </div>

        <h1 className="mt-8 text-[28px] font-semibold tracking-tight text-[#152436] sm:text-[32px]">
          {state.title}
        </h1>

        <p className="mt-3 max-w-[560px] text-[15px] leading-7 text-[#526173] sm:text-[16px]">
          {state.description}
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:max-w-[360px]">
          <Link
            href={state.actionHref}
            className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#427AC6] px-5 text-[15px] font-medium text-white transition hover:bg-[#356AAE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6]/15 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {state.actionLabel}
          </Link>

          {state.secondaryActionLabel && state.secondaryActionHref && (
            <Link
              href={state.secondaryActionHref}
              className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-[#D9E1EA] bg-white px-5 text-[14px] font-medium text-[#526173] transition hover:bg-[#F7F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6]/15 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {state.secondaryActionLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
