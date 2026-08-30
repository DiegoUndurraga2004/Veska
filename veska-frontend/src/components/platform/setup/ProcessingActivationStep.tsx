"use client";

import type {
  PlatformSetupActivationChecklistItem,
  PlatformSetupProcessingFile,
  PlatformSetupProcessingStatus,
} from "@/types/platform-setup";

import { ActivationChecklist } from "./ActivationChecklist";
import {
  type PlatformSetupProcessingFileFilter,
  ProcessingFileList,
} from "./ProcessingFileList";

type ProcessingActivationStepProps = {
  processingFiles: PlatformSetupProcessingFile[];
  processingStatus: PlatformSetupProcessingStatus;
  processingFilter: PlatformSetupProcessingFileFilter;
  processingProgress: {
    pending: number;
    processing: number;
    ready: number;
    error: number;
    total: number;
    percentage: number;
  };
  activationChecklist: PlatformSetupActivationChecklistItem[];
  preparedDocumentsCount: number;
  validationErrorCount: number;
  activeSpacesCount: number;
  permissionsConfiguredCount: number;
  spacesWithoutCoverageCount: number;
  hasDocuments: boolean;
  canActivate: boolean;
  canFinalizeWithoutActivation: boolean;
  activationBlockingReasons: string[];
  processingFeedback: {
    tone: "success" | "error" | "info";
    message: string | null;
  };
  onFilterChange: (filter: PlatformSetupProcessingFileFilter) => void;
  onStartProcessing: () => void;
  onRetryFailed: () => void;
  onRequestActivationConfirmation: (mode: "activate" | "finalize") => void;
};

function getToneStyles(tone: ProcessingActivationStepProps["processingFeedback"]["tone"]) {
  switch (tone) {
    case "success":
      return "border-[#C9DDF7] bg-[#EEF4FB] text-[#152436]";
    case "error":
      return "border-red-200 bg-red-50 text-red-900";
    case "info":
      return "border-[#E8EDF3] bg-[#F7F9FC] text-[#526173]";
  }
}

export function ProcessingActivationStep({
  processingFiles,
  processingStatus,
  processingFilter,
  processingProgress,
  activationChecklist,
  preparedDocumentsCount,
  validationErrorCount,
  activeSpacesCount,
  permissionsConfiguredCount,
  spacesWithoutCoverageCount,
  hasDocuments,
  canActivate,
  canFinalizeWithoutActivation,
  activationBlockingReasons,
  processingFeedback,
  onFilterChange,
  onStartProcessing,
  onRetryFailed,
  onRequestActivationConfirmation,
}: ProcessingActivationStepProps) {
  const readyToActivate = canActivate && processingStatus !== "idle";

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-[22px] font-semibold tracking-tight text-[#152436]">
          Procesamiento y activación
        </h3>

        <p className="max-w-4xl text-[14px] leading-6 text-[#526173]">
          archivos válidos recibidos
          <br />
          validación backend
          <br />
          extracción de texto
          <br />
          chunking
          <br />
          embeddings
          <br />
          document.status = ready
          <br />
          activación de empresa
        </p>

        <p className="max-w-4xl text-[14px] leading-6 text-[#526173]">
          La simulación representa el procesamiento futuro en backend. No se están enviando archivos ni generando embeddings reales.
        </p>
      </div>

      {processingFeedback.message ? (
        <p
          className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${getToneStyles(processingFeedback.tone)}`}
        >
          {processingFeedback.message}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
            Documentos válidos preparados
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#152436]">
            {preparedDocumentsCount}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
            Documentos con error previo
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#152436]">
            {validationErrorCount}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
            Espacios activos
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#152436]">
            {activeSpacesCount}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
            Permisos configurados
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#152436]">
            {permissionsConfiguredCount}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
            Espacios pendientes de cobertura
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#152436]">
            {spacesWithoutCoverageCount}
          </p>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h4 className="text-[15px] font-semibold text-[#152436]">
              Progreso general
            </h4>

            <p className="mt-1 text-[14px] leading-6 text-[#526173]">
              {processingProgress.percentage} %
            </p>
          </div>

          <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
            {processingStatus === "idle"
              ? "Aún no se inicia la simulación"
              : processingStatus === "running"
                ? "Simulación en curso"
                : processingStatus === "completed_with_errors"
                  ? "Simulación completada con errores"
                  : processingStatus === "completed"
                    ? "Simulación completada"
                    : "Sin documentos válidos"}
          </p>
        </div>

        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={processingProgress.percentage}
          aria-valuetext={`${processingProgress.percentage}% completado`}
          className="h-3 overflow-hidden rounded-full bg-[#E8EDF3]"
        >
          <div
            className="h-full rounded-full bg-brand transition-all"
            style={{ width: `${processingProgress.percentage}%` }}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-[#E8EDF3] bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
              Pendientes
            </p>
            <p className="mt-2 text-xl font-semibold text-[#152436]">
              {processingProgress.pending}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8EDF3] bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
              En procesamiento
            </p>
            <p className="mt-2 text-xl font-semibold text-[#152436]">
              {processingProgress.processing}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8EDF3] bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
              Listos para consulta
            </p>
            <p className="mt-2 text-xl font-semibold text-[#152436]">
              {processingProgress.ready}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8EDF3] bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
              Con error de procesamiento
            </p>
            <p className="mt-2 text-xl font-semibold text-[#152436]">
              {processingProgress.error}
            </p>
          </div>
        </div>
      </div>

      {hasDocuments ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          {processingStatus === "idle" ? (
            <button
              type="button"
              onClick={onStartProcessing}
              className="rounded-xl bg-[#427AC6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#356AAE] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Iniciar procesamiento simulado
            </button>
          ) : (
            <button
              type="button"
              onClick={onStartProcessing}
              disabled={processingStatus === "running"}
              className="rounded-xl bg-[#427AC6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#356AAE] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {processingStatus === "running"
                ? "Procesamiento en curso"
                : "Reiniciar simulación"}
            </button>
          )}

          <button
            type="button"
            onClick={onRetryFailed}
            disabled={processingProgress.error === 0}
            className="rounded-xl border border-[#D9E1EA] px-4 py-2.5 text-sm font-semibold text-[#152436] transition hover:bg-[#F7F9FC] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reintentar fallidos
          </button>
        </div>
      ) : (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          No hay documentos válidos importados. Puedes finalizar el setup sin activar la empresa documentalmente.
        </p>
      )}

      <ProcessingFileList
        files={processingFiles}
        filter={processingFilter}
        onFilterChange={onFilterChange}
      />

      <ActivationChecklist items={activationChecklist} />

      <section className="space-y-4 rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] p-4">
        <div>
          <h4 className="text-sm font-semibold text-[#152436]">
            Activación local
          </h4>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            La decisión de activación queda simulada en memoria local. El backend futuro validará tenant, permisos, límites, MIME type, rutas, procesamiento documental y activación transaccional.
          </p>
        </div>

        {activationBlockingReasons.length > 0 ? (
          <ul className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            {activationBlockingReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          {hasDocuments ? (
            <button
              type="button"
              onClick={() => onRequestActivationConfirmation("activate")}
              disabled={!readyToActivate}
              className="rounded-xl bg-[#427AC6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#356AAE] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Activar empresa simulada
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onRequestActivationConfirmation("finalize")}
              disabled={!canFinalizeWithoutActivation}
              className="rounded-xl bg-[#427AC6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#356AAE] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Finalizar setup sin activar
            </button>
          )}
        </div>
      </section>
    </section>
  );
}
