"use client";

import type {
  PlatformSetupBulkImportFile,
  PlatformSetupSuggestedSpace,
} from "@/types/platform-setup";

type SuggestedSpacesValidation = {
  by_id: Record<string, { name: string | null; path: string | null }>;
  has_errors: boolean;
  enabled_count: number;
  files_without_enabled_space: number;
};

type SuggestedSpacesSetupStepProps = {
  spaces: PlatformSetupSuggestedSpace[];
  validFiles: PlatformSetupBulkImportFile[];
  validation: SuggestedSpacesValidation;
  onToggleEnabled: (spaceId: string) => void;
  onRenameSpace: (spaceId: string, value: string) => void;
  onUpdatePath: (spaceId: string, value: string) => void;
  onRestoreAutomaticProposals: () => void;
};

function getDepth(path: string) {
  return path.split("/").filter((segment) => segment.length > 0).length - 1;
}

function getSpaceTypeLabel(path: string) {
  return path.includes("/") ? "Subespacio" : "Espacio principal";
}

export function SuggestedSpacesSetupStep({
  spaces,
  validFiles,
  validation,
  onToggleEnabled,
  onRenameSpace,
  onUpdatePath,
  onRestoreAutomaticProposals,
}: SuggestedSpacesSetupStepProps) {
  const topLevelSpaces = spaces.filter((space) => !space.parent_id);
  const enabledSpaces = spaces.filter((space) => space.enabled);

  return (
    <section className="space-y-6 rounded-3xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-2">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Espacios sugeridos
          </h3>

          <p className="text-sm leading-6 text-muted-foreground">
            A partir de los archivos válidos se detectan carpetas principales, rutas anidadas y subespacios. Puedes activar o desactivar propuestas, renombrarlas, editar su ruta visible y restaurar las propuestas automáticas en cualquier momento.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRestoreAutomaticProposals}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
          >
            Restaurar propuestas automáticas
          </button>
        </div>
      </div>

      {validation.has_errors && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
          Hay propuestas que necesitan revisión: corrige nombres vacíos, rutas duplicadas o jerarquías inconsistentes antes de continuar.
        </p>
      )}

      {validation.files_without_enabled_space > 0 && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          {validation.files_without_enabled_space} archivo{validation.files_without_enabled_space === 1 ? "" : "s"} válido{validation.files_without_enabled_space === 1 ? "" : "s"} queda{validation.files_without_enabled_space === 1 ? "" : "n"} sin un espacio activo asignable.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Propuestas
          </p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {spaces.length}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Activos
          </p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {validation.enabled_count}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Archivos válidos
          </p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {validFiles.length}
          </p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <article className="space-y-4 rounded-2xl border border-border bg-surface-muted p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                Jerarquía propuesta
              </h4>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Las rutas preservan la relación padre-hijo y muestran cuántos archivos quedan asociados a cada nodo.
              </p>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {enabledSpaces.length} activo{enabledSpaces.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="max-h-[34rem] space-y-3 overflow-auto pr-1">
            {spaces.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-surface px-4 py-6 text-sm leading-6 text-muted-foreground">
                Aún no hay espacios sugeridos porque no existen archivos válidos. Regresa al paso de importación para cargar documentos o usa la estructura demostrativa.
              </div>
            ) : (
              spaces.map((space) => {
                const fieldErrors = validation.by_id[space.id];
                const depth = getDepth(space.path);

                return (
                  <section
                    key={space.id}
                    className="rounded-2xl border border-border bg-surface px-4 py-4"
                    style={{ marginLeft: `${Math.min(depth, 4) * 16}px` }}
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <label className="flex min-w-0 flex-1 items-start gap-3">
                          <input
                            type="checkbox"
                            checked={space.enabled}
                            onChange={() => onToggleEnabled(space.id)}
                            className="mt-1 h-4 w-4 rounded border-border text-brand focus:ring-brand"
                          />

                          <span className="min-w-0">
                            <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              {getSpaceTypeLabel(space.path)}
                            </span>

                            <span className="mt-1 block text-sm font-semibold text-foreground">
                              {space.path}
                            </span>

                            <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                              {space.parent_id ? "Subespacio dependiente" : "Espacio raíz propuesto"} · {space.files_count} archivo{space.files_count === 1 ? "" : "s"} asociado{space.files_count === 1 ? "" : "s"}
                            </span>
                          </span>
                        </label>

                        <span className="rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {space.enabled ? "Activo" : "Inactivo"}
                        </span>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Nombre
                          </span>

                          <input
                            type="text"
                            value={space.name}
                            onChange={(event) =>
                              onRenameSpace(space.id, event.target.value)
                            }
                            className="w-full rounded-xl border border-border bg-surface-muted px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-brand"
                          />

                          {fieldErrors?.name && (
                            <p role="alert" className="text-sm text-red-700">
                              {fieldErrors.name}
                            </p>
                          )}
                        </label>

                        <label className="space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Ruta visible
                          </span>

                          <input
                            type="text"
                            value={space.path}
                            onChange={(event) =>
                              onUpdatePath(space.id, event.target.value)
                            }
                            className="w-full rounded-xl border border-border bg-surface-muted px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-brand"
                          />

                          {fieldErrors?.path && (
                            <p role="alert" className="text-sm text-red-700">
                              {fieldErrors.path}
                            </p>
                          )}
                        </label>
                      </div>
                    </div>
                  </section>
                );
              })
            )}
          </div>
        </article>

        <article className="space-y-4 rounded-2xl border border-border bg-surface-muted p-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">
              Resumen jerárquico
            </h4>

            <p className="text-sm leading-6 text-muted-foreground">
              Vista compacta para la revisión humana antes del paso final.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Espacios principales
            </p>

            <div className="mt-3 space-y-2">
              {topLevelSpaces.length === 0 ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  Aún no hay espacios principales.
                </p>
              ) : (
                topLevelSpaces.map((space) => (
                  <div key={space.id} className="text-sm text-foreground">
                    {space.path} · {space.files_count} archivo{space.files_count === 1 ? "" : "s"}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Subespacios
            </p>

            <div className="mt-3 space-y-2">
              {spaces.some((space) => space.parent_id) ? (
                spaces
                  .filter((space) => space.parent_id)
                  .map((space) => (
                    <div key={space.id} className="text-sm text-foreground">
                      {space.path} · {space.files_count} archivo{space.files_count === 1 ? "" : "s"}
                    </div>
                  ))
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">
                  No hay subespacios detectados.
                </p>
              )}
            </div>
          </div>

          <p className="rounded-2xl border border-border bg-surface px-4 py-3 text-xs leading-5 text-muted-foreground">
            Los espacios organizan la documentación y serán la unidad principal de autorización documental en etapas futuras. Todavía no configuramos permisos.
          </p>
        </article>
      </div>
    </section>
  );
}
