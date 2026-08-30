import {
  DEFAULT_MAX_UPLOAD_FILE_SIZE_BYTES,
  getDocumentFileTypeFromFileName,
} from "@/config/uploads";
import type {
  UploadQueueError,
  UploadQueueItem,
} from "@/types/uploads";

export type UploadDestinationSnapshot = {
  space_id: string;
  relative_path: string | null;
};

function createLocalUploadId() {
  return crypto.randomUUID();
}

function getValidationError(file: File): UploadQueueError | null {
  const fileType = getDocumentFileTypeFromFileName(file.name);

  if (!fileType) {
    return {
      code: "unsupported_extension",
      message:
        "Formato no permitido. Utiliza PDF, DOCX, TXT, XLSX o CSV.",
    };
  }

  if (file.size === 0) {
    return {
      code: "empty_file",
      message: "El archivo está vacío y no puede subirse.",
    };
  }

  if (file.size > DEFAULT_MAX_UPLOAD_FILE_SIZE_BYTES) {
    return {
      code: "file_too_large",
      message: "El archivo supera el límite permitido de 25 MB.",
    };
  }

  return null;
}

export function normalizeRelativePathInput(
  relativePathInput: string,
): {
  relative_path: string | null;
  error: UploadQueueError | null;
} {
  const trimmedRelativePath = relativePathInput.trim();

  if (trimmedRelativePath.length === 0) {
    return {
      relative_path: null,
      error: null,
    };
  }

  const hasAbsolutePrefix = trimmedRelativePath.startsWith("/");
  const hasParentSegments = trimmedRelativePath
    .split("/")
    .some((segment) => segment.trim() === "..");

  if (hasAbsolutePrefix || hasParentSegments) {
    return {
      relative_path: null,
      error: {
        code: "invalid_relative_path",
        message:
          "La ruta relativa no puede comenzar con / ni incluir segmentos ..",
      },
    };
  }

  return {
    relative_path: trimmedRelativePath,
    error: null,
  };
}

export function createUploadQueueItem(
  file: File,
  destination: UploadDestinationSnapshot,
): UploadQueueItem {
  const error = getValidationError(file);

  return {
    local_id: createLocalUploadId(),
    file,
    file_name: file.name,
    file_type: getDocumentFileTypeFromFileName(file.name),
    file_size: file.size,
    space_id: destination.space_id,
    relative_path: destination.relative_path,
    status: error ? "rejected" : "queued",
    progress: 0,
    error,
    document_id: null,
  };
}
