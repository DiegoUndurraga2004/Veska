"use client";

import Link from "next/link";
import { useId, useState } from "react";

import {
  SidebarDocumentIcon,
  SidebarNewChatIcon,
  SidebarUploadIcon,
} from "@/components/icons/SidebarIcons";
import { DocumentStatusBadge } from "@/components/documents/DocumentStatusBadge";
import { formatDateTime, formatFileSize, formatNumber } from "@/lib/formatters";
import { mockCompanyAdminUsers } from "@/mocks/company-admin.mock";
import type { WorkspaceSession } from "@/types/auth";
import type { DashboardData } from "@/types/dashboard";
import type { ChatListItem } from "@/types/chats";
import type { DocumentListItem } from "@/types/documents";

type CompactDashboardProps = {
  session: WorkspaceSession;
  data: DashboardData;
};

function getFirstName(name: string) {
  return name.trim().split(" ")[0] || "usuario";
}

function getRoleLabel(role: WorkspaceSession["user"]["role"]) {
  const labels: Record<WorkspaceSession["user"]["role"], string> = {
    platform_admin: "Administrador de Veska",
    company_admin: "Administrador de empresa",
    company_user: "Usuario de empresa",
    read_only: "Solo lectura",
  };

  return labels[role];
}

function getScopeLabel(scope: ChatListItem["scope"]) {
  if (scope === "all_accessible_spaces") {
    return "Todos los espacios accesibles";
  }

  if (scope === "selected_spaces") {
    return "Espacios específicos";
  }

  return "Documentos específicos";
}

function getDocumentMeta(document: DocumentListItem) {
  return [
    document.file_type.toUpperCase(),
    formatFileSize(document.file_size),
    document.uploaded_by.name ?? "Usuario desconocido",
  ].join(" · ");
}

function canSeeUsersMetric(role: WorkspaceSession["user"]["role"]) {
  return role === "company_admin" || role === "platform_admin";
}

function ProcessingRefreshIcon() {
  return (
    <svg
      viewBox="0 0 18 18"
      aria-hidden="true"
      className="h-[18px] w-[18px] shrink-0"
    >
      <path
        d="M13.5 7.5A5.25 5.25 0 0 0 4.5 6.75m0 0V4.5m0 2.25h2.25M4.5 10.5A5.25 5.25 0 0 0 13.5 11.25m0 0v2.25m0-2.25h-2.25"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function CompactDashboard({
  session,
  data,
}: CompactDashboardProps) {
  const [isProcessingOpen, setIsProcessingOpen] = useState(false);
  const processingPanelId = useId();

  const recentChats = data.recent_chats.slice(0, 3);
  const recentDocuments = data.recent_documents.slice(0, 3);
  const processingDocuments = data.processing_documents.slice(0, 4);
  const showUsersMetric = canSeeUsersMetric(session.user.role);
  const visibleCompanyUsers = mockCompanyAdminUsers.filter(
    (user) => user.tenant_id === session.tenant.id,
  ).length;
  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8">
      <section className="px-1 pt-1 sm:px-0">
        <p className="text-[28px] font-semibold leading-tight tracking-tight text-[#152436] sm:text-[32px]">
          Hola, {getFirstName(session.user.name)}
        </p>

        <p className="mt-2 text-[14px] font-medium text-[#526173] sm:text-[15px]">
          {session.tenant.name} · {getRoleLabel(session.user.role)}
        </p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#E8EDF3] bg-white px-6 py-7 shadow-[0_1px_2px_rgba(21,36,54,0.04)] sm:px-7 sm:py-8">
        <div
          className={`flex flex-col lg:grid lg:items-stretch ${
            showUsersMetric
              ? "lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)_1px_minmax(0,1fr)]"
              : "lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)]"
          }`}
        >
          <article className="flex flex-col items-center py-1 text-center">
            <p className="text-[46px] font-semibold leading-none tracking-tight text-[#152436] sm:text-[52px]">
              {formatNumber(data.summary.documents_count)}
            </p>

            <p className="mt-2 text-[16px] font-semibold text-[#526173] sm:text-[17px]">
              Documentos
            </p>

            <button
              type="button"
              onClick={() => setIsProcessingOpen((value) => !value)}
              aria-expanded={isProcessingOpen}
              aria-controls={processingPanelId}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-transparent bg-transparent px-0 py-0 text-[13px] font-semibold text-[#427AC6] transition hover:text-[#356AAE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <ProcessingRefreshIcon />
              <span>
                {formatNumber(data.summary.processing_documents_count)} procesando
              </span>
            </button>
          </article>

          <div
            aria-hidden="true"
            className="hidden self-center bg-[#E8EDF3] lg:block lg:h-[72px] lg:w-px"
          />

          <article className="flex flex-col items-center py-1 text-center">
            <p className="text-[46px] font-semibold leading-none tracking-tight text-[#152436] sm:text-[52px]">
              {formatNumber(data.summary.chats_count)}
            </p>

            <p className="mt-2 text-[16px] font-semibold text-[#526173] sm:text-[17px]">
              Chats
            </p>

            <p className="mt-2 text-[13px] leading-5 text-[#7D8A99]">
              Conversaciones guardadas
            </p>
          </article>

          {showUsersMetric ? (
            <>
              <div
                aria-hidden="true"
                className="hidden self-center bg-[#E8EDF3] lg:block lg:h-[72px] lg:w-px"
              />

            <article className="flex flex-col items-center py-1 text-center">
              <p className="text-[46px] font-semibold leading-none tracking-tight text-[#152436] sm:text-[52px]">
                {formatNumber(visibleCompanyUsers)}
              </p>

              <p className="mt-2 text-[16px] font-semibold text-[#526173] sm:text-[17px]">
                Usuarios
              </p>

              <p className="mt-2 text-[13px] leading-5 text-[#7D8A99]">
                Miembros de la empresa
              </p>
            </article>
            </>
          ) : null}
        </div>
      </section>

      {isProcessingOpen && (
        <section
          id={processingPanelId}
          className="rounded-2xl border border-border bg-surface px-5 py-5 shadow-sm sm:px-6 sm:py-6"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[16px] font-semibold text-[#152436]">
                Procesamiento documental
              </h2>

              <p className="mt-1 text-[13px] leading-5 text-[#526173]">
                {formatNumber(data.summary.processing_documents_count)} documentos aún no están disponibles como fuente.
              </p>
            </div>

            <Link
              href="/documents"
              className="inline-flex text-[13px] font-semibold text-[#427AC6] transition hover:text-[#356AAE]"
            >
              Revisar estados
            </Link>
          </div>

          <div className="mt-4 divide-y divide-border rounded-xl border border-border">
            {processingDocuments.map((document) => (
              <Link
                key={document.id}
                href={`/documents/${document.id}`}
                className="flex flex-col gap-3 px-4 py-3 transition hover:bg-[#F7F9FC] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-[#152436]">
                    {document.file_name}
                  </p>

                  <p className="mt-1 text-[12px] leading-5 text-[#526173]">
                    Actualizado {formatDateTime(document.updated_at)}
                  </p>
                </div>

                <DocumentStatusBadge status={document.status} />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="pt-1">
        <div className="text-center">
          <h2 className="text-[17px] font-semibold text-[#152436]">
              Acciones rápidas
          </h2>

          <p className="mt-1 text-[13px] leading-5 text-[#526173]">
            Empieza una conversación o entra directo a documentos.
          </p>
        </div>

        <div className="mt-4 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
          <Link
            href="/chats/new"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#427AC6] px-[18px] text-[14px] font-semibold text-white transition hover:bg-[#356AAE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6] focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:w-auto"
          >
            <SidebarNewChatIcon className="h-[18px] w-[18px]" />
            Nuevo chat
          </Link>

          <Link
            href="/upload"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#D9E1EA] bg-white px-[18px] text-[14px] font-semibold text-[#152436] transition hover:bg-[#F1F4F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6] focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:w-auto"
          >
            <SidebarUploadIcon className="h-[18px] w-[18px]" />
            Subir documentos
          </Link>

          <Link
            href="/documents"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#D9E1EA] bg-white px-[18px] text-[14px] font-semibold text-[#152436] transition hover:bg-[#F1F4F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6] focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:w-auto"
          >
            <SidebarDocumentIcon className="h-[18px] w-[18px]" />
            Ver biblioteca
          </Link>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-[16px] font-semibold text-[#152436]">
                Chats recientes
              </h2>

              <p className="mt-1 text-[13px] leading-5 text-[#526173]">
                Conversaciones guardadas por la sesión actual.
              </p>
            </div>

            <Link
              href="/chats"
              className="shrink-0 text-[13px] font-semibold text-[#427AC6] transition hover:text-[#356AAE]"
            >
              Ver todos
            </Link>
          </div>

          {recentChats.length === 0 ? (
            <div className="px-5 py-6 text-sm text-[#526173] sm:px-6">
              Todavía no hay chats.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentChats.map((chat) => (
                <Link
                  key={chat.id}
                  href={`/chats/${chat.id}`}
                  className="flex items-start justify-between gap-4 px-5 py-4 transition hover:bg-[#F7F9FC] sm:px-6"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-[#152436]">
                      {chat.title}
                    </p>

                    <p className="mt-1 text-[12px] leading-5 text-[#526173]">
                      {getScopeLabel(chat.scope)}
                    </p>
                  </div>

                  <p className="shrink-0 text-[12px] text-[#7D8A99]">
                    {formatDateTime(chat.updated_at)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </article>

        <article className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-[16px] font-semibold text-[#152436]">
                Documentos recientes
              </h2>

              <p className="mt-1 text-[13px] leading-5 text-[#526173]">
                Archivos incorporados al workspace de la empresa.
              </p>
            </div>

            <Link
              href="/documents"
              className="shrink-0 text-[13px] font-semibold text-[#427AC6] transition hover:text-[#356AAE]"
            >
              Ver biblioteca
            </Link>
          </div>

          {recentDocuments.length === 0 ? (
            <div className="px-5 py-6 text-sm text-[#526173] sm:px-6">
              Todavía no hay documentos.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentDocuments.map((document) => (
                <Link
                  key={document.id}
                  href={`/documents/${document.id}`}
                  className="flex flex-col gap-3 px-5 py-4 transition hover:bg-[#F7F9FC] sm:flex-row sm:items-start sm:justify-between sm:px-6"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-[#152436]">
                      {document.file_name}
                    </p>

                    <p className="mt-1 text-[12px] leading-5 text-[#526173]">
                      {getDocumentMeta(document)}
                    </p>

                    <p className="mt-1 text-[12px] text-[#7D8A99]">
                      {formatDateTime(document.created_at)}
                    </p>
                  </div>

                  <DocumentStatusBadge status={document.status} />
                </Link>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
