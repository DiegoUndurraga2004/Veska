import type { ReactNode } from "react";

type DashboardSectionProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function DashboardSection({
  title,
  description,
  action,
  children,
}: DashboardSectionProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex flex-col gap-3 border-b border-border bg-surface-muted px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {action}
      </div>

      <div>{children}</div>
    </section>
  );
}
