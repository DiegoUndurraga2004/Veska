import { ProfileView } from "@/components/profile/ProfileView";
import { mockWorkspaceSession } from "@/mocks/session.mock";

export default function ProfilePage() {
  return <ProfileView session={mockWorkspaceSession} />;
}
