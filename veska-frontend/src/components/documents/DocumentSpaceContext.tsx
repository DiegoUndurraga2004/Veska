import Link from "next/link";

import type { Space } from "@/types/spaces";

type DocumentSpaceContextProps = {
  selectedSpace: Space | null;
  directSubspaces: Space[];
  visibleDocumentsCount: number;
  hasInvalidSpaceSelection: boolean;
};

export function DocumentSpaceContext({
  selectedSpace,
  directSubspaces,
  visibleDocumentsCount,
  hasInvalidSpaceSelection,
}: DocumentSpaceContextProps) {
  if (!selectedSpace && !hasInvalidSpaceSelection) {
    return null;
  }

  if (hasInvalidSpaceSelection) {
    return (
      <section className="border-y border-rose-200 bg-rose-50/60 px-5 py-4 text-rose-950">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Espacio no disponible</p>

            <p className="mt-1 text-sm leading-5 text-rose-900/80">
              El enlace apunta a un espacio que no existe en los mocks
              accesibles de esta biblioteca.
            </p>
          </div>

          <Link
            href="/documents"
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-900 transition hover:bg-rose-100"
          >
            Volver a /documents
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="border-y border-border py-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#526173]">
              Espacio seleccionado
            </p>

            <h2 className="mt-2 text-[16px] font-semibold text-[#152436]">
              {selectedSpace?.name}
            </h2>

            <p
              className="mt-1 truncate text-[13px] text-[#526173]"
              title={selectedSpace?.path}
            >
              {selectedSpace?.path}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <p className="text-[13px] font-medium text-[#526173]">
              {visibleDocumentsCount} documentos visibles
            </p>

            <Link
              href="/documents"
              className="text-[13px] font-semibold text-[#427AC6] transition hover:text-[#356AAE]"
            >
              Limpiar filtro
            </Link>
          </div>
        </div>

        {directSubspaces.length > 0 && (
          <div className="border-t border-border pt-4">
            <p className="text-[13px] font-semibold text-[#152436]">
              Subespacios
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {directSubspaces.map((subspace) => (
                <Link
                  key={subspace.id}
                  href={`/documents?space=${subspace.id}`}
                  className="inline-flex max-w-full items-center rounded-full border border-[#D9E1EA] bg-white px-3 py-1.5 text-[13px] font-medium text-[#152436] transition hover:border-[#427AC6] hover:text-[#427AC6]"
                  title={subspace.path}
                >
                  <span className="truncate">{subspace.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
