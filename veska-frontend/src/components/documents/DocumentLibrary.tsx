"use client";

import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import Link from "next/link";

import { DeleteDocumentDialog } from "@/components/documents/DeleteDocumentDialog";
import { DocumentCardList } from "@/components/documents/DocumentCardList";
import {
  DocumentFilters,
  type DocumentFileTypeFilter,
  type DocumentStatusFilter,
} from "@/components/documents/DocumentFilters";
import { DocumentPagination } from "@/components/documents/DocumentPagination";
import { DocumentSpaceContext } from "@/components/documents/DocumentSpaceContext";
import { DocumentTable } from "@/components/documents/DocumentTable";
import type { UserRole } from "@/types/auth";
import type { DocumentListItem } from "@/types/documents";
import type { Space } from "@/types/spaces";

const PAGE_SIZE = 6;

type DocumentLibraryProps = {
  documents: DocumentListItem[];
  role: UserRole;
  selectedSpace: Space | null;
  directSubspaces: Space[];
  hasInvalidSpaceSelection: boolean;
};

function canDeleteDocuments(role: UserRole) {
  return role === "platform_admin" || role === "company_admin";
}

type EmptyStateContent = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function DocumentLibrary({
  documents,
  role,
  selectedSpace,
  directSubspaces,
  hasInvalidSpaceSelection,
}: DocumentLibraryProps) {
  const [search, setSearch] = useState("");
  const [fileType, setFileType] =
    useState<DocumentFileTypeFilter>("all");
  const [status, setStatus] =
    useState<DocumentStatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletedDocumentIds, setDeletedDocumentIds] = useState<string[]>([]);
  const [documentPendingDeletion, setDocumentPendingDeletion] =
    useState<DocumentListItem | null>(null);
  const [deletedDocumentName, setDeletedDocumentName] =
    useState<string | null>(null);

  const hasActiveFilters =
    search.trim().length > 0 ||
    fileType !== "all" ||
    status !== "all";

  const activeDocuments = useMemo(
    () =>
      documents
        .filter(
          (document) =>
            document.status !== "deleted" &&
            !deletedDocumentIds.includes(document.id),
        )
        .sort(
          (firstDocument, secondDocument) =>
            new Date(secondDocument.created_at).getTime() -
            new Date(firstDocument.created_at).getTime(),
        ),
    [deletedDocumentIds, documents],
  );

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("es-CL");

    return activeDocuments.filter((document) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        document.file_name
          .toLocaleLowerCase("es-CL")
          .includes(normalizedSearch);

      const matchesFileType =
        fileType === "all" || document.file_type === fileType;

      const matchesStatus =
        status === "all" || document.status === status;

      return matchesSearch && matchesFileType && matchesStatus;
    });
  }, [activeDocuments, fileType, search, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDocuments.length / PAGE_SIZE),
  );

  const safeCurrentPage = Math.max(
    1,
    Math.min(currentPage, totalPages),
  );

  const paginatedDocuments = useMemo(() => {
    const firstDocumentIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    const lastDocumentIndex = firstDocumentIndex + PAGE_SIZE;

    return filteredDocuments.slice(
      firstDocumentIndex,
      lastDocumentIndex,
    );
  }, [filteredDocuments, safeCurrentPage]);

  const resetFilters = useCallback(() => {
    setSearch("");
    setFileType("all");
    setStatus("all");
    setCurrentPage(1);
  }, []);

  const emptyState: EmptyStateContent = useMemo(() => {
    if (hasInvalidSpaceSelection) {
      return {
        title: "Espacio no disponible",
        description:
          "El espacio solicitado no existe dentro de los accesibles en este mock.",
        action: (
          <Link
            href="/documents"
            className="inline-flex rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
          >
            Volver a /documents
          </Link>
        ),
      };
    }

    if (hasActiveFilters) {
      return {
        title: "No encontramos documentos",
        description:
          "Prueba modificando los filtros o busca otro nombre de archivo.",
        action: (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
          >
            Limpiar filtros
          </button>
        ),
      };
    }

    return {
      title: selectedSpace
        ? "No hay documentos visibles en este espacio"
        : "Todavía no hay documentos",
      description:
        selectedSpace
          ? "Este espacio todavía no tiene documentos visibles. Prueba entrando a un subespacio o vuelve a la biblioteca general."
          : "Sube el primer archivo para comenzar a construir la biblioteca documental de tu empresa.",
      action: (
        selectedSpace ? (
          <Link
            href="/documents"
            className="inline-flex rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
          >
            Limpiar filtro
          </Link>
        ) : (
          <Link
            href="/upload"
            className="inline-flex rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
          >
            Subir primer documento
          </Link>
        )
      ),
    };
  }, [
    hasActiveFilters,
    hasInvalidSpaceSelection,
    resetFilters,
    selectedSpace,
  ]);

  function changeSearch(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  function changeFileType(value: DocumentFileTypeFilter) {
    setFileType(value);
    setCurrentPage(1);
  }

  function changeStatus(value: DocumentStatusFilter) {
    setStatus(value);
    setCurrentPage(1);
  }

  function requestDocumentDeletion(document: DocumentListItem) {
    setDocumentPendingDeletion(document);
  }

  function cancelDocumentDeletion() {
    setDocumentPendingDeletion(null);
  }

  function confirmDocumentDeletion() {
    if (!documentPendingDeletion) {
      return;
    }

    setDeletedDocumentIds((currentIds) => [
      ...currentIds,
      documentPendingDeletion.id,
    ]);
    setDeletedDocumentName(documentPendingDeletion.file_name);
    setDocumentPendingDeletion(null);
  }

  const allowDocumentDeletion = canDeleteDocuments(role);

  return (
    <div className="space-y-4">
      {deletedDocumentName && (
        <section className="border-y border-brand-soft bg-brand-soft/40 px-5 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#152436]">
                Documento eliminado
              </p>

              <p className="mt-1 text-sm leading-5 text-[#526173]">
                {deletedDocumentName} dejó de aparecer en la biblioteca.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDeletedDocumentName(null)}
              className="shrink-0 text-sm font-semibold text-[#427AC6] transition hover:text-[#356AAE]"
            >
              Cerrar aviso
            </button>
          </div>
        </section>
      )}

      <DocumentSpaceContext
        selectedSpace={selectedSpace}
        directSubspaces={directSubspaces}
        visibleDocumentsCount={filteredDocuments.length}
        hasInvalidSpaceSelection={hasInvalidSpaceSelection}
      />

      <DocumentFilters
        search={search}
        fileType={fileType}
        status={status}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={changeSearch}
        onFileTypeChange={changeFileType}
        onStatusChange={changeStatus}
        onResetFilters={resetFilters}
      />

      <div className="hidden md:block">
        <DocumentTable
          documents={paginatedDocuments}
          canDeleteDocuments={allowDocumentDeletion}
          onRequestDelete={requestDocumentDeletion}
          emptyState={emptyState}
        />
      </div>

      <div className="md:hidden">
        <DocumentCardList
          documents={paginatedDocuments}
          canDeleteDocuments={allowDocumentDeletion}
          onRequestDelete={requestDocumentDeletion}
          emptyState={emptyState}
        />
      </div>

      <DocumentPagination
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        totalResults={filteredDocuments.length}
        pageSize={PAGE_SIZE}
        onPreviousPage={() =>
          setCurrentPage(Math.max(1, safeCurrentPage - 1))
        }
        onNextPage={() =>
          setCurrentPage(
            Math.min(totalPages, safeCurrentPage + 1),
          )
        }
      />

      <DeleteDocumentDialog
        document={documentPendingDeletion}
        onCancel={cancelDocumentDeletion}
        onConfirm={confirmDocumentDeletion}
      />
    </div>
  );
}
