"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  SidebarChevronLeftIcon,
  SidebarChevronRightIcon,
} from "@/components/icons/SidebarIcons";
import { ChatComposer } from "@/components/chats/ChatComposer";
import { ChatList } from "@/components/chats/ChatList";
import type { ChatListItem } from "@/types/chats";

const PAGE_SIZE = 4;

type ChatLibraryProps = {
  chats: ChatListItem[];
};

export function ChatLibrary({ chats }: ChatLibraryProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const sortedChats = useMemo(
    () =>
      [...chats].sort(
        (firstChat, secondChat) =>
          new Date(secondChat.updated_at).getTime() -
          new Date(firstChat.updated_at).getTime(),
      ),
    [chats],
  );

  const filteredChats = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLocaleLowerCase("es-CL");

    if (normalizedSearch.length === 0) {
      return sortedChats;
    }

    return sortedChats.filter((chat) =>
      chat.title
        .toLocaleLowerCase("es-CL")
        .includes(normalizedSearch),
    );
  }, [search, sortedChats]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredChats.length / PAGE_SIZE),
  );

  const safeCurrentPage = Math.max(
    1,
    Math.min(currentPage, totalPages),
  );

  const paginatedChats = useMemo(() => {
    const firstChatIndex =
      (safeCurrentPage - 1) * PAGE_SIZE;

    return filteredChats.slice(
      firstChatIndex,
      firstChatIndex + PAGE_SIZE,
    );
  }, [filteredChats, safeCurrentPage]);

  function changeSearch(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  function resetSearch() {
    setSearch("");
    setCurrentPage(1);
  }

function startNewChat(question: string) {
    // Simulación frontend temporal: esto debe reemplazarse por POST /chats y
    // POST /chats/{chat_id}/messages cuando exista backend real.
    window.sessionStorage.setItem(
      "veska:new-chat-draft",
      question,
    );
    router.push("/chats/new");
  }

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 pb-6 pt-2 sm:px-6 lg:px-8">
      <section className="max-w-3xl space-y-0">
        <h1 className="text-[clamp(1.625rem,1.9vw,1.875rem)] font-semibold tracking-tight text-[#152436]">
          Conversaciones de tu empresa
        </h1>
      </section>

      <section className="mx-auto flex w-full max-w-[980px] flex-col items-center gap-4 pt-4 sm:pt-6 lg:pt-8">
        <p className="text-center text-[22px] font-medium leading-[1.25] text-[#152436] sm:text-[24px] lg:text-[26px]">
          ¿Qué buscaremos hoy?
        </p>

        <ChatComposer
          compact
          placeholder="Escribe una consulta sobre tus documentos..."
          submitLabel="Iniciar conversación"
          onSubmitQuestion={startNewChat}
        />

        <div className="flex w-full justify-end">
          <Link
            href="/documents"
            className="text-sm font-semibold text-[#427AC6] transition hover:text-[#356AAE]"
          >
            Ver biblioteca
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-4 pt-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h2 className="text-[22px] font-semibold tracking-tight text-[#152436]">
            Chats recientes
          </h2>

          <p className="max-w-2xl text-sm leading-6 text-[#526173]">
            Revisa las conversaciones más recientes o abre una existente.
          </p>
        </div>

        <div className="w-full max-w-[380px]">
          <label
            htmlFor="chat-search"
            className="sr-only"
          >
            Buscar chats por título
          </label>

          <div className="mt-2 flex items-center gap-3 border-b border-[#D9E1EA] pb-2">
            <input
              id="chat-search"
              type="search"
              aria-label="Buscar chats por título"
              value={search}
              onChange={(event) =>
                changeSearch(event.target.value)
              }
              placeholder="Busca por título..."
              className="min-w-0 flex-1 border-0 bg-transparent px-0 py-1 text-[15px] text-[#152436] outline-none placeholder:text-[#7D8A99] focus:ring-0"
            />

            {search.trim().length > 0 && (
              <button
                type="button"
                onClick={resetSearch}
                aria-label="Limpiar búsqueda"
                className="rounded-md px-2 py-1 text-sm font-semibold text-[#427AC6] transition hover:text-[#356AAE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </section>

      <ChatList
        chats={paginatedChats}
        hasActiveSearch={search.trim().length > 0}
        onResetSearch={resetSearch}
      />

      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() =>
            setCurrentPage(
              Math.max(1, safeCurrentPage - 1),
            )
          }
          disabled={safeCurrentPage <= 1}
          aria-label="Página anterior"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#D9E1EA] bg-white text-[#526173] transition hover:bg-[#F1F4F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SidebarChevronLeftIcon className="h-4 w-4" />
        </button>

        <p className="text-[13px] font-medium text-[#526173]">
          Página {safeCurrentPage} de {totalPages}
        </p>

        <button
          type="button"
          onClick={() =>
            setCurrentPage(
              Math.min(totalPages, safeCurrentPage + 1),
            )
          }
          disabled={safeCurrentPage >= totalPages}
          aria-label="Página siguiente"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#D9E1EA] bg-white text-[#526173] transition hover:bg-[#F1F4F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SidebarChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
