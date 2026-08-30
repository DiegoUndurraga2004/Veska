import Link from "next/link";

import { VeskaLogo } from "@/components/brand/VeskaLogo";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-[#F7F9FC] px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <section className="mx-auto flex w-full max-w-[640px] flex-col items-center text-center">
        <Link
          href="/login"
          className="inline-flex items-center"
        >
          <VeskaLogo
            variant="full"
            className="h-auto w-[156px] object-contain sm:w-[168px]"
          />
        </Link>

        <div className="mt-12 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF6E5] text-[22px] font-semibold text-[#A56A12] ring-8 ring-[#A56A12]/10 sm:mt-14">
          !
        </div>

        <h1 className="mt-8 text-[28px] font-semibold tracking-tight text-[#152436] sm:text-[32px]">
          No tienes acceso a esta sección
        </h1>

        <p className="mt-3 max-w-[560px] text-[15px] leading-7 text-[#526173] sm:text-[16px]">
          Tu cuenta no tiene permisos para ver este contenido. Si crees que
          esto es un error, contacta al administrador de tu empresa.
        </p>

        <div className="mt-8 flex w-full flex-col items-center">
          <Link
            href="/dashboard"
            className="inline-flex h-12 w-full max-w-[360px] items-center justify-center rounded-lg bg-[#427AC6] px-5 text-[15px] font-medium text-white transition hover:bg-[#356AAE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6]/15 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F9FC]"
          >
            Volver al dashboard
          </Link>

          <Link
            href="/login"
            className="mt-4 inline-flex h-11 items-center justify-center rounded-lg px-4 text-[14px] font-medium text-[#526173] transition hover:text-[#356AAE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6]/15 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F9FC]"
          >
            Ir al login
          </Link>
        </div>
      </section>
    </main>
  );
}
