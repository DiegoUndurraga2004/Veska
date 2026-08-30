import { notFound } from "next/navigation";

import { DocumentDetailView } from "@/components/documents/DocumentDetailView";
import { getMockDocumentDetailById } from "@/mocks/documents.mock";
import { mockWorkspaceSession } from "@/mocks/session.mock";

type DocumentDetailPageProps = {
  params: Promise<{
    documentId: string;
  }>;
};

export default async function DocumentDetailPage({
  params,
}: DocumentDetailPageProps) {
  const { documentId } = await params;
  const document = getMockDocumentDetailById(documentId);

  if (!document) {
    notFound();
  }

  return (
    <DocumentDetailView
      document={document}
      role={mockWorkspaceSession.user.role}
    />
  );
}
