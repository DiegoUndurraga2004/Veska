"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

import { BulkImportFileList } from "@/components/platform/setup/BulkImportFileList";
import { formatFileSize } from "@/lib/formatters";
import type { PlatformSetupBulkImportDraft } from "@/types/platform-setup";

type BulkImportSetupStepProps = {
  draft: PlatformSetupBulkImportDraft;
  onSelectFolderFiles: (files: File[]) => void;
  onSelectZipFile: (file: File) => void;
  onUseDemoStructure: () => void;
  onRemoveFile: (id: string) => void;
  onClearSelection: () => void;
  warningMessage: string | null;
};

type FileFilter = "all" | "error" | "valid";

function getExtensionCountLabel(count: number) {
  return `${count} archivo${count === 1 ? "" : "s"}`;
}

export function BulkImportSetupStep({
  draft,
  onSelectFolderFiles,
  onSelectZipFile,
  onUseDemoStructure,
  onRemoveFile,
  onClearSelection,
  warningMessage,
}: BulkImportSetupStepProps) {
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const zipInputRef = useRef<HTMLInputElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [activeFilter, setActiveFilter] = useState<FileFilter>("all");

  useEffect(() => {
    folderInputRef.current?.setAttribute("webkitdirectory", "");
  }, []);

  function handleFolderButtonClick() {
    folderInputRef.current?.click();
  }

  function handleZipButtonClick() {
    zipInputRef.current?.click();
  }

  function handleFolderChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length > 0) {
      onSelectFolderFiles(files);
    }

    event.target.value = "";
  }

  function handleZipChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      onSelectZipFile(file);
    }

    event.target.value = "";
  }

  const validFiles = draft.files.filter((file) => file.status === "valid");
  const filesWithError = draft.files.filter((file) => file.status === "error");
  const totalValidSize = validFiles.reduce((total, file) => total + file.size, 0);
  const orderedFiles = useMemo(() => {
    const indexedFiles = draft.files.map((file, index) => ({
      file,
      index,
    }));

    const filteredFiles =
      activeFilter === "all"
        ? indexedFiles
        : indexedFiles.filter((entry) => entry.file.status === activeFilter);

    const errorFiles = filteredFiles
      .filter((entry) => entry.file.status === "error")
      .sort((left, right) => left.index - right.index);
    const validFilesOrdered = filteredFiles
      .filter((entry) => entry.file.status === "valid")
      .sort((left, right) => left.index - right.index);

    return [...errorFiles, ...validFilesOrdered].map((entry) => entry.file);
  }, [activeFilter, draft.files]);

  function activateErrorFilter() {
    setActiveFilter("error");
    previewRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <section className="space-y-6">
      {warningMessage && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          {warningMessage}
        </p>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <article className="space-y-4 rounded-2xl border border-[#E8EDF3] bg-white p-5">
          <div className="space-y-2">
            <h3 className="text-[15px] font-semibold text-[#152436]">
              Seleccionar carpeta
            </h3>

            <p className="text-[14px] leading-6 text-[#526173]">
              Preserva rutas relativas mediante `webkitRelativePath` cuando el navegador lo permita. Cada archivo captura nombre, ruta, tamaño y validación UX local.
            </p>
          </div>

          <input
            ref={folderInputRef}
            type="file"
            multiple
            className="sr-only"
            onChange={handleFolderChange}
          />

          <button
            type="button"
            onClick={handleFolderButtonClick}
            className="w-full rounded-2xl border border-[#D9E1EA] bg-white px-4 py-4 text-left transition hover:bg-[#F7F9FC]"
          >
            <span className="block text-sm font-semibold text-[#152436]">
              Seleccionar carpeta
            </span>

            <span className="mt-1 block text-sm leading-6 text-[#526173]">
              Carga múltiples archivos y conserva la jerarquía de carpetas para proponer espacios y subespacios.
            </span>
          </button>

          <div className="rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] px-4 py-3 text-xs leading-6 text-[#526173]">
            Límite local orientativo: {getExtensionCountLabel(500)} máximo y {formatFileSize(250 * 1024 * 1024)} de tamaño total razonable.
          </div>
        </article>

        <article className="space-y-4 rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] p-5">
          <div className="space-y-2">
            <h3 className="text-[15px] font-semibold text-[#152436]">
              Seleccionar ZIP
            </h3>

            <p className="text-[14px] leading-6 text-[#526173]">
              La extracción segura del ZIP se realizará posteriormente en backend. Durante development puedes cargar una estructura demostrativa para revisar el flujo.
            </p>
          </div>

          <input
            ref={zipInputRef}
            type="file"
            accept=".zip,application/zip"
            className="sr-only"
            onChange={handleZipChange}
          />

          <div className="space-y-3 rounded-2xl border border-[#E8EDF3] bg-white px-4 py-4">
            <button
              type="button"
              onClick={handleZipButtonClick}
              className="w-full rounded-xl border border-[#D9E1EA] bg-white px-4 py-3 text-left transition hover:bg-[#F7F9FC]"
            >
              <span className="block text-sm font-semibold text-[#152436]">
                Seleccionar ZIP
              </span>

              <span className="mt-1 block text-sm leading-6 text-[#526173]">
                Solo se registra el contenedor. La estructura interna no se descomprime todavía en frontend.
              </span>
            </button>

            <button
              type="button"
              onClick={onUseDemoStructure}
              className="w-full rounded-xl bg-[#427AC6] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#356AAE]"
            >
              Usar estructura demostrativa
            </button>
          </div>

          <p className="rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] px-4 py-3 text-xs leading-6 text-[#526173]">
            El backend futuro volverá a validar MIME type, tamaño, tenant, permisos, rutas relativas, profundidad, path traversal y límites de importación.
          </p>
        </article>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#E8EDF3] bg-white px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
            Archivos recibidos
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#152436]">
            {draft.files.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E8EDF3] bg-white px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
            Archivos válidos
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#152436]">
            {validFiles.length}
          </p>
        </div>

        <button
          type="button"
          onClick={activateErrorFilter}
          disabled={filesWithError.length === 0}
          className="rounded-2xl border border-[#E8EDF3] bg-white px-4 py-4 text-left transition hover:bg-[#F7F9FC] disabled:cursor-default disabled:opacity-70"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
            Archivos con error
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#152436]">
            {filesWithError.length}
          </p>
          <p className="mt-2 text-xs leading-5 text-[#526173]">
            {filesWithError.length > 0
              ? "Ver archivos con error"
              : "No hay archivos con error"}
          </p>
        </button>

        <div className="rounded-2xl border border-[#E8EDF3] bg-white px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
            Tamaño total
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#152436]">
            {formatFileSize(draft.total_size)}
          </p>
          <p className="mt-1 text-xs leading-5 text-[#526173]">
            Tamaño válido: {formatFileSize(totalValidSize)}
          </p>
        </div>
      </div>

      {filesWithError.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-amber-900">
            Hay {filesWithError.length} archivos que requieren revisión.
          </p>

          <button
            type="button"
            onClick={activateErrorFilter}
            className="rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
          >
            Ver archivos con error
          </button>
        </div>
      )}

      <div ref={previewRef} className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <article className="space-y-4 rounded-2xl border border-border bg-surface-muted p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Preview documental
              </h3>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Vista compacta de rutas relativas, tipos, tamaños y estado local antes de pasar al paso de espacios sugeridos.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                aria-pressed={activeFilter === "all"}
                className={`rounded-full border px-3 py-1 transition ${
                  activeFilter === "all"
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-border bg-surface text-muted-foreground hover:bg-surface-muted"
                }`}
              >
                Todos
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter("error")}
                aria-pressed={activeFilter === "error"}
                className={`rounded-full border px-3 py-1 transition ${
                  activeFilter === "error"
                    ? "border-red-300 bg-red-50 text-red-800"
                    : "border-border bg-surface text-muted-foreground hover:bg-surface-muted"
                }`}
              >
                Con error ({filesWithError.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter("valid")}
                aria-pressed={activeFilter === "valid"}
                className={`rounded-full border px-3 py-1 transition ${
                  activeFilter === "valid"
                    ? "border-[#C9DDF7] bg-[#EEF4FB] text-[#427AC6]"
                    : "border-border bg-surface text-muted-foreground hover:bg-surface-muted"
                }`}
              >
                Válidos ({validFiles.length})
              </button>
            </div>
          </div>

          <BulkImportFileList files={orderedFiles} onRemoveFile={onRemoveFile} />
        </article>

        <article className="space-y-4 rounded-2xl border border-border bg-surface-muted p-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">
              Estado local
            </h3>

            <p className="text-sm leading-6 text-muted-foreground">
              La selección es solo una simulación frontend. Puedes quitar archivos uno por uno o limpiar todo el conjunto antes de seguir.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-border bg-surface px-4 py-4">
            <p className="text-sm font-semibold text-foreground">
              Fuente actual
            </p>

            <p className="text-sm leading-6 text-muted-foreground">
              {draft.source === "folder"
                ? "Carpeta local"
                : draft.source === "zip"
                  ? `ZIP${draft.zip_file_name ? `: ${draft.zip_file_name}` : ""}`
                  : "Ninguna selección todavía"}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClearSelection}
              disabled={draft.files.length === 0 && draft.source === null && draft.zip_file_name === null}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Limpiar selección
            </button>

            <button
              type="button"
              onClick={onUseDemoStructure}
              className="rounded-xl bg-[#427AC6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#356AAE]"
            >
              Usar estructura demostrativa
            </button>
          </div>

          {draft.files.length === 0 ? (
            <p className="rounded-2xl border border-border bg-surface px-4 py-3 text-xs leading-5 text-muted-foreground">
              Todavía no cargaste documentos. Podrás completar la importación posteriormente, pero la empresa no estará lista para activarse.
            </p>
          ) : (
            <p className="rounded-2xl border border-border bg-surface px-4 py-3 text-xs leading-5 text-muted-foreground">
              Puedes quitar archivos individuales o limpiar la selección completa antes de continuar.
            </p>
          )}
        </article>
      </div>
    </section>
  );
}
