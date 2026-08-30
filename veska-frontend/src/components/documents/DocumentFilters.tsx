import type {
  DocumentFileType,
  DocumentStatus,
} from "@/types/documents";

export type DocumentFileTypeFilter = DocumentFileType | "all";
export type DocumentStatusFilter = Exclude<DocumentStatus, "deleted"> | "all";

type DocumentFiltersProps = {
  search: string;
  fileType: DocumentFileTypeFilter;
  status: DocumentStatusFilter;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onFileTypeChange: (value: DocumentFileTypeFilter) => void;
  onStatusChange: (value: DocumentStatusFilter) => void;
  onResetFilters: () => void;
};

export function DocumentFilters({
  search,
  fileType,
  status,
  hasActiveFilters,
  onSearchChange,
  onFileTypeChange,
  onStatusChange,
  onResetFilters,
}: DocumentFiltersProps) {
  return (
    <section className="py-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-5">
        <div className="min-w-0 flex-1">
          <label
            htmlFor="document-search"
            className="sr-only"
          >
            Buscar documentos
          </label>

          <input
            id="document-search"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar documentos..."
            className="h-11 w-full border-0 border-b border-[#D9E1EA] bg-transparent px-0 text-[15px] text-[#152436] outline-none transition placeholder:text-[#7D8A99] focus:border-[#427AC6] focus:ring-0"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-[180px_180px_auto] lg:gap-4">
          <div className="min-w-0">
            <label
              htmlFor="document-file-type"
              className="sr-only"
            >
              Tipo
            </label>

            <select
              id="document-file-type"
              value={fileType}
              onChange={(event) =>
                onFileTypeChange(
                  event.target.value as DocumentFileTypeFilter,
                )
              }
              className="h-11 w-full border-0 border-b border-[#D9E1EA] bg-transparent px-0 text-[15px] text-[#152436] outline-none transition focus:border-[#427AC6] focus:ring-0"
            >
              <option value="all">Todos los tipos</option>
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
              <option value="txt">TXT</option>
              <option value="xlsx">XLSX</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          <div className="min-w-0">
            <label
              htmlFor="document-status"
              className="sr-only"
            >
              Estado
            </label>

            <select
              id="document-status"
              value={status}
              onChange={(event) =>
                onStatusChange(
                  event.target.value as DocumentStatusFilter,
                )
              }
              className="h-11 w-full border-0 border-b border-[#D9E1EA] bg-transparent px-0 text-[15px] text-[#152436] outline-none transition focus:border-[#427AC6] focus:ring-0"
            >
              <option value="all">Todos los estados</option>
              <option value="ready">Listos</option>
              <option value="processing">Procesando</option>
              <option value="uploaded">Subidos</option>
              <option value="error">Con error</option>
            </select>
          </div>

          <button
            type="button"
            onClick={onResetFilters}
            disabled={!hasActiveFilters}
            className="inline-flex h-11 items-center justify-start rounded-lg border border-transparent px-0 text-[14px] font-medium text-[#7D8A99] transition hover:text-[#356AAE] disabled:cursor-not-allowed disabled:text-[#A7B4C3] lg:self-end"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </section>
  );
}
