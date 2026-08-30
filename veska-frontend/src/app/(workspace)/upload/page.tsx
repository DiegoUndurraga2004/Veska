import { UploadManager } from "@/components/documents/UploadManager";
import { mockWorkspaceSession } from "@/mocks/session.mock";
import type { UserRole } from "@/types/auth";

function canUploadDocuments(role: UserRole) {
  return (
    role === "platform_admin" ||
    role === "company_admin" ||
    role === "company_user"
  );
}

export default function UploadPage() {
  const allowUploads = canUploadDocuments(
    mockWorkspaceSession.user.role,
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-1 pt-1 sm:px-0">
      <section className="max-w-3xl space-y-2">
        <p className="text-sm font-semibold text-[#526173]">
          Documentos / Subir documentos
        </p>

        <h1 className="text-[clamp(1.75rem,2.4vw,2.125rem)] font-semibold leading-[1.2] tracking-tight text-[#152436] sm:text-[clamp(1.875rem,2.8vw,2.125rem)]">
          Sube documentos a tu workspace
        </h1>

        <p className="max-w-2xl text-[14px] leading-6 text-[#526173] sm:text-[15px]">
          Agrega archivos internos para convertirlos en fuentes consultables.
        </p>
      </section>

      {!allowUploads && (
        <section className="rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] px-5 py-4">
          <p className="text-sm font-semibold text-[#152436]">
            Tu nivel de acceso no permite subir documentos
          </p>

          <p className="mt-1 text-sm leading-6 text-[#526173]">
            Puedes revisar la biblioteca y utilizar los documentos
            disponibles, pero necesitas permisos adicionales para agregar
            nuevos archivos.
          </p>
        </section>
      )}

      <UploadManager disabled={!allowUploads} />
    </div>
  );
}
