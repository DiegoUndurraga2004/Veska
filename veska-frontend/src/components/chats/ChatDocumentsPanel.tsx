"use client";

import type { MessageSource } from "@/types/messages";

import {
  ChatPanelCloseIcon,
  ChatPanelOpenIcon,
} from "@/components/icons/ChatIcons";

export type ChatDocumentUsage = {
  documentId: string;
  documentName: string;
  spacePath: string;
  fileType: string;
  sources: MessageSource[];
};

type ChatDocumentsPanelProps = {
  documents: ChatDocumentUsage[];
  isOpen: boolean;
  selectedCitationId: string | null;
  onClose: () => void;
  onOpen: () => void;
  onSelectCitation: (source: MessageSource) => void;
  mode?: "desktop" | "mobile";
};

function getFileTypeLabel(fileName: string) {
  return fileName
    .split(".")
    .pop()
    ?.toLocaleUpperCase("es-CL") ?? "DOC";
}

function getSourceLocation(source: MessageSource) {
  if (source.page_number !== null) {
    return `Página ${source.page_number}`;
  }

  if (source.sheet_name && source.cell_range) {
    return `Hoja: ${source.sheet_name} · ${source.cell_range}`;
  }

  if (source.sheet_name) {
    return `Hoja: ${source.sheet_name}`;
  }

  if (source.cell_range) {
    return source.cell_range;
  }

  return "Ubicación no disponible";
}

function CitationSnippet({
  source,
  active,
  onSelectCitation,
}: {
  source: MessageSource;
  active: boolean;
  onSelectCitation: (source: MessageSource) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelectCitation(source)}
      className={`w-full rounded-2xl border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F9FC] ${
        active
          ? "border-[#D8E6F8] bg-white"
          : "border-transparent bg-[#F7F9FC] hover:border-[#E8EDF3] hover:bg-white"
      }`}
    >
      <p className="text-xs font-medium text-[#526173]">
        {getSourceLocation(source)}
      </p>

      <blockquote className="mt-2 text-sm leading-6 text-[#526173]">
        “{source.snippet}”
      </blockquote>
    </button>
  );
}

function PanelBody({
  documents,
  selectedCitationId,
  onSelectCitation,
}: Pick<
  ChatDocumentsPanelProps,
  "documents" | "selectedCitationId" | "onSelectCitation"
>) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
      <div className="space-y-2">
        {documents.map((document) => {
          const selectedSource =
            document.sources.find(
              (source) => source.id === selectedCitationId,
            ) ?? document.sources[0];
          const isSelected =
            selectedSource?.id === selectedCitationId;

          return (
            <section
              key={document.documentId}
              className={`rounded-3xl border p-3 transition ${
                isSelected
                  ? "border-[#D8E6F8] bg-[#F7F9FC]"
                  : "border-[#E8EDF3] bg-white hover:bg-[#F7F9FC]"
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  selectedSource &&
                  onSelectCitation(selectedSource)
                }
                className="flex w-full items-start justify-between gap-3 rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#152436]">
                    {document.documentName}
                  </p>

                  <p className="mt-1 truncate text-xs text-[#526173]">
                    {document.spacePath}
                  </p>
                </div>

                <span className="shrink-0 rounded-full border border-[#E8EDF3] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#526173]">
                  {getFileTypeLabel(document.fileType)}
                </span>
              </button>

              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs text-[#7D8A99]">
                  {document.sources.length}{" "}
                  {document.sources.length === 1 ? "cita" : "citas"}
                </p>

                {selectedSource && (
                  <button
                    type="button"
                    onClick={() => onSelectCitation(selectedSource)}
                    className="text-xs font-semibold text-[#427AC6] transition hover:text-[#356AAE]"
                  >
                    Ver fragmento
                  </button>
                )}
              </div>

              {isSelected && selectedSource && (
                <div className="mt-3 space-y-2">
                  {document.sources.map((source) => (
                    <CitationSnippet
                      key={source.id}
                      source={source}
                      active={source.id === selectedCitationId}
                      onSelectCitation={onSelectCitation}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

export function ChatDocumentsPanel({
  documents,
  isOpen,
  selectedCitationId,
  onClose,
  onOpen,
  onSelectCitation,
  mode = "desktop",
}: ChatDocumentsPanelProps) {
  if (documents.length === 0) {
    return null;
  }

  if (!isOpen) {
    return mode === "mobile" ? (
      <button
        type="button"
        onClick={onOpen}
        className="inline-flex w-full items-center justify-between rounded-2xl border border-[#D9E1EA] bg-white px-4 py-3 text-sm font-semibold text-[#152436] shadow-[0_1px_2px_rgba(21,36,54,0.04)] transition hover:border-[#C9D6E6] hover:bg-[#F7F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <span className="flex items-center gap-2">
          <span>Documentos usados</span>
          <span className="rounded-full bg-[#F1F4F7] px-2 py-0.5 text-[11px] font-semibold text-[#526173]">
            {documents.length}
          </span>
        </span>
        <ChatPanelOpenIcon className="h-[18px] w-[18px] text-[#526173]" />
      </button>
    ) : (
      <button
        type="button"
        onClick={onOpen}
        title="Abrir documentos usados"
        aria-label="Abrir documentos usados"
        className="inline-flex h-10 items-center gap-2 rounded-full border border-[#D9E1EA] bg-white px-3 text-sm font-semibold text-[#152436] shadow-[0_1px_2px_rgba(21,36,54,0.04)] transition hover:border-[#C9D6E6] hover:bg-[#F7F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <ChatPanelOpenIcon className="h-[18px] w-[18px] text-[#526173]" />
        <span>Documentos usados</span>
        <span className="rounded-full bg-[#F1F4F7] px-2 py-0.5 text-[11px] font-semibold text-[#526173]">
          {documents.length}
        </span>
      </button>
    );
  }

  if (mode === "mobile") {
    return (
      <div className="fixed inset-0 z-40 flex items-end bg-[#152436]/35 px-3 pb-3 pt-16 xl:hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 cursor-default bg-transparent"
          onClick={onClose}
        />

        <section className="relative z-10 flex max-h-[78vh] w-full flex-col overflow-hidden rounded-[28px] border border-[#E8EDF3] bg-white shadow-[0_18px_50px_rgba(21,36,54,0.16)]">
          <header className="flex items-center justify-between border-b border-[#E8EDF3] px-4 py-4">
            <div>
              <p className="text-sm font-semibold text-[#152436]">
                Documentos usados
              </p>

              <p className="mt-1 text-xs text-[#526173]">
                {documents.length}{" "}
                {documents.length === 1 ? "documento" : "documentos"}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar documentos usados"
              title="Cerrar documentos usados"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#526173] transition hover:bg-[#F7F9FC] hover:text-[#152436] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <ChatPanelCloseIcon className="h-[18px] w-[18px]" />
            </button>
          </header>

          <PanelBody
            documents={documents}
            selectedCitationId={selectedCitationId}
            onSelectCitation={onSelectCitation}
          />
        </section>
      </div>
    );
  }

  return (
    <aside className="hidden min-h-0 w-[320px] shrink-0 xl:flex xl:flex-col">
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-[#E8EDF3] bg-white">
        <header className="flex items-center justify-between border-b border-[#E8EDF3] px-4 py-4">
          <div>
            <p className="text-sm font-semibold text-[#152436]">
              Documentos usados
            </p>

            <p className="mt-1 text-xs text-[#526173]">
              {documents.length}{" "}
              {documents.length === 1 ? "documento" : "documentos"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Plegar documentos usados"
            title="Plegar documentos usados"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#526173] transition hover:bg-[#F7F9FC] hover:text-[#152436] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <ChatPanelCloseIcon className="h-[18px] w-[18px]" />
          </button>
        </header>

        <PanelBody
          documents={documents}
          selectedCitationId={selectedCitationId}
          onSelectCitation={onSelectCitation}
        />
      </section>
    </aside>
  );
}
