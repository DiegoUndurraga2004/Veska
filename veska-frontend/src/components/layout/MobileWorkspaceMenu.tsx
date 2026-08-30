"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { requestNewChatReset } from "@/components/chats/new-chat-session";
import {
  SidebarCloseIcon,
  SidebarHamburgerIcon,
  SidebarReportIcon,
} from "@/components/icons/SidebarIcons";
import { VeskaLogo } from "@/components/brand/VeskaLogo";
import { WorkspaceNav } from "@/components/layout/WorkspaceNav";
import { WorkspaceSpacesNav } from "@/components/layout/WorkspaceSpacesNav";
import type { WorkspaceSession } from "@/types/auth";

type MobileWorkspaceMenuProps = {
  session: WorkspaceSession;
};

export function MobileWorkspaceMenu({
  session,
}: MobileWorkspaceMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  function closeMenu() {
    setIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="mobile-workspace-menu"
        aria-label="Abrir menú"
        title="Abrir menú"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#D9E1EA] bg-white text-[#152436] transition hover:bg-[#F1F4F7] lg:hidden"
      >
        <SidebarHamburgerIcon className="h-5 w-5" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="presentation"
        >
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={closeMenu}
            className="absolute inset-0 bg-[#152436]/35"
          />

          <aside
            id="mobile-workspace-menu"
            role="dialog"
            aria-modal="true"
            className="relative flex h-[100dvh] w-[min(88vw,360px)] max-w-[360px] flex-col border-r border-[#e6ecf2] bg-[#f7f9fc] shadow-[24px_0_48px_rgba(21,36,54,0.12)]"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-[#e8edf3] px-5 py-4">
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="inline-flex items-center gap-3"
                aria-label="Ir al dashboard de Veska"
                title="Ir al dashboard de Veska"
              >
                <VeskaLogo variant="mark" className="h-9 w-9 object-contain" />

                <span className="text-[15px] font-semibold tracking-tight text-[#152436]">
                  Veska
                </span>
              </Link>

              <button
                type="button"
                onClick={closeMenu}
                aria-label="Cerrar menú"
                title="Cerrar menú"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-[#526173] transition hover:bg-[#F1F4F7] hover:text-[#152436]"
              >
                <SidebarCloseIcon className="h-[18px] w-[18px]" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="px-5 py-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#526173]">
                  Empresa activa
                </p>

                <p className="mt-2 truncate text-[17px] font-semibold leading-5 text-[#152436]">
                  {session.tenant.name}
                </p>

                <p className="mt-1 text-[13px] leading-5 text-[#7D8A99]">
                  {session.tenant.plan}
                </p>
              </div>

              <div className="px-5 pb-5">
                <Link
                  href="/chats/new"
                  onClick={() => {
                    requestNewChatReset();
                    closeMenu();
                  }}
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-[#427AC6] px-4 text-sm font-semibold text-white transition hover:bg-[#356AAE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6]/30"
                >
                  + Nuevo chat
                </Link>
              </div>

              <WorkspaceNav
                role={session.user.role}
                onNavigate={closeMenu}
                mobile
              />

              <WorkspaceSpacesNav
                onNavigate={closeMenu}
                mobile
              />
            </div>

            <div className="shrink-0 border-t border-[#e8edf3] bg-[#f7f9fc] px-5 py-4">
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Reportar problema"
                title="Reportar problema"
                className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-[#526173] transition hover:bg-white hover:text-[#152436]"
              >
                <SidebarReportIcon className="h-5 w-5" />

                <span>Reportar problema</span>
              </button>

              <Link
                href="/profile"
                onClick={closeMenu}
                className="mt-3 flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
                  {session.user.initials}
                </span>

                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-[#152436]">
                    {session.user.name}
                  </p>

                  <p className="truncate text-[13px] text-[#7D8A99]">
                    {session.user.email}
                  </p>
                </div>
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
