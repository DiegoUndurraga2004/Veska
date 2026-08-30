import Link from "next/link";

import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { DocumentStatusBadge } from "@/components/documents/DocumentStatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDateTime, formatFileSize } from "@/lib/formatters";
import type { DocumentListItem } from "@/types/documents";

type RecentDocumentsProps = {
  documents: DocumentListItem[];
};

export function RecentDocuments({
  documents,
}: RecentDocumentsProps) {
  return (
    <DashboardSection
      title="Documentos recientes"
      description="Últimos archivos agregados al workspace de tu empresa."
      action={
        <Link
          href="/documents"
          className="text-sm font-semibold text-brand transition hover:text-brand-hover"
        >
          Ver biblioteca
        </Link>
      }
    >
      {documents.length === 0 ? (
        <EmptyState
          title="Todavía no hay documentos"
          description="Sube el primer archivo para comenzar a construir la base documental de tu empresa."
          action={
            <Link
              href="/upload"
              className="inline-flex rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
            >
              Subir documento
            </Link>
          }
        />
      ) : (
        <div className="divide-y divide-border">
          {documents.map((document) => (
            <Link
              key={document.id}
              href={`/documents/${document.id}`}
              className="block px-5 py-4 transition hover:bg-surface-muted"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {document.file_name}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {document.file_type.toUpperCase()} ·{" "}
                    {formatFileSize(document.file_size)} ·{" "}
                    {document.uploaded_by.name ?? "Usuario desconocido"}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateTime(document.created_at)}
                  </p>
                </div>

                <DocumentStatusBadge status={document.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}
