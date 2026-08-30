import { useMemo, useState, type ReactNode, type RefObject } from "react";

import { AssistantTypingIndicator } from "@/components/chats/AssistantTypingIndicator";
import {
  ChatDocumentsPanel,
  type ChatDocumentUsage,
} from "@/components/chats/ChatDocumentsPanel";
import { MessageBubble } from "@/components/chats/MessageBubble";
import type {
  ChatMessage,
  MessageFeedbackType,
  MessageSource,
} from "@/types/messages";

type ChatWindowProps = {
  messages: ChatMessage[];
  composer: ReactNode;
  isGenerating: boolean;
  regeneratingMessageId: string | null;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  onSelectFeedback: (
    messageId: string,
    feedback: MessageFeedbackType,
  ) => void;
  onRegenerate: (messageId: string) => void;
};

type CitationLookup = {
  source: MessageSource;
  documentId: string;
};

function getDocumentFileName(source: MessageSource) {
  return source.document_name;
}

function buildDocumentUsages(messages: ChatMessage[]) {
  const usageMap = new Map<string, ChatDocumentUsage>();

  messages.forEach((message) => {
    message.sources?.forEach((source) => {
      const existing = usageMap.get(source.document_id);

      if (existing) {
        existing.sources.push(source);
        return;
      }

      usageMap.set(source.document_id, {
        documentId: source.document_id,
        documentName: source.document_name,
        spacePath: source.space_path,
        fileType: getDocumentFileName(source),
        sources: [source],
      });
    });
  });

  return Array.from(usageMap.values());
}

function buildCitationIndex(documents: ChatDocumentUsage[]) {
  const citationIndex = new Map<string, CitationLookup>();

  documents.forEach((document) => {
    document.sources.forEach((source) => {
      citationIndex.set(source.id, {
        source,
        documentId: document.documentId,
      });
    });
  });

  return citationIndex;
}

function EmptyState({
  composer,
}: {
  composer: ReactNode;
}) {
  return (
    <div className="flex flex-1 items-center justify-center pb-6 pt-4">
      <div className="w-full max-w-[920px] space-y-6 text-center">
        <h2 className="text-[clamp(1.5rem,2.2vw,1.9rem)] font-medium leading-tight text-[#152436]">
          ¿Qué buscaremos hoy?
        </h2>

        <div className="mx-auto w-full max-w-[920px]">
          {composer}
        </div>

        <p className="text-sm leading-6 text-[#526173]">
          Buscaremos en todos tus espacios accesibles.
        </p>
      </div>
    </div>
  );
}

export function ChatWindow({
  messages,
  composer,
  isGenerating,
  regeneratingMessageId,
  messagesEndRef,
  onSelectFeedback,
  onRegenerate,
}: ChatWindowProps) {
  const [selectedCitationId, setSelectedCitationId] =
    useState<string | null>(null);
  const [hasManuallyClosedPanel, setHasManuallyClosedPanel] =
    useState(false);

  const documentUsages = useMemo(
    () => buildDocumentUsages(messages),
    [messages],
  );

  const citationIndex = useMemo(
    () => buildCitationIndex(documentUsages),
    [documentUsages],
  );

  const fallbackCitationId =
    documentUsages[0]?.sources[0]?.id ?? null;

  const resolvedSelectedCitationId =
    selectedCitationId &&
    citationIndex.has(selectedCitationId)
      ? selectedCitationId
      : fallbackCitationId;

  const hasDocuments = documentUsages.length > 0;
  const isDocumentsPanelOpen =
    hasDocuments && !hasManuallyClosedPanel;

  function closeDocumentsPanel() {
    setHasManuallyClosedPanel(true);
  }

  function openDocumentsPanel() {
    if (documentUsages.length === 0) {
      return;
    }

    if (!resolvedSelectedCitationId) {
      setSelectedCitationId(fallbackCitationId);
    }

    setHasManuallyClosedPanel(false);
  }

  function viewCitation(source: MessageSource) {
    setSelectedCitationId(source.id);
    setHasManuallyClosedPanel(false);
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-10rem)] w-full max-w-[1600px] gap-6">
      <section className="flex min-w-0 flex-1 flex-col">
        {messages.length === 0 ? (
          <EmptyState composer={composer} />
        ) : (
          <div className="flex min-h-[calc(100dvh-10rem)] flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto pb-6 pr-0">
              <div className="mx-auto flex w-full max-w-[900px] flex-col gap-7">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isRegenerating={
                      message.id === regeneratingMessageId
                    }
                    actionsDisabled={isGenerating}
                    onSelectFeedback={onSelectFeedback}
                    onRegenerate={onRegenerate}
                    onViewCitation={viewCitation}
                  />
                ))}

                {isGenerating &&
                  regeneratingMessageId === null && (
                    <AssistantTypingIndicator />
                  )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="sticky bottom-0 z-20 mt-4 w-full bg-gradient-to-t from-[#F7F9FC] via-[#F7F9FC]/95 to-transparent px-4 pb-4 pt-8 sm:px-6 lg:px-0">
              <div className="mx-auto w-full max-w-[900px] space-y-3">
                {hasDocuments && !isDocumentsPanelOpen && (
                  <div className="flex justify-end">
                    <ChatDocumentsPanel
                      documents={documentUsages}
                      isOpen={false}
                      selectedCitationId={selectedCitationId}
                      onClose={closeDocumentsPanel}
                      onOpen={openDocumentsPanel}
                      onSelectCitation={viewCitation}
                      mode="desktop"
                    />
                  </div>
                )}

                <div className="w-full">{composer}</div>
              </div>
            </div>
          </div>
        )}
      </section>

      {hasDocuments && isDocumentsPanelOpen && (
        <ChatDocumentsPanel
          documents={documentUsages}
          isOpen={true}
          selectedCitationId={resolvedSelectedCitationId}
          onClose={closeDocumentsPanel}
          onOpen={openDocumentsPanel}
          onSelectCitation={viewCitation}
          mode="desktop"
        />
      )}

      {hasDocuments && isDocumentsPanelOpen && (
        <ChatDocumentsPanel
          documents={documentUsages}
          isOpen={true}
          selectedCitationId={resolvedSelectedCitationId}
          onClose={closeDocumentsPanel}
          onOpen={openDocumentsPanel}
          onSelectCitation={viewCitation}
          mode="mobile"
        />
      )}
    </div>
  );
}
