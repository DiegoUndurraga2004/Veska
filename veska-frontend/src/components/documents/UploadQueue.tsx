"use client";

import { UploadQueueStatusBadge } from "@/components/documents/UploadQueueStatusBadge";
import { formatFileSize } from "@/lib/formatters";
import type { Space } from "@/types/spaces";
import type {
  UploadQueueItem,
  UploadQueueStatus,
} from "@/types/uploads";

type UploadQueueProps = {
  items: UploadQueueItem[];
  canStartUpload: boolean;
  canClearSettledItems: boolean;
  onStartUpload: () => void;
  onRemoveItem: (localId: string) => void;
  onClearSettledItems: () => void;
  spaces: Space[];
};

function canRemoveItem(status: UploadQueueStatus) {
  return status === "queued" || status === "rejected";
}

function formatSpacePathLabel(path: string) {
  return path.split("/").join(" / ");
}

function getSpaceLabel(item: UploadQueueItem, spaces: Space[]) {
  const space = spaces.find(
    (currentSpace) => currentSpace.id === item.space_id,
  );

  if (!space) {
    return "Espacio no definido";
  }

  return formatSpacePathLabel(space.path);
}

function getStatusDescription(item: UploadQueueItem) {
  if (item.status === "queued") {
    return "Archivo validado visualmente. Listo para comenzar la subida.";
  }

  if (item.status === "rejected") {
    return item.error?.message ?? "El archivo no cumple los requisitos.";
  }

  if (item.status === "uploading") {
    return `Transfiriendo archivo: ${item.progress}%`;
  }

  if (item.status === "uploaded") {
    return "Archivo recibido. Preparando procesamiento.";
  }

  if (item.status === "processing") {
    return "Extrayendo contenido y preparando fuentes para consultas.";
  }

  if (item.status === "ready") {
    return "Documento listo para utilizarse como fuente en chats.";
  }

  return (
    item.error?.message ??
    "No pudimos procesar este documento. Intenta nuevamente."
  );
}

export function UploadQueue({
  items,
  canStartUpload,
  canClearSettledItems,
  onStartUpload,
  onRemoveItem,
  onClearSettledItems,
  spaces,
}: UploadQueueProps) {
  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#E8EDF3] bg-white xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)]">
      <div className="shrink-0 border-b border-[#E8EDF3] px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-[#152436]">
              Cola de subida
            </h2>

            <p className="mt-1 text-sm leading-5 text-[#526173]">
              Revisa los archivos antes de iniciar la carga.
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-sm font-semibold text-[#152436]">
              {items.length > 0 ? `${items.length} archivos` : "0 archivos"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <button
            type="button"
            onClick={onStartUpload}
            disabled={!canStartUpload}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#427AC6] px-4 text-sm font-semibold text-white transition hover:bg-[#356AAE] disabled:cursor-not-allowed disabled:bg-[#D9E1EA] disabled:text-[#7D8A99]"
          >
            Iniciar subida
          </button>

          <button
            type="button"
            onClick={onClearSettledItems}
            disabled={!canClearSettledItems}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[#D9E1EA] px-4 text-sm font-semibold text-[#152436] transition hover:bg-[#F7F9FC] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Limpiar terminados
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="px-5 py-8">
            <p className="text-sm font-semibold text-[#152436]">
              Todavía no has agregado archivos
            </p>

            <p className="mt-2 text-sm leading-6 text-[#526173]">
              Selecciona o arrastra documentos para revisar la cola antes de
              iniciar la subida.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8EDF3]">
            {items.map((item) => (
              <article key={item.local_id} className="px-5 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold text-[#152436]">
                      {item.file_name}
                    </p>

                    <p className="mt-1 text-xs text-[#526173]">
                      {item.file_type?.toUpperCase() ?? "FORMATO DESCONOCIDO"}{" "}
                      · {formatFileSize(item.file_size)}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-[#526173]">
                      {getStatusDescription(item)}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-[#526173]">
                      Destino: {getSpaceLabel(item, spaces)}
                    </p>

                    <p className="text-xs leading-5 text-[#526173]">
                      Ruta: {item.relative_path ?? "raíz del espacio"}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <UploadQueueStatusBadge status={item.status} />

                    {canRemoveItem(item.status) && (
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.local_id)}
                        className="text-sm font-semibold text-[#526173] transition hover:text-[#152436]"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                </div>

                {item.status === "uploading" && (
                  <div className="mt-4">
                    <div className="h-2 overflow-hidden rounded-full bg-[#E8EDF3]">
                      <div
                        role="progressbar"
                        aria-label={`Progreso de subida de ${item.file_name}`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={item.progress}
                        className="h-full rounded-full bg-[#427AC6] transition-all"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
