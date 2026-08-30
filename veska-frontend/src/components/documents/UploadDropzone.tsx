"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

import {
  SUPPORTED_UPLOAD_FORMATS,
  UPLOAD_INPUT_ACCEPT,
} from "@/config/uploads";
import { UploadTrayIcon } from "@/components/icons/UploadIcons";

type UploadDropzoneProps = {
  disabled?: boolean;
  disabledReason?: string;
  onFilesSelected: (files: File[]) => void;
};

export function UploadDropzone({
  disabled = false,
  disabledReason,
  onFilesSelected,
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragDepthRef = useRef(0);

  function submitFiles(files: File[]) {
    if (disabled || files.length === 0) {
      return;
    }

    onFilesSelected(files);
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(event.currentTarget.files ?? []);

    submitFiles(files);

    event.currentTarget.value = "";
  }

  function handleDragEnter(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (disabled) {
      return;
    }

    dragDepthRef.current += 1;
    setIsDragging(true);
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();

    event.dataTransfer.dropEffect = disabled ? "none" : "copy";
  }

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (disabled) {
      return;
    }

    dragDepthRef.current = Math.max(
      0,
      dragDepthRef.current - 1,
    );

    if (dragDepthRef.current === 0) {
      setIsDragging(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();

    dragDepthRef.current = 0;
    setIsDragging(false);

    if (disabled) {
      return;
    }

    submitFiles(Array.from(event.dataTransfer.files));
  }

  return (
    <section
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-[18px] border-2 border-dashed px-6 py-10 transition sm:px-8 sm:py-14 ${
        isDragging
          ? "border-brand bg-brand-soft"
          : "border-[#D9E1EA] bg-white"
      } ${disabled ? "bg-[#F7F9FC] opacity-65" : ""}`}
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${
            disabled
              ? "border-[#E8EDF3] bg-[#F7F9FC] text-[#7D8A99]"
              : "border-[#D9E1EA] bg-[#F1F4F7] text-[#427AC6]"
          }`}
        >
          <UploadTrayIcon className="h-6 w-6" />
        </div>

        <p className="mt-4 text-[18px] font-semibold leading-7 text-[#152436] sm:text-[20px]">
          {isDragging
            ? "Suelta los archivos aquí"
            : disabled
              ? "Selecciona un espacio destino para habilitar la subida"
              : "Arrastra archivos aquí"}
        </p>

        <p className="mt-2 text-sm leading-6 text-[#526173]">
          {disabled
            ? "Después podrás arrastrar o seleccionar varios archivos."
            : "o selecciónalos desde tu computador."}
        </p>

        {disabledReason && (
          <div className="mx-auto mt-4 max-w-xl rounded-xl border border-[#D9E1EA] bg-[#F7F9FC] px-4 py-3 text-left text-sm leading-6 text-[#526173]">
            {disabledReason}
          </div>
        )}

        <input
          id="document-upload-input"
          type="file"
          accept={UPLOAD_INPUT_ACCEPT}
          multiple
          disabled={disabled}
          onChange={handleInputChange}
          className="sr-only"
        />

        <label
          htmlFor="document-upload-input"
          className={`mt-6 inline-flex h-12 items-center justify-center rounded-xl px-4 text-sm font-semibold transition ${
            disabled
              ? "cursor-not-allowed bg-[#D9E1EA] text-white/80"
              : "cursor-pointer bg-[#427AC6] text-white hover:bg-[#356AAE]"
          }`}
        >
          {disabled
            ? "Subida deshabilitada"
            : "Seleccionar archivos"}
        </label>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {SUPPORTED_UPLOAD_FORMATS.map((format) => (
            <span
              key={format.fileType}
              className="rounded-full border border-[#E8EDF3] bg-[#F1F4F7] px-3 py-1 text-xs font-semibold text-[#526173]"
            >
              {format.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
