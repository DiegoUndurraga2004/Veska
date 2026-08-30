"use client";

import { useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";

import { DeleteDocumentDialog } from "@/components/documents/DeleteDocumentDialog";
import { formatDateTime, formatFileSize, formatNumber } from "@/lib/formatters";
import type { UserRole } from "@/types/auth";
import type { DocumentDetail } from "@/types/documents";

type DocumentDetailViewProps = {
  document: DocumentDetail;
  role: UserRole;
};

const deleteAllowedRoles: UserRole[] = [
  "platform_admin",
  "company_admin",
];

function getFileExtension(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex === -1) {
    return "";
  }

  return fileName.slice(lastDotIndex + 1).toLocaleLowerCase("es-CL");
}

function getSourceLabel(sourceType: DocumentDetail["source_type"]) {
  if (sourceType === "upload") {
    return "Carga manual";
  }

  return "Sincronización externa";
}

export function DocumentDetailView({
  document,
  role,
}: DocumentDetailViewProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentDocument, setCurrentDocument] = useState(document);
  const [openNoticeVisible, setOpenNoticeVisible] = useState(false);
  const [replacementNoticeVisible, setReplacementNoticeVisible] =
    useState(false);
  const [pendingReplacementFile, setPendingReplacementFile] =
    useState<File | null>(null);
  const [replacementError, setReplacementError] = useState<string | null>(
    null,
  );
  const [documentPendingDeletion, setDocumentPendingDeletion] =
    useState<DocumentDetail | null>(null);

  const isReplacementProcessing =
    currentDocument.status === "processing" &&
    currentDocument.version > document.version;

  const canDeleteDocument =
    deleteAllowedRoles.includes(role) &&
    currentDocument.status !== "deleted";

  const canOpenOriginal = currentDocument.status === "ready";
  const canUpdateDocument =
    deleteAllowedRoles.includes(role) &&
    currentDocument.status !== "deleted" &&
    !isReplacementProcessing;

  function openReplacementPicker() {
    setReplacementError(null);
    fileInputRef.current?.click();
  }

  function handleReplacementFileSelection(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.currentTarget.files?.[0] ?? null;

    event.currentTarget.value = "";

    if (!file) {
      setReplacementError("Debes seleccionar un archivo para continuar.");
      setPendingReplacementFile(null);
      return;
    }

    if (file.size <= 0) {
      setReplacementError("El archivo seleccionado está vacío.");
      setPendingReplacementFile(null);
      return;
    }

    const expectedExtension = currentDocument.file_type.toLocaleLowerCase(
      "es-CL",
    );
    const selectedExtension = getFileExtension(file.name);

    if (selectedExtension !== expectedExtension) {
      setReplacementError(
        `El reemplazo debe conservar la extensión .${expectedExtension}.`,
      );
      setPendingReplacementFile(null);
      return;
    }

    setReplacementError(null);
    setPendingReplacementFile(file);
  }

  function cancelReplacement() {
    setPendingReplacementFile(null);
  }

  function confirmReplacement() {
    if (!pendingReplacementFile) {
      setReplacementError("Debes seleccionar un archivo para continuar.");
      return;
    }

    setReplacementError(null);

    // El backend futuro debe crear una nueva versión, procesar su contenido
    // y activar la versión nueva de forma atómica, conservando o archivando
    // la versión anterior según la política definida.
    setCurrentDocument((current) => ({
      ...current,
      version: current.version + 1,
      status: "processing",
      file_size: pendingReplacementFile.size,
      updated_at: new Date().toISOString(),
      last_processed_at: current.last_processed_at,
      page_count: null,
      sheet_count: null,
      text_length: null,
      error_message: null,
      extracted_text: null,
    }));
    setPendingReplacementFile(null);
    setOpenNoticeVisible(false);
    setReplacementNoticeVisible(true);
  }

  function openOriginalFile() {
    setOpenNoticeVisible(true);
  }

  function requestDeletion() {
    setDocumentPendingDeletion(currentDocument);
  }

  function cancelDeletion() {
    setDocumentPendingDeletion(null);
  }

  function confirmDeletion() {
    setCurrentDocument((current) => ({
      ...current,
      status: "deleted",
    }));
    setDocumentPendingDeletion(null);
    setOpenNoticeVisible(false);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-1 pt-1 sm:px-0">
      <Link
        href="/documents"
        className="inline-flex items-center text-sm font-semibold text-[#526173] transition hover:text-[#152436]"
      >
        ← Volver a biblioteca
      </Link>

      <section className="max-w-4xl space-y-3">
        <h1 className="break-words text-[clamp(1.875rem,3vw,2.375rem)] font-semibold leading-[1.15] tracking-tight text-[#152436]">
          {currentDocument.file_name}
        </h1>

        <p className="text-[14px] font-medium leading-6 text-[#526173] sm:text-[15px]">
          {currentDocument.file_type.toUpperCase()} ·{" "}
          {formatFileSize(currentDocument.file_size)}
        </p>

        <p className="max-w-4xl text-[14px] leading-6 text-[#526173] sm:text-[15px]">
          {currentDocument.relative_path}
        </p>
      </section>

      <section className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {canOpenOriginal ? (
            <button
              type="button"
              onClick={openOriginalFile}
              className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-[#D9E1EA] bg-white px-4 text-sm font-semibold text-[#152436] transition hover:bg-[#F7F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Abrir archivo original
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex h-12 w-full cursor-not-allowed items-center justify-center rounded-xl border border-[#D9E1EA] bg-white px-4 text-sm font-semibold text-[#7D8A99] opacity-60"
            >
              Abrir archivo original
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={`.${currentDocument.file_type}`}
            onChange={handleReplacementFileSelection}
            className="sr-only"
          />

          {canUpdateDocument ? (
            <button
              type="button"
              onClick={openReplacementPicker}
              className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-[#D9E1EA] bg-white px-4 text-sm font-semibold text-[#152436] transition hover:bg-[#F7F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Actualizar archivo
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex h-12 w-full cursor-not-allowed items-center justify-center rounded-xl border border-[#D9E1EA] bg-white px-4 text-sm font-semibold text-[#7D8A99] opacity-60"
            >
              Actualizar archivo
            </button>
          )}

          <Link
            href="/chats/new"
            className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-[#427AC6] bg-[#427AC6] px-4 text-sm font-semibold text-white transition hover:bg-[#356AAE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Iniciar nuevo chat
          </Link>

          {canDeleteDocument && (
            <button
              type="button"
              onClick={requestDeletion}
              disabled={isReplacementProcessing}
              className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-[#FFB4B4] bg-[#FFF5F5] px-4 text-sm font-semibold text-[#C1121F] transition hover:bg-[#FFECEC] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Eliminar documento
            </button>
          )}
        </div>

        {openNoticeVisible && (
          <div
            role="status"
            className="rounded-xl border border-[#D9E1EA] bg-[#F7F9FC] px-4 py-3 text-sm leading-6 text-[#526173]"
          >
            La apertura segura del archivo original se conectará mediante una
            URL temporal validada por el backend.
          </div>
        )}

        {replacementNoticeVisible && (
          <div
            role="status"
            className="rounded-xl border border-[#D9E1EA] bg-[#F7F9FC] px-4 py-3 text-sm leading-6 text-[#526173]"
          >
            La nueva versión fue enviada y está pendiente de procesamiento.
          </div>
        )}

        {replacementError && (
          <div
            role="alert"
            className="rounded-xl border border-[#FFB4B4] bg-[#FFF5F5] px-4 py-3 text-sm leading-6 text-[#C1121F]"
          >
            {replacementError}
          </div>
        )}
      </section>

      <section className="max-w-4xl space-y-4 pt-2">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-base font-semibold text-[#152436]">
            Metadata del documento
          </h2>
        </div>

        <dl className="divide-y divide-[#E8EDF3] border-t border-[#E8EDF3]">
          <div className="grid gap-1 py-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6 sm:py-3.5">
            <dt className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7D8A99]">
              Espacio
            </dt>
            <dd className="text-[15px] leading-6 text-[#152436]">
              {currentDocument.space.path}
            </dd>
          </div>

          <div className="grid gap-1 py-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6 sm:py-3.5">
            <dt className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7D8A99]">
              Origen documental
            </dt>
            <dd className="text-[15px] leading-6 text-[#152436]">
              {getSourceLabel(currentDocument.source_type)}
            </dd>
          </div>

          <div className="grid gap-1 py-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6 sm:py-3.5">
            <dt className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7D8A99]">
              Subido por
            </dt>
            <dd className="text-[15px] leading-6 text-[#152436]">
              {currentDocument.uploaded_by.name ?? "Usuario desconocido"}
            </dd>
          </div>

          <div className="grid gap-1 py-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6 sm:py-3.5">
            <dt className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7D8A99]">
              Última modificación
            </dt>
            <dd className="text-[15px] leading-6 text-[#152436]">
              {formatDateTime(currentDocument.updated_at)}
            </dd>
          </div>

          <div className="grid gap-1 py-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6 sm:py-3.5">
            <dt className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7D8A99]">
              Páginas
            </dt>
            <dd className="text-[15px] leading-6 text-[#152436]">
              {currentDocument.page_count !== null
                ? formatNumber(currentDocument.page_count)
                : "No disponible"}
            </dd>
          </div>
        </dl>
      </section>

      <DeleteDocumentDialog
        document={documentPendingDeletion}
        onCancel={cancelDeletion}
        onConfirm={confirmDeletion}
      />

      {pendingReplacementFile && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="replace-document-title"
          className="fixed inset-0 z-50 flex items-center justify-center px-5 py-10"
        >
          <button
            type="button"
            aria-label="Cerrar confirmación"
            onClick={cancelReplacement}
            className="absolute inset-0 bg-black/35"
          />

          <section className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h2
              id="replace-document-title"
              className="text-lg font-semibold text-foreground"
            >
              Actualizar archivo
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Esta acción reemplazará el contenido del documento y activará un
              nuevo procesamiento. El espacio y la ruta relativa se conservarán.
            </p>

            <dl className="mt-5 space-y-3 rounded-xl border border-border bg-surface-muted px-4 py-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="font-medium text-muted-foreground">
                  Archivo actual
                </dt>
                <dd className="text-right font-semibold text-foreground">
                  {currentDocument.file_name}
                </dd>
              </div>

              <div className="flex items-start justify-between gap-4">
                <dt className="font-medium text-muted-foreground">
                  Archivo seleccionado
                </dt>
                <dd className="text-right font-semibold text-foreground">
                  {pendingReplacementFile.name}
                </dd>
              </div>

              <div className="flex items-start justify-between gap-4">
                <dt className="font-medium text-muted-foreground">Versión</dt>
                <dd className="text-right font-semibold text-foreground">
                  v{currentDocument.version + 1}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelReplacement}
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmReplacement}
                className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
              >
                Confirmar actualización
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
