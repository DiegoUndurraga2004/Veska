"use client";

import { formatFileSize } from "@/lib/formatters";
import type { PlatformSetupBulkImportFile } from "@/types/platform-setup";

type BulkImportFileListProps = {
  files: PlatformSetupBulkImportFile[];
  onRemoveFile: (id: string) => void;
};

function getStatusTone(status: PlatformSetupBulkImportFile["status"]) {
  return status === "valid"
    ? "border-[#C9DDF7] bg-[#EEF4FB] text-[#427AC6]"
    : "border-red-200 bg-red-50 text-red-800";
}

function getTypeLabel(extension: string) {
  return extension.length > 0 ? extension.toUpperCase() : "SIN EXTENSIÓN";
}

export function BulkImportFileList({
  files,
  onRemoveFile,
}: BulkImportFileListProps) {
  return (
    <div className="space-y-3">
      {files.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#D9E1EA] bg-white px-4 py-5 text-sm leading-6 text-[#526173]">
          Todavía no hay archivos preparados. Selecciona una carpeta, un ZIP o usa la estructura demostrativa.
        </p>
      ) : (
        <div className="max-h-[24rem] space-y-3 overflow-auto pr-1">
          {files.map((file) => (
            <article
              key={file.id}
            className="rounded-2xl border border-[#E8EDF3] bg-white px-4 py-4"
          >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold text-[#152436]">
                    {file.relative_path}
                  </p>

                  <p className="mt-1 text-xs text-[#7D8A99]">
                    {getTypeLabel(file.extension)} · {formatFileSize(file.size)}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[#526173]">
                    {file.status === "valid"
                      ? "Archivo válido para el flujo local."
                      : file.error ?? "El archivo no pasó la validación local."}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusTone(file.status)}`}
                  >
                    {file.status === "valid" ? "Válido" : "Error"}
                  </span>

                  <button
                    type="button"
                    onClick={() => onRemoveFile(file.id)}
                    className="rounded-xl border border-[#D9E1EA] px-3 py-2 text-sm font-semibold text-[#152436] transition hover:bg-[#F7F9FC]"
                  >
                    Quitar
                  </button>
                </div>
              </div>

              {file.error && (
                <p
                  role="alert"
                  className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm leading-6 text-red-800"
                >
                  {file.error}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
