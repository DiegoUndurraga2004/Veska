"use client";

import type { DocumentListItem } from "@/types/documents";

type DeleteDocumentDialogProps = {
  document: DocumentListItem | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteDocumentDialog({
  document,
  onCancel,
  onConfirm,
}: DeleteDocumentDialogProps) {
  if (!document) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-document-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-5 py-10"
    >
      <button
        type="button"
        aria-label="Cerrar confirmación"
        onClick={onCancel}
        className="absolute inset-0 bg-black/35"
      />

      <section className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
        <h2
          id="delete-document-title"
          className="text-lg font-semibold text-foreground"
        >
          Eliminar documento
        </h2>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Estás a punto de eliminar:
        </p>

        <p className="mt-2 break-words text-sm font-semibold text-foreground">
          {document.file_name}
        </p>

        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          El archivo dejará de aparecer en la biblioteca y no podrá utilizarse
          como fuente en nuevas consultas.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-85"
          >
            Eliminar documento
          </button>
        </div>
      </section>
    </div>
  );
}
