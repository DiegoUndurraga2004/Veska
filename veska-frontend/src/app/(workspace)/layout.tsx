import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { mockWorkspaceSession } from "@/mocks/session.mock";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <AppShell session={mockWorkspaceSession}>{children}</AppShell>;
}
