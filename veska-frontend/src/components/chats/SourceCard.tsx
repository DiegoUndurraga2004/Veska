import Link from "next/link";

import type { MessageSource } from "@/types/messages";

type SourceCardProps = {
  source: MessageSource;
};

function getDocumentTypeLabel(documentName: string) {
  const extension = documentName
    .split(".")
    .pop()
    ?.toLocaleUpperCase("es-CL");

  return extension ?? "DOCUMENTO";
}

function getSourceLocation(source: MessageSource) {
  if (source.page_number !== null) {
    return `Página ${source.page_number}`;
  }

  if (source.sheet_name && source.cell_range) {
    return `Hoja: ${source.sheet_name} · ${source.cell_range}`;
  }

  if (source.sheet_name) {
    return `Hoja: ${source.sheet_name}`;
  }

  if (source.cell_range) {
    return source.cell_range;
  }

  return "Ubicación no disponible";
}

export function SourceCard({
  source,
}: SourceCardProps) {
  return (
    <details className="group overflow-hidden rounded-xl border border-border bg-surface">
      <summary className="cursor-pointer list-none px-4 py-3 [&::-webkit-details-marker]:hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                {getDocumentTypeLabel(source.document_name)}
              </span>

              <p className="break-words text-sm font-semibold text-foreground">
                {source.document_name}
              </p>
            </div>

            <p className="mt-2 text-xs font-medium text-muted-foreground">
              Espacio: {source.space_path}
            </p>

            <p className="mt-2 text-xs font-medium text-muted-foreground">
              {getSourceLocation(source)}
            </p>
          </div>

          <span className="shrink-0 text-xs font-semibold text-brand transition group-open:text-brand-hover">
            Mostrar fragmento
          </span>
        </div>
      </summary>

      <div className="border-t border-border bg-surface-muted px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Fragmento citado
        </p>

        <blockquote className="mt-3 border-l-2 border-brand pl-3 text-sm leading-6 text-foreground">
          {source.snippet}
        </blockquote>

        <div className="mt-4 flex justify-end">
          <Link
            href={`/documents/${source.document_id}`}
            className="inline-flex rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-background"
          >
            Abrir documento
          </Link>
        </div>
      </div>
    </details>
  );
}
