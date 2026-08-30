import type { PlatformMetric } from "@/types/platform";

type PlatformMetricsProps = {
  metrics: PlatformMetric[];
};

export function PlatformMetrics({
  metrics,
}: PlatformMetricsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => (
        <article
          key={metric.label}
          className="rounded-2xl border border-border bg-surface px-5 py-5 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {metric.label}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            {metric.value}
          </p>

          <p className="mt-2 text-sm leading-5 text-muted-foreground">
            {metric.description}
          </p>
        </article>
      ))}
    </section>
  );
}
