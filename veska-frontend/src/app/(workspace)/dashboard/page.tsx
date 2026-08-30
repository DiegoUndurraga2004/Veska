import { CompactDashboard } from "@/components/dashboard/CompactDashboard";
import { mockDashboardData } from "@/mocks/dashboard.mock";
import { mockWorkspaceSession } from "@/mocks/session.mock";

export default function DashboardPage() {
  return <CompactDashboard session={mockWorkspaceSession} data={mockDashboardData} />;
}
