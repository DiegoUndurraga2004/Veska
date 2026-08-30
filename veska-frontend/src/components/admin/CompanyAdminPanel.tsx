"use client";

import { useState } from "react";

import { CompanyAdminMetrics } from "@/components/admin/CompanyAdminMetrics";
import { CompanyGroupsPanel } from "@/components/admin/CompanyGroupsPanel";
import { CompanyUsersPanel } from "@/components/admin/CompanyUsersPanel";
import { CompanySpacesPanel } from "@/components/admin/CompanySpacesPanel";
import { mockCompanyAdminMetrics } from "@/mocks/company-admin.mock";
import type { WorkspaceSession } from "@/types/auth";

type CompanyAdminPanelProps = {
  session: WorkspaceSession;
};

type AdminSection = "users" | "groups" | "spaces";

const adminSections: {
  value: AdminSection;
  label: string;
}[] = [
  {
    value: "users",
    label: "Usuarios",
  },
  {
    value: "groups",
    label: "Grupos de acceso",
  },
  {
    value: "spaces",
    label: "Espacios y permisos",
  },
];

export function CompanyAdminPanel({
  session,
}: CompanyAdminPanelProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>("users");
  const activeSectionIndex = adminSections.findIndex(
    (section) => section.value === activeSection,
  );

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-[32px] font-semibold tracking-tight text-[#152436] sm:text-[34px]">
          Administración de empresa
        </h1>

        <p className="max-w-3xl text-[15px] leading-6 text-[#526173]">
          Gestiona usuarios, grupos, espacios y permisos del workspace.
        </p>
      </section>

      <section className="rounded-[16px] border border-[#E8EDF3] bg-white px-5 py-7 shadow-[0_1px_2px_rgba(21,36,54,0.04)] sm:px-7 sm:py-8">
        <CompanyAdminMetrics metrics={mockCompanyAdminMetrics} />
      </section>

      <section className="border-b border-[#E8EDF3]">
        <div
          role="tablist"
          aria-label="Secciones de administración"
          className="grid grid-cols-3"
        >
          {adminSections.map((section) => {
            const isActive = activeSection === section.value;

            return (
              <button
                key={section.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveSection(section.value)}
                className={`px-2 pb-4 pt-1 text-[15px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:text-[16px] ${
                  isActive
                    ? "text-[#152436]"
                    : "text-[#526173] hover:text-[#152436]"
                }`}
              >
                {section.label}
              </button>
            );
          })}
        </div>

        <div className="relative h-[2px] overflow-hidden bg-[#E8EDF3]">
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 h-[2px] w-1/3 rounded-full bg-[#427AC6] transition-transform duration-200 ease-out"
            style={{
              transform: `translateX(${Math.max(activeSectionIndex, 0) * 100}%)`,
            }}
          />
        </div>
      </section>

      <div className="transition-all duration-200 ease-out">
        {activeSection === "users" ? (
          <CompanyUsersPanel session={session} />
        ) : activeSection === "groups" ? (
          <CompanyGroupsPanel session={session} />
        ) : (
          <CompanySpacesPanel session={session} />
        )}
      </div>
    </div>
  );
}
