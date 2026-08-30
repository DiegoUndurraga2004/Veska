"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";

import { MobileWorkspaceMenu } from "@/components/layout/MobileWorkspaceMenu";
import { getMockChatById } from "@/mocks/chats.mock";
import { getMockDocumentById } from "@/mocks/documents.mock";
import type { WorkspaceSession } from "@/types/auth";

type AppHeaderProps = {
  session: WorkspaceSession;
};

type HeaderContext = {
  parentLabel: string | null;
  currentLabel: string;
};

function getHeaderContext(pathname: string): HeaderContext {
  if (pathname === "/dashboard") {
    return {
      parentLabel: null,
      currentLabel: "Inicio",
    };
  }

  if (pathname === "/chats") {
    return {
      parentLabel: null,
      currentLabel: "Chats",
    };
  }

  if (pathname === "/chats/new") {
    return {
      parentLabel: "Chats",
      currentLabel: "Nuevo chat",
    };
  }

  if (pathname.startsWith("/chats/")) {
    const chatId = pathname.split("/")[2] ?? "";
    const chat = getMockChatById(chatId);

    return {
      parentLabel: "Chats",
      currentLabel: chat?.title ?? "Conversación",
    };
  }

  if (pathname === "/documents") {
    return {
      parentLabel: null,
      currentLabel: "Biblioteca documental",
    };
  }

  if (pathname === "/upload") {
    return {
      parentLabel: "Documentos",
      currentLabel: "Subir documentos",
    };
  }

  if (pathname.startsWith("/documents/")) {
    const documentId = pathname.split("/")[2] ?? "";
    const document = getMockDocumentById(documentId);

    return {
      parentLabel: "Documentos",
      currentLabel: document?.file_name ?? "Documento",
    };
  }

  if (pathname === "/admin") {
    return {
      parentLabel: null,
      currentLabel: "Administración",
    };
  }

  if (pathname === "/platform") {
    return {
      parentLabel: null,
      currentLabel: "Panel Veska",
    };
  }

  if (pathname === "/platform/setup/new") {
    return {
      parentLabel: "Panel Veska",
      currentLabel: "Setup de empresa",
    };
  }

  if (pathname === "/profile") {
    return {
      parentLabel: null,
      currentLabel: "Perfil",
    };
  }

  return {
    parentLabel: null,
    currentLabel: "Workspace",
  };
}

export function AppHeader({ session }: AppHeaderProps) {
  const pathname = usePathname();

  const headerContext = useMemo(() => getHeaderContext(pathname), [pathname]);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#E8EDF3] bg-white px-5 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <MobileWorkspaceMenu session={session} />

        <div className="min-w-0">
          <div className="flex min-w-0 items-center">
            {headerContext.parentLabel && (
              <>
                <span className="shrink-0 text-[15px] font-medium leading-[1.2] text-[#7D8A99] lg:text-[16px]">
                  {headerContext.parentLabel}
                </span>

                <span className="shrink-0 px-2 text-[15px] leading-[1.2] text-[#A9B4C0] lg:text-[16px]">
                  /
                </span>
              </>
            )}

            <span
              className="min-w-0 truncate text-[20px] font-semibold leading-[1.15] text-[#152436] lg:text-[22px]"
              title={
                headerContext.parentLabel
                  ? `${headerContext.parentLabel} / ${headerContext.currentLabel}`
                  : headerContext.currentLabel
              }
            >
              {headerContext.currentLabel}
            </span>
          </div>
        </div>
      </div>

      <Link
        href="/profile"
        className="flex shrink-0 items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-[#F1F4F7]"
      >
        <div className="min-w-0 text-right">
          <p className="truncate text-sm font-semibold text-[#152436]">
            {session.user.name}
          </p>
        </div>

        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
          {session.user.initials}
        </span>
      </Link>
    </header>
  );
}
