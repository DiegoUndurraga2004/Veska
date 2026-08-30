"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

import {
  SidebarAdminIcon,
  SidebarChatsIcon,
  SidebarDocumentIcon,
  SidebarHomeIcon,
  SidebarPlatformIcon,
  SidebarUploadIcon,
} from "@/components/icons/SidebarIcons";
import type { UserRole } from "@/types/auth";

type WorkspaceNavProps = {
  role: UserRole;
  onNavigate?: () => void;
  collapsed?: boolean;
  mobile?: boolean;
};

type NavigationItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  allowedRoles?: UserRole[];
};

type NavigationSection = {
  label: string;
  items: NavigationItem[];
};

const workspaceItems: NavigationItem[] = [
  { label: "Inicio", href: "/dashboard", icon: SidebarHomeIcon },
  { label: "Chats", href: "/chats", icon: SidebarChatsIcon },
  { label: "Documentos", href: "/documents", icon: SidebarDocumentIcon },
  {
    label: "Subir documentos",
    href: "/upload",
    icon: SidebarUploadIcon,
    allowedRoles: ["platform_admin", "company_admin", "company_user"],
  },
];

const companyAdminItems: NavigationItem[] = [
  {
    label: "Administración",
    href: "/admin",
    icon: SidebarAdminIcon,
    allowedRoles: ["platform_admin", "company_admin"],
  },
];

const platformAdminItems: NavigationItem[] = [
  {
    label: "Panel Veska",
    href: "/platform",
    icon: SidebarPlatformIcon,
    allowedRoles: ["platform_admin"],
  },
];

const navigationSections: NavigationSection[] = [
  {
    label: "Workspace",
    items: workspaceItems,
  },
  {
    label: "Empresa",
    items: companyAdminItems,
  },
  {
    label: "Veska",
    items: platformAdminItems,
  },
];

function canViewItem(item: NavigationItem, role: UserRole) {
  return !item.allowedRoles || item.allowedRoles.includes(role);
}

function isRouteActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function WorkspaceNav({
  role,
  onNavigate,
  collapsed = false,
  mobile = false,
}: WorkspaceNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={
        mobile
          ? "space-y-5 px-5 py-4"
          : collapsed
            ? "space-y-4 px-1 py-3"
            : "space-y-7 px-4 py-3"
      }
    >
      {navigationSections.map((section) => {
        const visibleItems = section.items.filter((item) =>
          canViewItem(item, role),
        );

        if (visibleItems.length === 0) {
          return null;
        }

        return (
          <div key={section.label}>
            {!collapsed && !mobile && (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#526173]">
                {section.label}
              </p>
            )}

            {mobile && (
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#526173]">
                {section.label}
              </p>
            )}

            <div
              className={
                mobile ? "space-y-2" : collapsed ? "space-y-1" : "space-y-1.5"
              }
            >
              {visibleItems.map((item) => {
                const isActive = isRouteActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={onNavigate}
                    aria-label={item.label}
                    title={item.label}
                    className={`transition ${
                      mobile
                        ? `flex h-12 w-full items-center gap-3 rounded-xl px-3 text-[15px] font-medium ${
                            isActive
                              ? "bg-[#EEF4FB] text-[#152436]"
                              : "text-[#526173] hover:bg-[#F1F4F7] hover:text-[#152436]"
                          }`
                        : collapsed
                        ? `mx-auto flex h-11 w-11 items-center justify-center rounded-xl ${
                            isActive
                              ? "bg-[#EEF4FB] text-[#427AC6]"
                              : "text-[#526173] hover:bg-[#F1F4F7] hover:text-[#152436]"
                          }`
                        : `block rounded-xl px-3 py-2.5 text-[14px] font-medium ${
                            isActive
                              ? "bg-[#EEF4FB] text-[#152436] shadow-[inset_0_0_0_1px_rgba(66,122,198,0.08)]"
                              : "text-[#526173] hover:bg-[#F1F4F7] hover:text-[#152436]"
                          }`
                    }`}
                  >
                    <item.icon
                      className={
                        mobile
                          ? `h-[18px] w-[18px] ${
                              isActive ? "text-[#427AC6]" : "text-[#526173]"
                            }`
                          : collapsed
                            ? "h-5 w-5"
                            : "hidden"
                      }
                    />

                    {!collapsed && !mobile && item.label}

                    {mobile && <span className="min-w-0 truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
