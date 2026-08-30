"use client";

import type { PlatformSetupSuggestedSpace } from "@/types/platform-setup";

type SetupSpaceTreeProps = {
  spaces: PlatformSetupSuggestedSpace[];
  selectedSpaceId: string | null;
  onSelectSpace: (spaceId: string) => void;
};

function getSpaceDepth(space: PlatformSetupSuggestedSpace) {
  return space.path.split("/").filter((segment) => segment.length > 0).length - 1;
}

function getSpaceKindLabel(space: PlatformSetupSuggestedSpace) {
  return space.parent_id ? "Subespacio" : "Espacio raíz";
}

export function SetupSpaceTree({
  spaces,
  selectedSpaceId,
  onSelectSpace,
}: SetupSpaceTreeProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-surface-muted p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            Espacios activos
          </h4>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Solo los espacios sugeridos activos quedan disponibles para
            configurar permisos iniciales.
          </p>
        </div>

        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {spaces.length} espacio{spaces.length === 1 ? "" : "s"}
        </p>
      </div>

      {spaces.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-surface px-4 py-5 text-sm leading-6 text-muted-foreground">
          No existen espacios activos. Activa al menos una propuesta en el paso
          anterior para poder asignar permisos.
        </p>
      ) : (
        <div className="space-y-2">
          {spaces.map((space) => {
            const isSelected = space.id === selectedSpaceId;
            const depth = getSpaceDepth(space);

            return (
              <button
                key={space.id}
                type="button"
                onClick={() => onSelectSpace(space.id)}
                className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                  isSelected
                    ? "border-brand bg-brand-soft/40"
                    : "border-border bg-surface hover:bg-surface"
                }`}
                style={{ marginLeft: `${Math.min(depth, 4) * 14}px` }}
              >
                <span
                  className={`mt-0.5 inline-flex h-4 w-4 shrink-0 rounded-full border ${
                    isSelected
                      ? "border-brand bg-brand"
                      : "border-border bg-surface-muted"
                  }`}
                />

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {space.name}
                    </span>

                    <span className="rounded-full border border-border bg-surface-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {getSpaceKindLabel(space)}
                    </span>
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    {space.path}
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    {space.files_count} archivo
                    {space.files_count === 1 ? "" : "s"} asociado
                    {space.files_count === 1 ? "" : "s"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
