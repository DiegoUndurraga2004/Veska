"use client";

import type { PlatformSetupActivationChecklistItem } from "@/types/platform-setup";

type ActivationChecklistProps = {
  items: PlatformSetupActivationChecklistItem[];
};

const statusLabels: Record<
  PlatformSetupActivationChecklistItem["status"],
  string
> = {
  completed: "Completado",
  pending: "Pendiente",
  requires_review: "Requiere revisión",
};

export function ActivationChecklist({ items }: ActivationChecklistProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] p-4">
      <div>
        <h4 className="text-[15px] font-semibold text-[#152436]">
          Checklist de activación
        </h4>

        <p className="mt-1 text-[14px] leading-6 text-[#526173]">
          La simulación local prepara la misma secuencia conceptual que tendrá el backend futuro.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-[#E8EDF3] bg-white px-4 py-3"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#152436]">
                  {item.label}
                </p>

                {item.detail ? (
                  <p className="mt-1 text-sm leading-6 text-[#526173]">
                    {item.detail}
                  </p>
                ) : null}
              </div>

              <span
                className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                  item.status === "completed"
                    ? "border-[#C9DDF7] bg-[#EEF4FB] text-[#427AC6]"
                    : item.status === "requires_review"
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : "border-[#E8EDF3] bg-[#F7F9FC] text-[#7D8A99]"
                }`}
              >
                {statusLabels[item.status]}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
