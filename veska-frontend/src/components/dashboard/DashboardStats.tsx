import { formatNumber } from "@/lib/formatters";
import type { DashboardSummary } from "@/types/dashboard";

type DashboardStatsProps = {
  summary: DashboardSummary;
};

type DashboardStat = {
  label: string;
  value: number;
  description: string;
};

export function DashboardStats({
  summary,
}: DashboardStatsProps) {
  const stats: DashboardStat[] = [
    {
      label: "Documentos",
      value: summary.documents_count,
      description: "Archivos disponibles en el workspace",
    },
    {
      label: "Chats",
      value: summary.chats_count,
      description: "Conversaciones guardadas",
    },
    {
      label: "Procesando",
      value: summary.processing_documents_count,
      description: "Documentos aún no disponibles",
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <article
          key={stat.label}
          className="rounded-2xl border border-border bg-surface px-5 py-5"
        >
          <p className="text-sm font-medium text-muted-foreground">
            {stat.label}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            {formatNumber(stat.value)}
          </p>

          <p className="mt-2 text-sm leading-5 text-muted-foreground">
            {stat.description}
          </p>
        </article>
      ))}
    </section>
  );
}
