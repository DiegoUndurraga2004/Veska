"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import {
  SidebarChevronLeftIcon,
  SidebarChevronRightIcon,
  SidebarNewChatIcon,
  SidebarReportIcon,
} from "@/components/icons/SidebarIcons";
import { NEW_CHAT_RESET_EVENT } from "@/components/chats/new-chat-session";
import { requestNewChatReset } from "@/components/chats/new-chat-session";
import { VeskaLogo } from "@/components/brand/VeskaLogo";
import { WorkspaceNav } from "@/components/layout/WorkspaceNav";
import { WorkspaceSpacesNav } from "@/components/layout/WorkspaceSpacesNav";
import type { WorkspaceSession } from "@/types/auth";

type AppSidebarProps = {
  session: WorkspaceSession;
};

function getInitialCollapsed(pathname: string) {
  return pathname.startsWith("/chats/") && pathname !== "/chats/new";
}

function AppSidebarInner({
  session,
  pathname,
}: AppSidebarProps & { pathname: string }) {
  const [isCollapsed, setIsCollapsed] = useState(
    () => getInitialCollapsed(pathname),
  );
  const hasAppliedChatAutoCollapseRef = useRef(
    getInitialCollapsed(pathname),
  );

  useEffect(() => {
    function handleChatStarted() {
      if (hasAppliedChatAutoCollapseRef.current) {
        return;
      }

      hasAppliedChatAutoCollapseRef.current = true;
      setIsCollapsed(true);
    }

    function handleChatReset() {
      hasAppliedChatAutoCollapseRef.current = false;
      setIsCollapsed(false);
    }

    window.addEventListener(
      "veska:chat-started",
      handleChatStarted,
    );
    window.addEventListener(
      NEW_CHAT_RESET_EVENT,
      handleChatReset,
    );

    return () => {
      window.removeEventListener(
        "veska:chat-started",
        handleChatStarted,
      );
      window.removeEventListener(
        NEW_CHAT_RESET_EVENT,
        handleChatReset,
      );
    };
  }, []);

  function expandSidebar() {
    setIsCollapsed(false);
  }

  function collapseSidebar() {
    setIsCollapsed(true);
  }

  return (
    <aside
      className={`hidden shrink-0 border-r border-[#e6ecf2] bg-[#f7f9fc] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-hidden lg:transition-[width] lg:duration-200 lg:ease-out ${
        isCollapsed ? "lg:w-[74px]" : "lg:w-[268px]"
      }`}
    >
      <div
        className={`shrink-0 px-3 pt-5 ${
          isCollapsed ? "pb-5" : "pb-6"
        }`}
      >
        <div
          className={`flex items-center ${
            isCollapsed ? "justify-center" : "justify-between gap-3"
          }`}
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center text-left"
            aria-label="Ir al dashboard de Veska"
            title="Ir al dashboard de Veska"
          >
            {isCollapsed ? (
              <VeskaLogo variant="mark" className="h-9 w-9 object-contain" />
            ) : (
              <VeskaLogo
                variant="full"
                className="h-auto w-[156px] object-contain"
              />
            )}
          </Link>

          {!isCollapsed && (
            <button
              type="button"
              aria-label="Contraer sidebar"
              title="Contraer sidebar"
              aria-expanded={!isCollapsed}
              onClick={collapseSidebar}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#526173] transition hover:bg-white hover:text-[#152436]"
            >
              <SidebarChevronLeftIcon className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className="shrink-0 px-5 pb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#526173]">
            Empresa activa
          </p>

          <p className="mt-2 truncate text-[16px] font-semibold leading-5 text-[#152436]">
            {session.tenant.name}
          </p>

          <p className="mt-1 text-[13px] leading-5 text-[#637083]">
            {session.tenant.plan}
          </p>
        </div>
      )}

      <div className={`shrink-0 ${isCollapsed ? "px-3 pb-4" : "px-5 pb-5"}`}>
        {isCollapsed ? (
          <Link
            href="/chats/new"
            aria-label="Nuevo chat"
            title="Nuevo chat"
            onClick={requestNewChatReset}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#427AC6] text-white transition hover:bg-[#356AAE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            <SidebarNewChatIcon className="h-5 w-5" />
          </Link>
        ) : (
          <Link
            href="/chats/new"
            onClick={requestNewChatReset}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-[#427AC6] px-4 text-sm font-semibold text-white transition hover:bg-[#356AAE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            + Nuevo chat
          </Link>
        )}
      </div>

      <div
        className={`flex-1 overflow-y-auto pb-2 ${
          isCollapsed ? "px-1" : "px-1"
        }`}
      >
        <WorkspaceNav
          role={session.user.role}
          collapsed={isCollapsed}
        />

        <WorkspaceSpacesNav
          collapsed={isCollapsed}
          onNavigate={expandSidebar}
          onExpand={expandSidebar}
        />
      </div>

      <div className="shrink-0 border-t border-[#e6ecf2] px-3 py-4">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              aria-label="Reportar problema"
              title="Reportar problema"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-[#526173] transition hover:bg-white hover:text-[#152436]"
            >
              <SidebarReportIcon className="h-5 w-5" />
            </button>

            <Link
              href="/profile"
              aria-label={session.user.name}
              title={session.user.name}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand transition hover:bg-white"
            >
              {session.user.initials}
            </Link>

            <button
              type="button"
              aria-label="Expandir sidebar"
              title="Expandir sidebar"
              aria-expanded={!isCollapsed}
              onClick={expandSidebar}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-[#526173] transition hover:bg-white hover:text-[#152436]"
            >
              <SidebarChevronRightIcon className="h-[18px] w-[18px]" />
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              aria-label="Reportar problema"
              title="Reportar problema"
              className="flex h-10 w-full items-center justify-start rounded-xl px-3 text-sm font-medium text-[#526173] transition hover:bg-white hover:text-[#152436]"
            >
              Reportar problema
            </button>

            <div className="mt-2 flex items-center gap-2">
              <Link
                href="/profile"
                className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
                  {session.user.initials}
                </span>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#152436]">
                    {session.user.name}
                  </p>

                  <p className="truncate text-xs text-[#637083]">
                    {session.user.email}
                  </p>
                </div>
              </Link>

              <button
                type="button"
                aria-label="Contraer sidebar"
                title="Contraer sidebar"
                aria-expanded={!isCollapsed}
                onClick={collapseSidebar}
                className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-xl text-[#526173] transition hover:bg-white hover:text-[#152436]"
              >
                <SidebarChevronLeftIcon className="h-[18px] w-[18px]" />
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

export function AppSidebar({ session }: AppSidebarProps) {
  const pathname = usePathname();

  return <AppSidebarInner key={pathname} session={session} pathname={pathname} />;
}
