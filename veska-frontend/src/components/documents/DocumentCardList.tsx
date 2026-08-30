"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { DocumentStatusBadge } from "@/components/documents/DocumentStatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDateTime, formatFileSize } from "@/lib/formatters";
import type { DocumentListItem } from "@/types/documents";

type DocumentCardListProps = {
  documents: DocumentListItem[];
  canDeleteDocuments: boolean;
  onRequestDelete: (document: DocumentListItem) => void;
  emptyState: {
    title: string;
    description: string;
    action?: ReactNode;
  };
};

function getProcessingMessage(document: DocumentListItem) {
  if (document.status === "error") {
    return "No pudimos procesar este documento.";
  }

  if (document.status === "processing") {
    return "Extrayendo texto y preparando fuentes.";
  }

  if (document.status === "uploaded") {
    return "Archivo recibido, esperando procesamiento.";
  }

  return null;
}

export function DocumentCardList({
  documents,
  canDeleteDocuments,
  onRequestDelete,
  emptyState,
}: DocumentCardListProps) {
  if (documents.length === 0) {
    return (
      <section className="overflow-hidden border-y border-border bg-surface">
        <EmptyState
          title={emptyState.title}
          description={emptyState.description}
          action={emptyState.action}
        />
      </section>
    );
  }

  return (
    <section className="divide-y divide-border border-y border-border bg-surface">
      {documents.map((document) => {
        const processingMessage = getProcessingMessage(document);

        return (
          <article
            key={document.id}
            className="px-0 py-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words text-[14px] font-semibold leading-5 text-[#152436]">
                  {document.file_name}
                </p>

                <p
                  className="mt-2 truncate text-[12px] leading-5 text-[#526173]"
                  title={document.relative_path}
                >
                  Ruta relativa: {document.relative_path}
                </p>

                <p className="mt-2 text-[12px] leading-5 text-[#526173]">
                  {document.file_type.toUpperCase()} ·{" "}
                  {formatFileSize(document.file_size)}
                  {document.page_count !== null
                    ? ` · ${document.page_count} páginas`
                    : ""}
                </p>
              </div>

              <div className="shrink-0">
                <DocumentStatusBadge status={document.status} />
              </div>
            </div>

            {processingMessage && (
              <p className="mt-3 border-t border-border pt-3 text-[12px] leading-5 text-[#526173]">
                {processingMessage}
              </p>
            )}

            <dl className="mt-4 grid gap-3 border-t border-border pt-4 text-[12px]">
              <div>
                <dt className="font-semibold uppercase tracking-[0.16em] text-[#526173]">
                  Subido por
                </dt>

                <dd className="mt-1 text-[14px] text-[#152436]">
                  {document.uploaded_by.name ?? "Usuario desconocido"}
                </dd>
              </div>

              <div>
                <dt className="font-semibold uppercase tracking-[0.16em] text-[#526173]">
                  Fecha
                </dt>

                <dd className="mt-1 text-[14px] text-[#152436]">
                  {formatDateTime(document.created_at)}
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex flex-wrap gap-4 border-t border-border pt-4">
              <Link
                href={`/documents/${document.id}`}
                className="inline-flex text-[14px] font-semibold text-[#427AC6] transition hover:text-[#356AAE]"
              >
                Abrir documento
              </Link>

              {canDeleteDocuments && (
                <button
                  type="button"
                  onClick={() => onRequestDelete(document)}
                  className="inline-flex text-[14px] font-semibold text-[#526173] transition hover:text-[#152436]"
                >
                  Eliminar
                </button>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}
