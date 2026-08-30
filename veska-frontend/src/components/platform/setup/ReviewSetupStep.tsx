import type { PlatformSetupDraft } from "@/types/platform-setup";

type ReviewSetupStepProps = {
  draft: PlatformSetupDraft;
  isAwaitingConfirmation: boolean;
  onRequestConfirmation: () => void;
  onCancelConfirmation: () => void;
};

const planLabels: Record<PlatformSetupDraft["company"]["plan"], string> = {
  piloto: "Piloto",
  estandar: "Estándar",
  privado: "Privado",
};

const statusLabels: Record<PlatformSetupDraft["company"]["status"], string> = {
  active: "active",
  trial: "trial",
  inactive: "inactive",
};

const providerLabels: Record<PlatformSetupDraft["ai"]["provider"], string> = {
  openai: "OpenAI API",
  runpod: "Runpod privado",
};

const accessProviderLabels: Record<
  PlatformSetupDraft["initial_admin"]["access_provider"],
  string
> = {
  microsoft: "Microsoft",
  google: "Google",
  local: "local",
};

const privacyLabels: Record<PlatformSetupDraft["ai"]["privacy_tier"], string> = {
  standard: "Estándar",
  private: "Privado",
};

const roleLabels = {
  company_admin: "company_admin",
  company_user: "company_user",
  read_only: "read_only",
} as const;

const providerSummaryLabels = {
  microsoft: "Microsoft",
  google: "Google",
  local: "local",
} as const;

function formatMemberCount(count: number) {
  return `${count} integrante${count === 1 ? "" : "s"}`;
}

function buildGroupDescription(description: string | null) {
  return description?.trim().length ? description : "Sin descripción";
}

function getAccessLevelLabel(
  accessLevel: PlatformSetupDraft["space_permissions"][number]["access_level"],
) {
  switch (accessLevel) {
    case "read":
      return "Lectura";
    case "write":
      return "Lectura y carga";
    case "manage":
      return "Administración";
  }
}

function getSourceLabel(
  source: PlatformSetupDraft["space_permissions"][number]["source"],
) {
  return source === "direct" ? "Directo" : "Excepción";
}

export function ReviewSetupStep({
  draft,
  isAwaitingConfirmation,
  onRequestConfirmation,
  onCancelConfirmation,
}: ReviewSetupStepProps) {
  const activeSpaces = draft.suggested_spaces.filter((space) => space.enabled);
  const directPermissions = draft.space_permissions.filter(
    (permission) => permission.source === "direct",
  );
  const overridePermissions = draft.space_permissions.filter(
    (permission) => permission.source === "override",
  );

  const spacesById = new Map(
    draft.suggested_spaces.map((space) => [space.id, space]),
  );

  const groupsById = new Map(
    draft.initial_groups.map((group) => [group.id, group]),
  );

  const usersById = new Map(
    [
      {
        id: draft.initial_admin.id,
        name:
          draft.initial_admin.full_name.trim().length > 0
            ? draft.initial_admin.full_name.trim()
            : "Administrador inicial",
        email: draft.initial_admin.email,
      },
      ...draft.initial_users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
      })),
    ].map((user) => [user.id, user] as const),
  );

  function getRecipientName(permission: PlatformSetupDraft["space_permissions"][number]) {
    if (permission.target_type === "group") {
      return groupsById.get(permission.group_id ?? "")?.name ?? "Grupo eliminado";
    }

    if (!permission.user_id) {
      return "Usuario eliminado";
    }

    return usersById.get(permission.user_id)?.name ?? "Usuario eliminado";
  }

  function getRecipientDescription(permission: PlatformSetupDraft["space_permissions"][number]) {
    if (permission.target_type !== "user" || !permission.user_id) {
      return null;
    }

    return usersById.get(permission.user_id)?.email ?? null;
  }

  function getPermissionViewsForSpace(spaceId: string) {
    const currentSpace = spacesById.get(spaceId);

    if (!currentSpace) {
      return [];
    }

    const ancestorChain: typeof draft.suggested_spaces = [];
    let cursor: typeof currentSpace | null = currentSpace;

    while (cursor) {
      ancestorChain.unshift(cursor);
      cursor = cursor.parent_id ? spacesById.get(cursor.parent_id) ?? null : null;
    }

    const views: Array<{
      permission_id: string;
      recipient_type: "group" | "user";
      recipient_label: string;
      recipient_description: string | null;
      access_level_label: string;
      source: "direct" | "override" | "inherited";
      source_label: string;
      origin_space_name: string | null;
    }> = [];

    ancestorChain.forEach((ancestor) => {
      draft.space_permissions
        .filter((permission) => permission.space_id === ancestor.id)
        .sort((left, right) => {
          if (left.source !== right.source) {
            return left.source === "direct" ? -1 : 1;
          }

          const leftName = getRecipientName(left);
          const rightName = getRecipientName(right);
          return leftName.localeCompare(rightName, "es", {
            sensitivity: "base",
          });
        })
        .forEach((permission) => {
          const inherited = ancestor.id !== currentSpace.id;

          views.push({
            permission_id: permission.id,
            recipient_type: permission.target_type,
            recipient_label: getRecipientName(permission),
            recipient_description: getRecipientDescription(permission),
            access_level_label: getAccessLevelLabel(permission.access_level),
            source: inherited ? "inherited" : permission.source,
            source_label: inherited ? "Heredado" : getSourceLabel(permission.source),
            origin_space_name: inherited ? ancestor.name : null,
          });
        });
    });

    return views;
  }

  const activeSpaceSummaries = activeSpaces.map((space) => {
    const permissionViews = getPermissionViewsForSpace(space.id);

    return {
      space,
      permissionViews,
    };
  });

  const spacesWithoutCoverage = activeSpaceSummaries.filter(
    (summary) => summary.permissionViews.length === 0,
  );
  const totalGroupAssignments = draft.initial_groups.reduce(
    (total, group) => total + group.member_ids.length,
    0,
  );
  const documentsPreparedCount = draft.bulk_import.files.filter(
    (file) => file.status === "valid",
  ).length;
  const documentsWithErrorCount = draft.bulk_import.files.filter(
    (file) => file.status === "error",
  ).length;

  return (
    <section className="space-y-5 rounded-3xl border border-border bg-surface p-6 shadow-sm">
      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-border bg-surface-muted p-4">
          <h3 className="text-sm font-semibold text-foreground">Empresa</h3>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">Nombre</dt>
              <dd className="text-right font-semibold text-foreground">
                {draft.company.name}
              </dd>
            </div>

            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">Slug</dt>
              <dd className="text-right font-semibold text-foreground">
                {draft.company.slug}
              </dd>
            </div>

            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">Plan</dt>
              <dd className="text-right font-semibold text-foreground">
                {planLabels[draft.company.plan]}
              </dd>
            </div>

            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">Estado inicial</dt>
              <dd className="text-right font-semibold text-foreground">
                {statusLabels[draft.company.status]}
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-2xl border border-border bg-surface-muted p-4">
          <h3 className="text-sm font-semibold text-foreground">
            Configuración IA
          </h3>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">Proveedor</dt>
              <dd className="text-right font-semibold text-foreground">
                {providerLabels[draft.ai.provider]}
              </dd>
            </div>

            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">Privacy tier</dt>
              <dd className="text-right font-semibold text-foreground">
                {privacyLabels[draft.ai.privacy_tier]}
              </dd>
            </div>

            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">Modelo</dt>
              <dd className="text-right font-semibold text-foreground">
                {draft.ai.model_name}
              </dd>
            </div>

            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">Servicio habilitado</dt>
              <dd className="text-right font-semibold text-foreground">
                {draft.ai.enabled ? "Sí" : "No"}
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-2xl border border-border bg-surface-muted p-4">
          <h3 className="text-sm font-semibold text-foreground">
            Administrador inicial
          </h3>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">Nombre</dt>
              <dd className="text-right font-semibold text-foreground">
                {draft.initial_admin.full_name}
              </dd>
            </div>

            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="text-right font-semibold text-foreground">
                {draft.initial_admin.email}
              </dd>
            </div>

            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">Proveedor de acceso</dt>
              <dd className="text-right font-semibold text-foreground">
                {accessProviderLabels[draft.initial_admin.access_provider]}
              </dd>
            </div>

            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">Rol</dt>
              <dd className="text-right font-semibold text-foreground">
                {draft.initial_admin.role}
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-2xl border border-border bg-surface-muted p-4">
          <h3 className="text-sm font-semibold text-foreground">
            Usuarios adicionales
          </h3>

          <p className="mt-2 text-sm font-medium text-foreground">
            Usuarios adicionales: {draft.initial_users.length}
          </p>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Administrador inicial: {draft.initial_admin.email}. El resto de usuarios quedará listo para creación simulada local.
          </p>

          <div className="mt-4 rounded-2xl border border-border bg-surface px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-foreground">
                Usuarios adicionales preparados
              </p>
              <p className="text-sm font-semibold text-brand">
                {draft.initial_users.length}
              </p>
            </div>

            <div className="mt-4 max-h-64 space-y-2 overflow-auto pr-1">
              {draft.initial_users.length === 0 ? (
                <p className="rounded-xl border border-border bg-surface-muted px-4 py-4 text-sm text-muted-foreground">
                  No hay usuarios adicionales preparados.
                </p>
              ) : (
                draft.initial_users.map((user) => (
                  <div
                    key={user.id}
                    className="rounded-xl border border-border bg-surface-muted px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {user.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>

                      <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {user.source}
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {roleLabels[user.role]} · {providerSummaryLabels[user.auth_provider]}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-surface-muted p-4 lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Grupos iniciales
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Grupos iniciales: {draft.initial_groups.length} · Asignaciones de integrantes: {totalGroupAssignments}
              </p>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Resumen compacto
            </p>
          </div>

          <div className="mt-4 max-h-72 space-y-3 overflow-auto pr-1">
            {draft.initial_groups.length === 0 ? (
              <p className="rounded-xl border border-border bg-surface px-4 py-4 text-sm text-muted-foreground">
                No se prepararon grupos iniciales. Podrás configurarlos después.
              </p>
            ) : (
              draft.initial_groups.map((group) => (
                <div
                  key={group.id}
                  className="rounded-xl border border-border bg-surface px-4 py-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {group.name}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {buildGroupDescription(group.description)}
                      </p>
                    </div>

                    <span className="rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {formatMemberCount(group.member_ids.length)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-surface-muted p-4">
          <h3 className="text-sm font-semibold text-foreground">
            Cobertura inicial
          </h3>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">Espacios activos</dt>
              <dd className="text-right font-semibold text-foreground">
                {activeSpaces.length}
              </dd>
            </div>

            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">Permisos directos</dt>
              <dd className="text-right font-semibold text-foreground">
                {directPermissions.length}
              </dd>
            </div>

            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">
                Excepciones
              </dt>
              <dd className="text-right font-semibold text-foreground">
                {overridePermissions.length}
              </dd>
            </div>

            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">
                Espacios sin cobertura
              </dt>
              <dd className="text-right font-semibold text-foreground">
                {spacesWithoutCoverage.length}
              </dd>
            </div>
          </dl>

          <p className="mt-4 rounded-2xl border border-border bg-surface px-4 py-3 text-xs leading-5 text-muted-foreground">
            Documentos preparados: {documentsPreparedCount} · Documentos con error: {documentsWithErrorCount}
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-surface-muted p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground">
            Resumen por espacio
          </h3>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Revisión compacta de cada espacio activo, con sus permisos efectivos y advertencias de cobertura.
          </p>

          <div className="mt-4 max-h-[32rem] space-y-3 overflow-auto pr-1">
            {activeSpaceSummaries.length === 0 ? (
              <p className="rounded-xl border border-border bg-surface px-4 py-4 text-sm text-muted-foreground">
                No hay espacios activos para revisar.
              </p>
            ) : (
              activeSpaceSummaries.map(({ space, permissionViews }) => (
                <details
                  key={space.id}
                  className="rounded-2xl border border-border bg-surface px-4 py-4"
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {space.path}
                      </p>

                      <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                        {space.parent_id ? "Subespacio" : "Espacio principal"} ·{" "}
                        {space.files_count} archivo
                        {space.files_count === 1 ? "" : "s"} asociado
                        {space.files_count === 1 ? "" : "s"}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                          permissionViews.length === 0
                            ? "border-amber-200 bg-amber-50 text-amber-800"
                            : "border-[#C9DDF7] bg-[#EEF4FB] text-[#427AC6]"
                        }`}
                      >
                        {permissionViews.length === 0
                          ? "Sin cobertura"
                          : `${permissionViews.length} permiso${permissionViews.length === 1 ? "" : "s"}`}
                      </span>

                      <span className="rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {space.parent_id ? "Hereda" : "Raíz"}
                      </span>
                    </div>
                  </summary>

                  <div className="mt-4 border-t border-border pt-4">
                    {permissionViews.length === 0 ? (
                      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                        No existe cobertura efectiva para este espacio.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {permissionViews.map((permission) => (
                          <div
                            key={permission.permission_id}
                            className="rounded-xl border border-border bg-surface-muted px-4 py-3"
                          >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground">
                                  {permission.recipient_type === "group"
                                    ? "Grupo"
                                    : "Usuario"}{" "}
                                  · {permission.recipient_label}
                                </p>

                                {permission.recipient_description ? (
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {permission.recipient_description}
                                  </p>
                                ) : null}

                                {permission.source === "inherited" ? (
                                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                    Este permiso se administra desde el espacio
                                    padre. Origen:{" "}
                                    <span className="font-semibold text-foreground">
                                      {permission.origin_space_name}
                                    </span>
                                  </p>
                                ) : (
                                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                    Aplicado localmente en este espacio.
                                  </p>
                                )}
                              </div>

                              <div className="flex shrink-0 flex-wrap items-center gap-2">
                                <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  {permission.access_level_label}
                                </span>

                                <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  {permission.source_label}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </details>
              ))
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] p-4">
          <h3 className="text-sm font-semibold text-[#152436]">
            Confirmar configuración e iniciar procesamiento
          </h3>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Antes de avanzar al último paso, confirma explícitamente esta operación local. La simulación representará el procesamiento futuro en backend.
          </p>

          {!isAwaitingConfirmation ? (
            <button
              type="button"
              onClick={onRequestConfirmation}
              className="mt-4 rounded-xl bg-[#427AC6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#356AAE]"
            >
              Confirmar configuración e iniciar procesamiento
            </button>
          ) : (
            <div className="mt-4 rounded-2xl border border-border bg-surface px-4 py-4">
              <p className="text-sm font-medium text-foreground">
                Confirma que deseas avanzar al paso de procesamiento y activación simulada.
              </p>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                No se persistirá ningún tenant real ni se llamará al backend.
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onCancelConfirmation}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={onRequestConfirmation}
                  className="rounded-xl bg-[#427AC6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#356AAE]"
                >
                  Confirmar e ir a procesamiento
                </button>
              </div>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
