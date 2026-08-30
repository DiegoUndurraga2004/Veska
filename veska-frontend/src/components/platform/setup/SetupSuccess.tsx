import Link from "next/link";

import type { PlatformSetupActivationResult } from "@/types/platform-setup";

type SetupSuccessProps = {
  result: PlatformSetupActivationResult;
};

const statusLabels = {
  active: "active",
  inactive: "inactive",
  trial: "trial",
} as const;

const modeLabels = {
  activated: "Activada",
  finalized_without_activation: "Finalizada sin activar",
} as const;

const providerLabels = {
  openai: "OpenAI API",
  runpod: "Runpod privado",
} as const;

function getChecklistCounts(result: PlatformSetupActivationResult) {
  return result.activation_checklist.reduce(
    (accumulator, item) => {
      accumulator[item.status] += 1;
      return accumulator;
    },
    {
      completed: 0,
      pending: 0,
      requires_review: 0,
    },
  );
}

function getVisibleStatusLabel(result: PlatformSetupActivationResult) {
  return statusLabels[result.status];
}

export function SetupSuccess({ result }: SetupSuccessProps) {
  const checklistCounts = getChecklistCounts(result);

  return (
    <section className="space-y-6 rounded-[16px] border border-[#E8EDF3] bg-white p-6 shadow-[0_1px_2px_rgba(21,36,54,0.04)]">
      <div className="space-y-3">
        <p className="inline-flex rounded-full border border-[#C9DDF7] bg-[#EEF4FB] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#427AC6]">
          {modeLabels[result.mode]}
        </p>

        <h2 className="text-[24px] font-semibold tracking-tight text-[#152436] sm:text-[28px]">
          {result.mode === "activated"
            ? "Empresa activada localmente"
            : "Setup finalizado sin activar"}
        </h2>

        <p className="max-w-3xl text-[14px] leading-6 text-[#526173]">
          La confirmación definitiva del wizard ocurrió en el último paso. Esta pantalla solo refleja estado y métricas en memoria local; no hay persistencia ni activación real contra backend.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
            Tenant local simulado
          </p>
          <p className="mt-2 break-all text-sm font-mono font-semibold text-[#152436]">
            {result.local_tenant_id}
          </p>
        </article>

        <article className="rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
            Status visible
          </p>
          <p className="mt-2 text-sm font-semibold text-[#152436]">
            {getVisibleStatusLabel(result)}
          </p>
        </article>

        <article className="rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
            Documentos ready
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#152436]">
            {result.metrics.documents_ready}
          </p>
        </article>

        <article className="rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
            Errores ignorados o removidos
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#152436]">
            {result.metrics.errors_ignored_or_removed}
          </p>
        </article>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <article className="space-y-4 rounded-2xl border border-[#E8EDF3] bg-white p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
                Empresa
              </p>
              <p className="mt-1 text-sm font-semibold text-[#152436]">
                {result.draft.company.name}
              </p>
              <p className="text-xs text-[#526173]">
                {result.draft.company.slug}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
                Configuración IA
              </p>
              <p className="mt-1 text-sm font-semibold text-[#152436]">
                {providerLabels[result.draft.ai.provider]}
              </p>
              <p className="text-xs text-[#526173]">
                {result.draft.ai.enabled ? "habilitado" : "deshabilitado"} ·{" "}
                {result.draft.ai.model_name}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
                Administrador inicial
              </p>
              <p className="mt-1 text-sm font-semibold text-[#152436]">
                {result.draft.initial_admin.full_name}
              </p>
              <p className="text-xs text-[#526173]">
                {result.draft.initial_admin.email}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
                Métricas finales
              </p>
              <p className="mt-1 text-sm font-semibold text-[#152436]">
                {result.metrics.active_spaces} espacios activos · {result.metrics.permissions_configured} permisos
              </p>
              <p className="text-xs text-[#526173]">
                {result.metrics.documents_with_processing_errors} errores de procesamiento · {result.metrics.documents_with_validation_errors} errores previos
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] px-4 py-4">
            <p className="text-sm font-semibold text-[#152436]">
              Checklist de activación
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#E8EDF3] bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
                  Completado
                </p>
                <p className="mt-2 text-2xl font-semibold text-[#152436]">
                  {checklistCounts.completed}
                </p>
              </div>

              <div className="rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
                  Pendiente
                </p>
                <p className="mt-2 text-2xl font-semibold text-[#152436]">
                  {checklistCounts.pending}
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Requiere revisión
                </p>
                <p className="mt-2 text-2xl font-semibold text-amber-900">
                  {checklistCounts.requires_review}
                </p>
              </div>
            </div>
          </div>
        </article>

        <article className="space-y-4 rounded-2xl border border-[#E8EDF3] bg-white p-4">
          <div>
            <h3 className="text-sm font-semibold text-[#152436]">
              Procesamiento documental
            </h3>
            <p className="mt-1 text-sm leading-6 text-[#526173]">
              Documentos preparados: {result.metrics.documents_ready}. El frontend solo simula estados, errores y activación local.
            </p>
          </div>

          <div className="space-y-3 max-h-72 overflow-auto pr-1">
            {result.processing_files.length === 0 ? (
              <p className="rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] px-4 py-4 text-sm text-[#526173]">
                No hubo documentos válidos para procesar.
              </p>
            ) : (
              result.processing_files.map((file) => (
                <div
                  key={file.id}
                  className="rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] px-4 py-3"
                >
                  <p className="break-words text-sm font-semibold text-[#152436]">
                    {file.relative_path}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-[#7D8A99]">
                    {file.file_type} · {file.status}
                  </p>
                  {file.error_message ? (
                    <p className="mt-2 text-sm leading-6 text-[#526173]">
                      {file.error_message}
                    </p>
                  ) : null}
                </div>
              ))
            )}
          </div>

          <div className="rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] px-4 py-4 text-sm leading-6 text-[#526173]">
            El tenant queda en estado visible <span className="font-semibold text-[#152436]">{getVisibleStatusLabel(result)}</span>.
          </div>
        </article>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/platform"
          className="inline-flex rounded-xl bg-[#427AC6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#356AAE]"
        >
          Volver al panel interno
        </Link>
      </div>
    </section>
  );
}
