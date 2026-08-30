import Link from "next/link";

import { VeskaLogo } from "@/components/brand/VeskaLogo";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
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
              Recupera tu contraseña
            </h1>

            <p className="mx-auto max-w-[560px] text-[15px] leading-7 text-[#526173] sm:text-[16px]">
              Ingresa el correo asociado a tu cuenta. Si existe una cuenta
              activa, recibirás un enlace para definir una nueva contraseña.
            </p>
          </div>

          <div className="mx-auto w-full max-w-[420px]">
            <ForgotPasswordForm />
          </div>

          <p className="text-center text-sm leading-6 text-[#526173]">
            ¿Recordaste tu contraseña?{" "}
            <Link
              href="/login"
              className="font-medium text-[#427AC6] transition hover:text-[#356AAE]"
            >
              Volver al login
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
