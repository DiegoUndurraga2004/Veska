"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { DocumentStatusBadge } from "@/components/documents/DocumentStatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDateTime, formatFileSize } from "@/lib/formatters";
import type { DocumentListItem } from "@/types/documents";

type DocumentTableProps = {
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

export function DocumentTable({
  documents,
  canDeleteDocuments,
  onRequestDelete,
  emptyState,
}: DocumentTableProps) {
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
    <section className="overflow-hidden border-y border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-surface-muted/60">
              <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#526173]">
                Documento
              </th>

              <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#526173]">
                Estado
              </th>

              <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#526173]">
                Subido por
              </th>

              <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#526173]">
                Fecha
              </th>

              <th className="px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-[#526173]">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {documents.map((document) => {
              const processingMessage = getProcessingMessage(document);

              return (
                <tr
                  key={document.id}
                  className="transition hover:bg-[#F7F9FC]"
                >
                  <td className="px-5 py-4">
                    <div className="max-w-md">
                      <p className="truncate text-[14px] font-semibold text-[#152436]">
                        {document.file_name}
                      </p>

                      <p
                        className="mt-1 truncate text-[12px] text-[#526173]"
                        title={document.relative_path}
                      >
                        Ruta relativa: {document.relative_path}
                      </p>

                      <p className="mt-1 text-[12px] text-[#526173]">
                        {document.file_type.toUpperCase()} ·{" "}
                        {formatFileSize(document.file_size)}
                        {document.page_count !== null
                          ? ` · ${document.page_count} páginas`
                          : ""}
                      </p>

                      {processingMessage && (
                        <p className="mt-1 text-[12px] leading-5 text-[#526173]">
                          {processingMessage}
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <DocumentStatusBadge status={document.status} />
                  </td>

                  <td className="px-5 py-4 text-[14px] text-[#526173]">
                    {document.uploaded_by.name ?? "Usuario desconocido"}
                  </td>

                  <td className="px-5 py-4 text-[14px] text-[#526173]">
                    {formatDateTime(document.created_at)}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/documents/${document.id}`}
                        className="text-[14px] font-semibold text-[#427AC6] transition hover:text-[#356AAE]"
                      >
                        Abrir
                      </Link>

                      {canDeleteDocuments && (
                        <button
                          type="button"
                          onClick={() => onRequestDelete(document)}
                          className="text-[14px] font-semibold text-[#526173] transition hover:text-[#152436]"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
