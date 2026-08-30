import Link from "next/link";

import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDateTime } from "@/lib/formatters";
import type { ChatListItem } from "@/types/chats";

type RecentChatsProps = {
  chats: ChatListItem[];
};

function getScopeLabel(scope: ChatListItem["scope"]) {
  if (scope === "all_accessible_spaces") {
    return "Todos tus espacios accesibles";
  }

  if (scope === "selected_spaces") {
    return "Espacios específicos";
  }

  return "Documentos específicos";
}

export function RecentChats({ chats }: RecentChatsProps) {
  return (
    <DashboardSection
      title="Chats recientes"
      description="Continúa tus conversaciones sobre documentos internos."
      action={
        <Link
          href="/chats"
          className="text-sm font-semibold text-brand transition hover:text-brand-hover"
        >
          Ver todos
        </Link>
      }
    >
      {chats.length === 0 ? (
        <EmptyState
          title="Todavía no hay chats"
          description="Inicia una conversación para consultar los documentos disponibles de tu empresa."
          action={
            <Link
              href="/chats"
              className="inline-flex rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
            >
              Crear primer chat
            </Link>
          }
        />
      ) : (
        <div className="divide-y divide-border">
          {chats.map((chat) => (
            <Link
              key={chat.id}
              href={`/chats/${chat.id}`}
              className="block px-5 py-4 transition hover:bg-surface-muted"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {chat.title}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {getScopeLabel(chat.scope)}
                  </p>
                </div>

                <p className="shrink-0 text-xs text-muted-foreground">
                  {formatDateTime(chat.updated_at)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}
