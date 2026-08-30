type DocumentPaginationProps = {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  pageSize: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

export function DocumentPagination({
  currentPage,
  totalPages,
  totalResults,
  pageSize,
  onPreviousPage,
  onNextPage,
}: DocumentPaginationProps) {
  const firstVisibleResult =
    totalResults === 0 ? 0 : (currentPage - 1) * pageSize + 1;

  const lastVisibleResult = Math.min(
    currentPage * pageSize,
    totalResults,
  );

  return (
    <section className="flex flex-col gap-3 border-y border-border py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[13px] text-[#526173]">
        Mostrando{" "}
        <span className="font-semibold text-[#152436]">
          {firstVisibleResult}-{lastVisibleResult}
        </span>{" "}
        de{" "}
        <span className="font-semibold text-[#152436]">
          {totalResults}
        </span>{" "}
        documentos
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPreviousPage}
          disabled={currentPage <= 1}
          className="rounded-lg border border-[#D9E1EA] px-3 py-2 text-[14px] font-semibold text-[#152436] transition hover:bg-[#F1F4F7] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Anterior
        </button>

        <p className="text-[13px] font-medium text-[#526173]">
          Página{" "}
          <span className="font-semibold text-[#152436]">
            {currentPage}
          </span>{" "}
          de{" "}
          <span className="font-semibold text-[#152436]">
            {totalPages}
          </span>
        </p>

        <button
          type="button"
          onClick={onNextPage}
          disabled={currentPage >= totalPages}
          className="rounded-lg border border-[#D9E1EA] px-3 py-2 text-[14px] font-semibold text-[#152436] transition hover:bg-[#F1F4F7] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </section>
  );
}
