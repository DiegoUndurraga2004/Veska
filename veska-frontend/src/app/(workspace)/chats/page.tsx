import { ChatLibrary } from "@/components/chats/ChatLibrary";
import { mockChats } from "@/mocks/chats.mock";

export default function ChatsPage() {
  return <ChatLibrary chats={mockChats} />;
}
