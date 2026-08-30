import Link from "next/link";

import { VeskaLogo } from "@/components/brand/VeskaLogo";
import { AcceptInvitationForm } from "@/components/auth/AcceptInvitationForm";
import { mockInvitation } from "@/mocks/invitation.mock";
import type { InvitationStatus } from "@/types/invitations";

type AcceptInvitationPageProps = {
  searchParams: Promise<{
    state?: string | string[];
  }>;
};

function getInvitationStatus(
  state: string | string[] | undefined,
): InvitationStatus {
  if (state === "expired") {
    return "expired";
  }

  if (state === "invalid") {
    return "invalid";
  }

  return "valid";
}

export default async function AcceptInvitationPage({
  searchParams,
}: AcceptInvitationPageProps) {
  const { state } = await searchParams;

  const invitation = {
    ...mockInvitation,
    status: getInvitationStatus(state),
  };

  const roleLabel = {
    company_admin: "Administrador de empresa",
    company_user: "Usuario",
    read_only: "Solo lectura",
  }[invitation.role];

  const formattedExpiration = new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Santiago",
  }).format(new Date(invitation.expiresAt));

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
              className="h-auto w-[156px] object-contain sm:w-[168px]"
            />
          </Link>
        </div>

        <div className="space-y-8 md:hidden">
          <section className="space-y-5">
            <div className="space-y-2">
              <h1 className="text-[26px] font-semibold tracking-tight text-foreground sm:text-[28px]">
                Activa tu cuenta
              </h1>

              <p className="max-w-[540px] text-[15px] leading-7 text-[#526173]">
                Completa tus datos para ingresar al workspace privado de tu
                empresa.
              </p>
            </div>

            <dl className="space-y-4">
              <div className="space-y-1.5">
                <dt className="text-[13px] font-medium uppercase tracking-wide text-[#526173]">
                  Empresa
                </dt>
                <dd className="text-[16px] font-medium text-foreground">
                  {invitation.tenantName}
                </dd>
              </div>

              <div className="space-y-1.5">
                <dt className="text-[13px] font-medium uppercase tracking-wide text-[#526173]">
                  Correo invitado
                </dt>
                <dd className="break-all text-[16px] font-medium text-foreground">
                  {invitation.email}
                </dd>
              </div>

              <div className="space-y-1.5">
                <dt className="text-[13px] font-medium uppercase tracking-wide text-[#526173]">
                  Rol inicial
                </dt>
                <dd className="text-[16px] font-medium text-foreground">
                  {roleLabel}
                </dd>
              </div>

              <div className="space-y-1.5">
                <dt className="text-[13px] font-medium uppercase tracking-wide text-[#526173]">
                  Vigencia
                </dt>
                <dd className="text-[16px] font-medium text-foreground">
                  {formattedExpiration}
                </dd>
              </div>
            </dl>
          </section>

          <div aria-hidden="true" className="h-px bg-border" />

          <section className="space-y-5">
            <AcceptInvitationForm invitation={invitation} />
          </section>
        </div>

        <div className="hidden md:grid md:grid-cols-[minmax(430px,1fr)_1px_minmax(430px,1fr)] md:gap-x-16 lg:gap-x-20">
          <section className="space-y-6 md:pt-1">
            <div className="space-y-2">
              <h1 className="text-[26px] font-semibold tracking-tight text-foreground sm:text-[28px]">
                Activa tu cuenta
              </h1>

              <p className="max-w-[540px] text-[15px] leading-7 text-[#526173]">
                Completa tus datos para ingresar al workspace privado de tu
                empresa.
              </p>
            </div>

            <dl className="space-y-6">
              <div className="space-y-1.5">
                <dt className="text-[13px] font-medium text-[#526173]">
                  Empresa
                </dt>
                <dd className="text-[17px] font-medium text-foreground">
                  {invitation.tenantName}
                </dd>
              </div>

              <div className="space-y-1.5">
                <dt className="text-[13px] font-medium text-[#526173]">
                  Correo invitado
                </dt>
                <dd className="break-all text-[17px] font-medium text-foreground">
                  {invitation.email}
                </dd>
              </div>

              <div className="space-y-1.5">
                <dt className="text-[13px] font-medium text-[#526173]">
                  Rol inicial
                </dt>
                <dd className="text-[17px] font-medium text-foreground">
                  {roleLabel}
                </dd>
              </div>

              <div className="space-y-1.5">
                <dt className="text-[13px] font-medium text-[#526173]">
                  Vigencia
                </dt>
                <dd className="text-[17px] font-medium text-foreground">
                  {formattedExpiration}
                </dd>
              </div>
            </dl>
          </section>

          <div
            aria-hidden="true"
            className="hidden md:block md:h-[316px] md:w-px md:self-center md:justify-self-center md:bg-border"
          />

          <section className="space-y-6 md:pt-1">
            <AcceptInvitationForm invitation={invitation} />
          </section>
        </div>
      </div>
    </section>
  );
}
