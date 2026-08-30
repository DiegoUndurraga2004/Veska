import Link from "next/link";

import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { DocumentStatusBadge } from "@/components/documents/DocumentStatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDateTime } from "@/lib/formatters";
import type { DocumentListItem } from "@/types/documents";

type ProcessingDocumentsProps = {
  documents: DocumentListItem[];
};

export function ProcessingDocuments({
  documents,
}: ProcessingDocumentsProps) {
  return (
    <DashboardSection
      title="Procesamiento documental"
      description="Archivos que todavía no están disponibles como fuente."
      action={
        <Link
          href="/documents"
          className="text-sm font-semibold text-brand transition hover:text-brand-hover"
        >
          Revisar estados
        </Link>
      }
    >
      {documents.length === 0 ? (
        <EmptyState
          title="No hay documentos pendientes"
          description="Todos los archivos subidos terminaron de procesarse correctamente."
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
                    Actualizado {formatDateTime(document.updated_at)}
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
