import Link from "next/link";

import type {
  DashboardAlert,
  DashboardAlertType,
} from "@/types/dashboard";

type DashboardAlertsProps = {
  alerts: DashboardAlert[];
};

function getAlertClassName(type: DashboardAlertType) {
  const styles: Record<DashboardAlertType, string> = {
    info: "border-brand-soft bg-brand-soft",
    warning: "border-border bg-surface-muted",
    error: "border-border bg-surface-muted",
  };

  return styles[type];
}

export function DashboardAlerts({
  alerts,
}: DashboardAlertsProps) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      {alerts.map((alert) => (
        <article
          key={alert.id}
          className={`rounded-2xl border px-5 py-4 ${getAlertClassName(
            alert.type,
          )}`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {alert.title}
              </p>

              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                {alert.description}
              </p>
            </div>

            {alert.href && (
              <Link
                href={alert.href}
                className="shrink-0 text-sm font-semibold text-brand transition hover:text-brand-hover"
              >
                Revisar
              </Link>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
