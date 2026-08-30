"use client";

import type { PlatformSetupProcessingFile } from "@/types/platform-setup";

export type PlatformSetupProcessingFileFilter =
  | "all"
  | "uploaded"
  | "processing"
  | "ready"
  | "error";

type ProcessingFileListProps = {
  files: PlatformSetupProcessingFile[];
  filter: PlatformSetupProcessingFileFilter;
  onFilterChange: (filter: PlatformSetupProcessingFileFilter) => void;
};

const filterOptions: Array<{
  value: PlatformSetupProcessingFileFilter;
  label: string;
}> = [
  { value: "all", label: "Todos" },
  { value: "uploaded", label: "Pendientes" },
  { value: "processing", label: "Procesando" },
  { value: "ready", label: "Ready" },
  { value: "error", label: "Con error" },
];

const statusLabels: Record<PlatformSetupProcessingFile["status"], string> = {
  uploaded: "Pendiente",
  processing: "Procesando",
  ready: "Ready",
  error: "Con error",
};

function getFilterRank(status: PlatformSetupProcessingFile["status"]) {
  switch (status) {
    case "error":
      return 0;
    case "processing":
      return 1;
    case "uploaded":
      return 2;
    case "ready":
      return 3;
  }
}

function getTypeLabel(fileType: PlatformSetupProcessingFile["file_type"]) {
  return fileType.toUpperCase();
}

export function ProcessingFileList({
  files,
  filter,
  onFilterChange,
}: ProcessingFileListProps) {
  const filteredFiles =
    filter === "all"
      ? files
      : files.filter((file) => file.status === filter);

  const orderedFiles =
    filter === "all"
      ? [...filteredFiles].sort((left, right) => {
          const rankDifference =
            getFilterRank(left.status) - getFilterRank(right.status);

          if (rankDifference !== 0) {
            return rankDifference;
          }

          return left.relative_path.localeCompare(right.relative_path, "es", {
            numeric: true,
            sensitivity: "base",
          });
        })
      : [...filteredFiles].sort((left, right) =>
          left.relative_path.localeCompare(right.relative_path, "es", {
            numeric: true,
            sensitivity: "base",
          }),
        );

  return (
    <section className="space-y-4 rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h4 className="text-[15px] font-semibold text-[#152436]">
            Documentos procesados
          </h4>

          <p className="mt-1 text-[14px] leading-6 text-[#526173]">
            Vista compacta para revisar la simulación local. El backend futuro validará tenant, permisos, límites, MIME type, rutas y activación transaccional.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => {
            const isActive = option.value === filter;

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => onFilterChange(option.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                  isActive
                    ? "border-[#427AC6] bg-[#EEF4FB] text-[#427AC6]"
                    : "border-[#D9E1EA] bg-white text-[#526173] hover:bg-[#F7F9FC]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-h-[28rem] space-y-3 overflow-auto pr-1">
        {orderedFiles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface px-4 py-6 text-sm leading-6 text-muted-foreground">
            Todavía no hay archivos para mostrar en este filtro.
          </div>
        ) : (
          orderedFiles.map((file) => (
            <article
              key={file.id}
              className="rounded-2xl border border-[#E8EDF3] bg-white px-4 py-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold text-[#152436]">
                    {file.relative_path}
                  </p>

                  <p className="mt-1 text-xs uppercase tracking-wide text-[#7D8A99]">
                    {getTypeLabel(file.file_type)} · {statusLabels[file.status]}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#526173]">
                    {file.error_message
                      ? file.error_message
                      : "Sin error de procesamiento en este momento."}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                    file.status === "ready"
                      ? "border-[#C9DDF7] bg-[#EEF4FB] text-[#427AC6]"
                      : file.status === "processing"
                        ? "border-blue-200 bg-blue-50 text-blue-800"
                        : file.status === "error"
                          ? "border-red-200 bg-red-50 text-red-800"
                          : "border-amber-200 bg-amber-50 text-amber-800"
                  }`}
                >
                  {statusLabels[file.status]}
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
