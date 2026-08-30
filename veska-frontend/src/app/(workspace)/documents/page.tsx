import Link from "next/link";

import { DocumentLibrary } from "@/components/documents/DocumentLibrary";
import { mockDocuments } from "@/mocks/documents.mock";
import { mockAccessibleSpaces } from "@/mocks/spaces.mock";
import { mockWorkspaceSession } from "@/mocks/session.mock";
import type { UserRole } from "@/types/auth";
import type { Space } from "@/types/spaces";

function canUploadDocuments(role: UserRole) {
  return (
    role === "platform_admin" ||
    role === "company_admin" ||
    role === "company_user"
  );
}

type DocumentsPageProps = {
  searchParams?: Promise<{
    space?: string | string[];
  }>;
};

function getSelectedSpaceId(searchParams?: {
  space?: string | string[];
}) {
  const rawSpaceParam = searchParams?.space;
  const selectedSpaceId = Array.isArray(rawSpaceParam)
    ? rawSpaceParam[0]
    : rawSpaceParam;

  return selectedSpaceId?.trim() ?? "";
}

function getDescendantSpaceIds(spaceId: string, spaces: Space[]) {
  const spacesByParentId = new Map<string, Space[]>();

  spaces.forEach((space) => {
    if (!space.parent_space_id) {
      return;
    }

    const siblings = spacesByParentId.get(space.parent_space_id) ?? [];
    siblings.push(space);
    spacesByParentId.set(space.parent_space_id, siblings);
  });

  const collectedSpaceIds = new Set<string>();
  const stack = [spaceId];

  while (stack.length > 0) {
    const currentSpaceId = stack.pop();

    if (!currentSpaceId || collectedSpaceIds.has(currentSpaceId)) {
      continue;
    }

    collectedSpaceIds.add(currentSpaceId);

    const childSpaces = spacesByParentId.get(currentSpaceId) ?? [];

    childSpaces.forEach((childSpace) => {
      stack.push(childSpace.id);
    });
  }

  return collectedSpaceIds;
}

export default async function DocumentsPage({
  searchParams,
}: DocumentsPageProps) {
  const resolvedSearchParams = await searchParams;
  const activeDocuments = mockDocuments.filter(
    (document) => document.status !== "deleted",
  );

  const selectedSpaceId = getSelectedSpaceId(resolvedSearchParams);
  const selectedSpace = selectedSpaceId
    ? mockAccessibleSpaces.find(
      (space) => space.id === selectedSpaceId,
    ) ?? null
    : null;
  const hasInvalidSpaceSelection =
    selectedSpaceId.length > 0 && selectedSpace === null;
  const selectedSpaceScope = selectedSpace
    ? getDescendantSpaceIds(selectedSpace.id, mockAccessibleSpaces)
    : null;
  const scopedDocuments = hasInvalidSpaceSelection
    ? []
    : selectedSpaceScope
      ? activeDocuments.filter((document) =>
        selectedSpaceScope.has(document.space_id),
      )
      : activeDocuments;
  const directSubspaces = selectedSpace
    ? mockAccessibleSpaces.filter(
      (space) => space.parent_space_id === selectedSpace.id,
    )
    : [];

  const readyDocumentsCount = activeDocuments.filter(
    (document) => document.status === "ready",
  ).length;

  const processingDocumentsCount = activeDocuments.filter(
    (document) =>
      document.status === "uploaded" ||
      document.status === "processing",
  ).length;

  const documentsWithErrorsCount = activeDocuments.filter(
    (document) => document.status === "error",
  ).length;

  const summaryItems = [
    {
      label: "Documentos activos",
      value: activeDocuments.length,
    },
    {
      label: "Listos para consultar",
      value: readyDocumentsCount,
    },
    {
      label: "Procesando",
      value: processingDocumentsCount,
    },
    {
      label: "Con errores",
      value: documentsWithErrorsCount,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-10 pb-8">
      <section className="space-y-10 px-1 pt-1 sm:px-0">
        <div className="max-w-2xl space-y-2">
          <h1 className="text-[clamp(1.625rem,2vw,1.875rem)] font-semibold tracking-tight text-[#152436]">
            Documentos de tu empresa
          </h1>

          <p className="max-w-xl text-[14px] leading-6 text-[#526173] sm:text-[15px]">
            Revisa el estado de tus archivos y encuentra información rápidamente.
          </p>
        </div>

        <section className="overflow-hidden rounded-2xl border border-[#E8EDF3] bg-white px-6 py-7 shadow-[0_1px_2px_rgba(21,36,54,0.04)] sm:px-7 sm:py-8">
          <div className="mx-auto grid w-full max-w-[1040px] grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-y-5 lg:grid-cols-4 lg:gap-y-0 lg:justify-items-center">
            {summaryItems.map((item, index) => (
              <div
                key={item.label}
                className={`flex w-full flex-col items-center justify-center text-center ${index > 0 ? "lg:border-l lg:border-[#E8EDF3]" : ""
                  }`}
              >
                <span className="text-[36px] font-semibold leading-none tracking-tight text-[#152436] sm:text-[40px]">
                  {item.value}
                </span>

                <span className="mt-2 text-[14px] font-semibold text-[#526173] sm:text-[15px]">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {canUploadDocuments(mockWorkspaceSession.user.role) && (
          <div className="flex justify-center pt-2 sm:pt-3">
            <Link
              href="/upload"
              className="inline-flex min-w-[240px] items-center justify-center rounded-xl bg-[#427AC6] px-7 py-3 text-[15px] font-semibold text-white transition hover:bg-[#356AAE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              + Subir documentos
            </Link>
          </div>
        )}
      </section>

      <DocumentLibrary
        documents={scopedDocuments}
        role={mockWorkspaceSession.user.role}
        selectedSpace={selectedSpace}
        directSubspaces={directSubspaces}
        hasInvalidSpaceSelection={hasInvalidSpaceSelection}
      />
    </div>
  );
}
