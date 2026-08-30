import Link from "next/link";

import type { UserRole } from "@/types/auth";

type QuickActionsProps = {
  role: UserRole;
};

type QuickAction = {
  label: string;
  description: string;
  href: string;
  variant: "primary" | "secondary";
  allowedRoles?: UserRole[];
};

const quickActions: QuickAction[] = [
  {
    label: "Nuevo chat",
    description: "Haz una pregunta sobre los documentos de tu empresa.",
    href: "/chats",
    variant: "primary",
  },
  {
    label: "Subir documentos",
    description: "Agrega archivos PDF, DOCX, TXT, XLSX o CSV al workspace.",
    href: "/upload",
    variant: "secondary",
    allowedRoles: ["platform_admin", "company_admin", "company_user"],
  },
  {
    label: "Ver biblioteca",
    description: "Revisa los documentos disponibles y su estado.",
    href: "/documents",
    variant: "secondary",
  },
];

function canViewAction(action: QuickAction, role: UserRole) {
  return !action.allowedRoles || action.allowedRoles.includes(role);
}

function getActionClassName(variant: QuickAction["variant"]) {
  if (variant === "primary") {
    return "border-brand bg-brand text-white hover:bg-brand-hover";
  }

  return "border-border bg-surface text-foreground hover:bg-surface-muted";
}

export function QuickActions({ role }: QuickActionsProps) {
  const visibleActions = quickActions.filter((action) =>
    canViewAction(action, role),
  );

  return (
    <section>
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Acciones rápidas
        </h2>

        <p className="mt-1 text-sm leading-5 text-muted-foreground">
          Empieza una consulta o administra los documentos de tu empresa.
        </p>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {visibleActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`rounded-2xl border px-5 py-5 transition ${getActionClassName(
              action.variant,
            )}`}
          >
            <p className="text-sm font-semibold">{action.label}</p>

            <p
              className={`mt-2 text-sm leading-5 ${
                action.variant === "primary"
                  ? "text-white/80"
                  : "text-muted-foreground"
              }`}
            >
              {action.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
