import Link from "next/link";

import { VeskaLogo } from "@/components/brand/VeskaLogo";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <section className="w-full self-start">
      <div className="mx-auto flex w-full max-w-[640px] flex-col px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
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

        <div className="space-y-6">
          <div className="space-y-3 text-center">
            <h1 className="text-[28px] font-semibold tracking-tight text-[#152436] sm:text-[32px]">
              Define una nueva contraseña
            </h1>

            <p className="mx-auto max-w-[560px] text-[15px] leading-7 text-[#526173] sm:text-[16px]">
              Ingresa una contraseña nueva para recuperar el acceso a tu
              workspace.
            </p>
          </div>

          <div className="mx-auto w-full max-w-[420px]">
            <ResetPasswordForm />
          </div>

          <p className="text-center text-sm leading-6 text-[#526173]">
            ¿Necesitas solicitar otro enlace?{" "}
            <Link
              href="/forgot-password"
              className="font-medium text-[#427AC6] transition hover:text-[#356AAE]"
            >
              Volver a recuperación
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
