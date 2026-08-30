import Link from "next/link";

import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { mockAccessibleSpaces } from "@/mocks/spaces.mock";

export function AccessibleSpaces() {
  const topLevelSpaces = mockAccessibleSpaces
    .filter((space) => space.parent_space_id === null)
    .slice(0, 4);

  return (
    <DashboardSection
      title="Espacios disponibles"
      description="Accede rápido a los espacios visibles en esta sesión simulada."
      action={
        <Link
          href="/documents"
          className="text-sm font-semibold text-brand transition hover:text-brand-hover"
        >
          Ver todos en biblioteca
        </Link>
      }
    >
      <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
        {topLevelSpaces.map((space) => {
          return (
            <Link
              key={space.id}
              href={`/documents?space=${space.id}`}
              className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-4 transition hover:border-brand-soft hover:bg-surface-muted"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {space.name}
                  </p>

                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {space.path}
                  </p>
                </div>

                <span className="shrink-0 rounded-full border border-border bg-surface px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Espacio
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 text-xs">
                <span className="text-muted-foreground">
                  Espacio principal
                </span>

                <span className="font-semibold text-brand transition group-hover:text-brand-hover">
                  Abrir
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </DashboardSection>
  );
}
