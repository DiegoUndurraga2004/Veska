import Link from "next/link";

import { formatDateTime } from "@/lib/formatters";
import type { ChatListItem } from "@/types/chats";

type ChatListProps = {
  chats: ChatListItem[];
  hasActiveSearch: boolean;
  onResetSearch: () => void;
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

export function ChatList({
  chats,
  hasActiveSearch,
  onResetSearch,
}: ChatListProps) {
  if (chats.length === 0) {
    return (
      <section className="rounded-xl border border-[#E8EDF3] bg-white">
        <div className="px-5 py-8">
          <p className="text-sm font-semibold text-[#152436]">
            {hasActiveSearch
              ? "No encontramos conversaciones"
              : "Todavía no hay chats"}
          </p>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#526173]">
            {hasActiveSearch
              ? "Prueba modificando la búsqueda o revisa otro título."
              : "Inicia una conversación para consultar los documentos disponibles de tu empresa."}
          </p>

          {hasActiveSearch ? (
            <button
              type="button"
              onClick={onResetSearch}
              className="mt-4 inline-flex rounded-lg border border-[#D9E1EA] px-4 py-2.5 text-sm font-semibold text-[#152436] transition hover:bg-[#F1F4F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Limpiar
            </button>
          ) : (
            <Link
              href="/documents"
              className="mt-4 inline-flex text-sm font-semibold text-[#427AC6] transition hover:text-[#356AAE]"
            >
              Ver biblioteca
            </Link>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-[#E8EDF3] bg-white">
      <ul className="divide-y divide-[#E8EDF3]">
        {chats.map((chat) => (
          <li key={chat.id}>
            <Link
              href={`/chats/${chat.id}`}
              aria-label={`Abrir chat ${chat.title}`}
              className="block px-5 py-4 transition hover:bg-[#F7F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="break-words text-[17px] font-semibold leading-6 text-[#152436]">
                    {chat.title}
                  </p>

                  <p className="mt-1 text-[13px] leading-5 text-[#526173]">
                    Creado por{" "}
                    <span className="font-medium text-[#152436]">
                      {chat.created_by.name ?? "Usuario desconocido"}
                    </span>
                    {" · "}
                    Actualizado {formatDateTime(chat.updated_at)}
                  </p>

                  <span className="mt-3 inline-flex max-w-full rounded-full bg-[#F1F4F7] px-3 py-1 text-[12px] font-medium text-[#526173]">
                    {getScopeLabel(chat.scope)}
                  </span>
                </div>

                <span className="shrink-0 text-[14px] font-semibold text-[#427AC6]">
                  Abrir chat
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
