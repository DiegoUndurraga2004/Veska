import Link from "next/link";

import { CompanyAdminPanel } from "@/components/admin/CompanyAdminPanel";
import { EmptyState } from "@/components/shared/EmptyState";
import { mockWorkspaceSession } from "@/mocks/session.mock";

export default function AdminPage() {
  const session = mockWorkspaceSession;
  const isAllowedRole =
    session.user.role === "platform_admin" ||
    session.user.role === "company_admin";

  if (!isAllowedRole) {
    return (
      <main className="space-y-6">
        <EmptyState
          title="Acceso no autorizado"
          description="Esta vista está disponible para company_admin y, como prueba interna, para platform_admin. Si necesitas probarla, usa una sesión mock autorizada."
          action={
            <Link
              href="/dashboard"
              className="inline-flex rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
            >
              Volver al dashboard
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <CompanyAdminPanel session={session} />
    </main>
  );
}
