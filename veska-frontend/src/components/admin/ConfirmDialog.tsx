"use client";

import type { ReactNode } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  tone?: "primary" | "danger";
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  tone = "primary",
  cancelLabel = "Cancelar",
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="admin-confirm-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-5 py-8"
    >
      <button
        type="button"
        aria-label="Cerrar confirmación"
        onClick={onCancel}
        className="absolute inset-0 bg-black/35"
      />

      <section className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
        <h2 id="admin-confirm-title" className="text-lg font-semibold text-foreground">
          {title}
        </h2>

        <div className="mt-3 text-sm leading-6 text-muted-foreground">
          {description}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-85 ${
              tone === "danger" ? "bg-red-600" : "bg-foreground"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
