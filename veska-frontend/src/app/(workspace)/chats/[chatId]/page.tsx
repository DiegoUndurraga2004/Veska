import { notFound } from "next/navigation";

import { ChatSession } from "@/components/chats/ChatSession";
import { getMockChatById } from "@/mocks/chats.mock";

type ChatPageProps = {
  params: Promise<{
    chatId: string;
  }>;
};

export default async function ChatPage({
  params,
}: ChatPageProps) {
  const { chatId } = await params;

  const chat = getMockChatById(chatId);

  if (!chat) {
    notFound();
  }

  return (
    <ChatSession
      key={chat.id}
      scope={chat.scope}
      initialMessages={chat.messages}
      selectedDocumentIds={chat.document_ids}
      selectedSpaceIds={chat.space_ids}
    />
  );
}
