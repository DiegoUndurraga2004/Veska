import type { UserRole, WorkspaceSession } from "@/types/auth";

type DashboardHeaderProps = {
  session: WorkspaceSession;
};

function getFirstName(name: string) {
  return name.trim().split(" ")[0] || "usuario";
}

function getRoleLabel(role: UserRole) {
  const labels: Record<UserRole, string> = {
    platform_admin: "Administrador de Veska",
    company_admin: "Administrador de empresa",
    company_user: "Usuario de empresa",
    read_only: "Solo lectura",
  };

  return labels[role];
}

export function DashboardHeader({
  session,
}: DashboardHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-surface px-6 py-7 shadow-sm sm:px-8 sm:py-9">
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-brand-soft blur-3xl" />

      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="inline-flex rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Workspace privado
          </p>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Hola, {getFirstName(session.user.name)}
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Retoma tus conversaciones, revisa documentos recientes y consulta
            el conocimiento interno de tu empresa desde un solo lugar.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[390px]">
          <article className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Empresa activa
            </p>

            <p className="mt-2 truncate text-sm font-semibold text-foreground">
              {session.tenant.name}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {session.tenant.plan}
            </p>
          </article>

          <article className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Nivel de acceso
            </p>

            <p className="mt-2 text-sm font-semibold text-foreground">
              {getRoleLabel(session.user.role)}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Sesión simulada de development
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
