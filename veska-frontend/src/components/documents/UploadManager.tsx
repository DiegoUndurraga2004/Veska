"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { UploadDropzone } from "@/components/documents/UploadDropzone";
import { UploadQueue } from "@/components/documents/UploadQueue";
import { mockUploadableSpaces } from "@/mocks/spaces.mock";
import {
  createUploadQueueItem,
  normalizeRelativePathInput,
} from "@/lib/upload-validation";
import type {
  UploadQueueItem,
  UploadQueueSummary,
} from "@/types/uploads";

const ITEM_STAGGER_DELAY_MS = 250;

type UploadManagerProps = {
  disabled?: boolean;
};

export function UploadManager({
  disabled = false,
}: UploadManagerProps) {
  const [queueItems, setQueueItems] = useState<UploadQueueItem[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState("");
  const [relativePathInput, setRelativePathInput] = useState("");
  const timeoutIdsRef = useRef<Set<number>>(new Set());
  const isStartingUploadRef = useRef(false);

  useEffect(() => {
    const timeoutIds = timeoutIdsRef.current;

    return () => {
      timeoutIds.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });

      timeoutIds.clear();
    };
  }, []);

  const selectedSpace = useMemo(
    () =>
      mockUploadableSpaces.find(
        (space) => space.id === selectedSpaceId,
      ) ?? null,
    [selectedSpaceId],
  );

  const relativePathState = useMemo(
    () => normalizeRelativePathInput(relativePathInput),
    [relativePathInput],
  );

  const destinationReady = Boolean(selectedSpace);
  const canSelectFiles =
    !disabled &&
    destinationReady &&
    relativePathState.error === null;

  const uploadDropzoneReason = disabled
    ? "Tu nivel de acceso no permite subir documentos en esta vista."
    : !destinationReady
      ? "Selecciona un espacio destino para habilitar la subida."
      : relativePathState.error?.message ??
        "El frontend prepara `space_id` y `relative_path`; el backend futuro validará sesión, tenant, permisos y límites.";

  const summary = useMemo(
    () =>
      queueItems.reduce<UploadQueueSummary>(
        (currentSummary, item) => ({
          ...currentSummary,
          total: currentSummary.total + 1,
          [item.status]: currentSummary[item.status] + 1,
        }),
        {
          total: 0,
          queued: 0,
          uploading: 0,
          uploaded: 0,
          processing: 0,
          ready: 0,
          rejected: 0,
          error: 0,
        },
      ),
    [queueItems],
  );

  const hasActiveUploads =
    summary.uploading > 0 ||
    summary.uploaded > 0 ||
    summary.processing > 0;

  const canStartUpload =
    summary.queued > 0 &&
    !hasActiveUploads &&
    !disabled;

  const canClearSettledItems =
    summary.ready > 0 ||
    summary.rejected > 0 ||
    summary.error > 0;

  function scheduleTimeout(
    callback: () => void,
    delayMs: number,
  ) {
    const timeoutId = window.setTimeout(() => {
      timeoutIdsRef.current.delete(timeoutId);
      callback();
    }, delayMs);

    timeoutIdsRef.current.add(timeoutId);
  }

  function updateQueueItem(
    localId: string,
    updates: Partial<UploadQueueItem>,
  ) {
    setQueueItems((currentItems) =>
      currentItems.map((item) =>
        item.local_id === localId
          ? {
              ...item,
              ...updates,
            }
          : item,
      ),
    );
  }

  function addFiles(files: File[]) {
    if (!canSelectFiles) {
      return;
    }

    // El frontend congela `space_id` y `relative_path` por archivo; el backend futuro validará acceso y límites.
    const newItems = files.map((file) =>
      createUploadQueueItem(file, {
        space_id: selectedSpaceId,
        relative_path: relativePathState.relative_path,
      }),
    );

    setQueueItems((currentItems) => [
      ...currentItems,
      ...newItems,
    ]);
  }

  function removeItem(localId: string) {
    setQueueItems((currentItems) =>
      currentItems.filter((item) => item.local_id !== localId),
    );
  }

  function clearSettledItems() {
    setQueueItems((currentItems) =>
      currentItems.filter(
        (item) =>
          item.status !== "ready" &&
          item.status !== "rejected" &&
          item.status !== "error",
      ),
    );
  }

  function simulateUpload(
    item: UploadQueueItem,
    itemIndex: number,
  ) {
    const offset = itemIndex * ITEM_STAGGER_DELAY_MS;

    scheduleTimeout(() => {
      updateQueueItem(item.local_id, {
        status: "uploading",
        progress: 20,
      });
    }, offset + 250);

    scheduleTimeout(() => {
      updateQueueItem(item.local_id, {
        progress: 55,
      });
    }, offset + 650);

    scheduleTimeout(() => {
      updateQueueItem(item.local_id, {
        progress: 85,
      });
    }, offset + 1050);

    scheduleTimeout(() => {
      updateQueueItem(item.local_id, {
        progress: 100,
      });
    }, offset + 1350);

    scheduleTimeout(() => {
      updateQueueItem(item.local_id, {
        status: "uploaded",
        progress: 100,
      });
    }, offset + 1550);

    scheduleTimeout(() => {
      updateQueueItem(item.local_id, {
        status: "processing",
      });
    }, offset + 2050);

    scheduleTimeout(() => {
      updateQueueItem(item.local_id, {
        status: "ready",
      });
    }, offset + 3550);
  }

  function startUpload() {
    if (
      disabled ||
      isStartingUploadRef.current ||
      hasActiveUploads
    ) {
      return;
    }

    const queuedItems = queueItems.filter(
      (item) => item.status === "queued",
    );

    if (queuedItems.length === 0) {
      return;
    }

    isStartingUploadRef.current = true;

    queuedItems.forEach((item, itemIndex) => {
      simulateUpload(item, itemIndex);
    });

    const finalDelay =
      (queuedItems.length - 1) * ITEM_STAGGER_DELAY_MS + 3650;

    scheduleTimeout(() => {
      isStartingUploadRef.current = false;
    }, finalDelay);
  }

  function handleSpaceChange(value: string) {
    setSelectedSpaceId(value);
  }

  function handleRelativePathChange(value: string) {
    setRelativePathInput(value);
  }

  function handleRelativePathBlur() {
    setRelativePathInput((currentValue) => currentValue.trim());
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6 min-w-0">
        <section className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
            <div className="space-y-2">
              <label
                htmlFor="upload-space-selector"
                className="block text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7D8A99]"
              >
                Espacio destino
              </label>

              <select
                id="upload-space-selector"
                value={selectedSpaceId}
                onChange={(event) => handleSpaceChange(event.target.value)}
                disabled={disabled}
                className="w-full rounded-xl border border-[#D9E1EA] bg-white px-3 py-3 text-sm text-[#152436] outline-none transition placeholder:text-[#7D8A99] focus:border-[#427AC6] focus:ring-2 focus:ring-[#427AC6]/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">
                  Selecciona un espacio accesible
                </option>

                {mockUploadableSpaces.map((space) => (
                  <option key={space.id} value={space.id}>
                    {space.path.split("/").join(" / ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="upload-relative-path"
                className="block text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7D8A99]"
              >
                Ruta relativa opcional
              </label>

              <input
                id="upload-relative-path"
                type="text"
                value={relativePathInput}
                onChange={(event) =>
                  handleRelativePathChange(event.target.value)
                }
                onBlur={handleRelativePathBlur}
                placeholder="Edificios/Centro/2026"
                disabled={disabled}
                className={`w-full rounded-xl border bg-white px-3 py-3 text-sm text-[#152436] outline-none transition placeholder:text-[#7D8A99] focus:border-[#427AC6] focus:ring-2 focus:ring-[#427AC6]/15 disabled:cursor-not-allowed disabled:opacity-60 ${
                  relativePathState.error
                    ? "border-[#E07A7A]"
                    : "border-[#D9E1EA]"
                }`}
              />
            </div>
          </div>

          <p className="text-xs leading-5 text-[#526173]">
            La ruta es opcional y se guarda dentro del espacio seleccionado.
          </p>

          {!destinationReady && (
            <p className="text-xs leading-5 text-[#152436]">
              Selecciona un espacio para habilitar la zona de carga.
            </p>
          )}

          {relativePathState.error && (
            <p className="text-xs leading-5 text-[#C1121F]">
              {relativePathState.error.message}
            </p>
          )}
        </section>

        <UploadDropzone
          disabled={!canSelectFiles}
          disabledReason={uploadDropzoneReason}
          onFilesSelected={addFiles}
        />
      </div>

      <div className="min-w-0 xl:pt-1">
        <UploadQueue
          items={queueItems}
          canStartUpload={canStartUpload}
          canClearSettledItems={canClearSettledItems}
          onStartUpload={startUpload}
          onRemoveItem={removeItem}
          onClearSettledItems={clearSettledItems}
          spaces={mockUploadableSpaces}
        />
      </div>
    </div>
  );
}
