"use client";

type SetupSpacePermissionListItem = {
  permission_id: string;
  recipient_type: "group" | "user";
  recipient_label: string;
  recipient_description: string | null;
  access_level_label: string;
  source: "direct" | "override" | "inherited";
  source_label: string;
  origin_space_name: string | null;
  can_remove: boolean;
};

type SetupSpacePermissionListProps = {
  items: SetupSpacePermissionListItem[];
  onRequestRemove: (permissionId: string) => void;
};

const sourceToneClasses: Record<SetupSpacePermissionListItem["source"], string> =
  {
    direct: "border-slate-200 bg-slate-50 text-slate-700",
    override: "border-brand-soft bg-brand-soft text-brand",
    inherited: "border-amber-200 bg-amber-50 text-amber-800",
  };

function recipientTypeLabel(recipientType: SetupSpacePermissionListItem["recipient_type"]) {
  return recipientType === "group" ? "Grupo" : "Usuario";
}

export function SetupSpacePermissionList({
  items,
  onRequestRemove,
}: SetupSpacePermissionListProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-surface-muted p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            Permisos efectivos
          </h4>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Los permisos heredados se derivan desde espacios ancestros y no se
            eliminan desde el hijo.
          </p>
        </div>

        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {items.length} permiso{items.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="max-h-[24rem] space-y-3 overflow-auto pr-1">
        {items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-surface px-4 py-5 text-sm leading-6 text-muted-foreground">
            No hay permisos efectivos en este espacio todavía.
          </p>
        ) : (
          items.map((item) => (
            <article
              key={item.permission_id}
              className={`rounded-2xl border px-4 py-4 ${sourceToneClasses[item.source]}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-border bg-white/80 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {recipientTypeLabel(item.recipient_type)}
                    </span>

                    <span className="rounded-full border border-border bg-white/80 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {item.access_level_label}
                    </span>

                    <span className="rounded-full border border-border bg-white/80 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {item.source_label}
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-foreground">
                    {item.recipient_label}
                  </p>

                  {item.recipient_description ? (
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {item.recipient_description}
                    </p>
                  ) : null}

                  {item.origin_space_name ? (
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      Espacio de origen:{" "}
                      <span className="font-semibold text-foreground">
                        {item.origin_space_name}
                      </span>
                    </p>
                  ) : null}

                  {item.source === "inherited" ? (
                    <p className="mt-2 rounded-xl border border-amber-200 bg-white/70 px-3 py-2 text-sm leading-6 text-amber-900">
                      Este permiso se administra desde el espacio padre.
                    </p>
                  ) : (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Aplicado localmente en este espacio.
                    </p>
                  )}
                </div>

                {item.can_remove ? (
                  <button
                    type="button"
                    onClick={() => onRequestRemove(item.permission_id)}
                    className="rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
                  >
                    Eliminar
                  </button>
                ) : (
                  <span className="rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold text-muted-foreground">
                    No editable
                  </span>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export type { SetupSpacePermissionListItem };
