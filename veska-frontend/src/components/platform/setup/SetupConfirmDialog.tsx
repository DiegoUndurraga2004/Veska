"use client";

import type { ReactNode } from "react";

type SetupConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  tone?: "primary" | "danger";
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function SetupConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  tone = "primary",
  cancelLabel = "Cancelar",
  onCancel,
  onConfirm,
}: SetupConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="setup-confirm-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-5 py-8"
    >
      <button
        type="button"
        aria-label="Cerrar confirmación"
        onClick={onCancel}
        className="absolute inset-0 bg-black/35"
      />

      <section className="relative w-full max-w-md rounded-[16px] border border-[#E8EDF3] bg-white p-6 shadow-[0_12px_30px_rgba(21,36,54,0.08)]">
        <h2 id="setup-confirm-title" className="text-[20px] font-semibold tracking-tight text-[#152436]">
          {title}
        </h2>

        <div className="mt-3 text-[14px] leading-6 text-[#526173]">
          {description}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[#D9E1EA] px-4 py-2.5 text-sm font-semibold text-[#152436] transition hover:bg-[#F7F9FC]"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 ${
              tone === "danger" ? "bg-red-600" : "bg-[#427AC6]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
