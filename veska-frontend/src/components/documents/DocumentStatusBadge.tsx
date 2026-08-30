import type { DocumentStatus } from "@/types/documents";

type DocumentStatusBadgeProps = {
  status: DocumentStatus;
};

const statusConfig: Record<
  DocumentStatus,
  {
    label: string;
    className: string;
  }
> = {
  uploaded: {
    label: "Subido",
    className: "border-border bg-surface-muted text-muted-foreground",
  },
  processing: {
    label: "Procesando",
    className: "border-brand-soft bg-brand-soft text-brand",
  },
  ready: {
    label: "Listo",
    className: "border-border bg-surface text-foreground",
  },
  error: {
    label: "Error",
    className: "border-border bg-surface-muted text-foreground",
  },
  deleted: {
    label: "Eliminado",
    className: "border-border bg-surface-muted text-muted-foreground",
  },
};

export function DocumentStatusBadge({
  status,
}: DocumentStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
