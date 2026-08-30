import type { UploadQueueStatus } from "@/types/uploads";

type UploadQueueStatusBadgeProps = {
  status: UploadQueueStatus;
};

const statusConfig: Record<
  UploadQueueStatus,
  {
    label: string;
    className: string;
  }
> = {
  queued: {
    label: "En cola",
    className: "border-border bg-surface-muted text-muted-foreground",
  },
  rejected: {
    label: "Rechazado",
    className: "border-border bg-surface-muted text-foreground",
  },
  uploading: {
    label: "Subiendo",
    className: "border-brand-soft bg-brand-soft text-brand",
  },
  uploaded: {
    label: "Subido",
    className: "border-brand-soft bg-brand-soft text-brand",
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
};

export function UploadQueueStatusBadge({
  status,
}: UploadQueueStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
