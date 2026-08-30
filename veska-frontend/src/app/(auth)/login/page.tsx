import Link from "next/link";

import { VeskaLogo } from "@/components/brand/VeskaLogo";
import {
  LoginAccessNotice,
  type LoginAccessState,
} from "@/components/auth/LoginAccessNotice";
import { LoginForm } from "@/components/auth/LoginForm";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

type LoginPageProps = {
  searchParams: Promise<{
    state?: string | string[];
  }>;
};

function getLoginAccessState(
  state: string | string[] | undefined,
): LoginAccessState | null {
  const resolvedState = Array.isArray(state) ? state[0] : state;

  if (resolvedState === "invalid-credentials") {
    return "invalid-credentials";
  }

  if (resolvedState === "pending") {
    return "pending";
  }

  if (resolvedState === "inactive") {
    return "inactive";
  }

  if (resolvedState === "oauth_error") {
    return "oauth_error";
  }

  return null;
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const { state } = await searchParams;
  const accessState = getLoginAccessState(state);

  return (
    <section className="w-full self-start">
      <div className="mx-auto flex w-full max-w-[1140px] flex-col px-5 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-14">
        <div className="mb-12 flex justify-center sm:mb-14">
          <Link
            href="/login"
            className="inline-flex items-center"
          >
            <VeskaLogo
              variant="full"
              priority
              className="h-auto w-[156px] object-contain sm:w-[168px]"
            />
          </Link>
        </div>

        <div className="space-y-8 md:hidden">
          <section className="space-y-6 md:pt-1">
            <div className="space-y-2">
              <h1 className="text-[24px] font-semibold tracking-tight text-foreground sm:text-[26px]">
                Accede a tu empresa
              </h1>

              <p className="max-w-[520px] text-[15px] leading-7 text-muted-foreground">
                Continúa con la cuenta corporativa asociada a tu organización.
              </p>
            </div>

            <OAuthButtons />
          </section>

          <div
            aria-hidden="true"
            className="h-px bg-border md:hidden"
          />

          <section className="space-y-6 md:pt-1">
            <div className="space-y-2">
              <LoginAccessNotice state={accessState} />

              <h2 className="text-[24px] font-semibold tracking-tight text-foreground sm:text-[26px]">
                Accede con tu correo
              </h2>

              <p className="max-w-[520px] text-[15px] leading-7 text-muted-foreground">
                Usa tus credenciales de Veska.
              </p>
            </div>

            <LoginForm />

            <p className="text-sm leading-6 text-muted-foreground">
              ¿Recibiste una invitación?{" "}
              <Link
                href="/accept-invitation"
                className="font-medium text-[#427AC6] transition hover:text-[#356AAE]"
              >
                Activa tu cuenta
              </Link>
            </p>
          </section>
        </div>

        <div className="hidden md:grid md:grid-cols-[minmax(430px,1fr)_1px_minmax(430px,1fr)] md:gap-x-16 lg:gap-x-20">
          <section className="space-y-6 md:pt-1">
            <div className="space-y-2">
              <h1 className="text-[24px] font-semibold tracking-tight text-foreground sm:text-[26px]">
                Accede a tu empresa
              </h1>

              <p className="max-w-[520px] text-[15px] leading-7 text-muted-foreground">
                Continúa con la cuenta corporativa asociada a tu organización.
              </p>
            </div>

            <OAuthButtons />
          </section>

          <div
            aria-hidden="true"
            className="hidden md:block md:h-[300px] md:w-px md:self-center md:justify-self-center md:bg-border"
          />

          <section className="space-y-6 md:pt-1">
            <div className="space-y-2">
              <LoginAccessNotice state={accessState} />

              <h2 className="text-[24px] font-semibold tracking-tight text-foreground sm:text-[26px]">
                Accede con tu correo
              </h2>

              <p className="max-w-[520px] text-[15px] leading-7 text-muted-foreground">
                Usa tus credenciales de Veska.
              </p>
            </div>

            <LoginForm />

            <p className="text-sm leading-6 text-muted-foreground">
              ¿Recibiste una invitación?{" "}
              <Link
                href="/accept-invitation"
                className="font-medium text-[#427AC6] transition hover:text-[#356AAE]"
              >
                Activa tu cuenta
              </Link>
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
