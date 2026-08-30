import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import type { WorkspaceSession } from "@/types/auth";

type AppShellProps = {
  children: ReactNode;
  session: WorkspaceSession;
};

export function AppShell({ children, session }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground lg:flex lg:items-start">
      <AppSidebar session={session} />

      <div className="min-w-0 flex-1">
        <AppHeader session={session} />

        <main className="px-5 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
