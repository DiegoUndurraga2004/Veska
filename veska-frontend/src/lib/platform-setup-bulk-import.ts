import {
  getDocumentFileTypeFromFileName,
  SUPPORTED_UPLOAD_FORMATS,
} from "@/config/uploads";
import { createPlatformSetupLocalId } from "@/lib/platform-setup-csv";
import type {
  PlatformSetupBulkImportDraft,
  PlatformSetupBulkImportFile,
  PlatformSetupBulkImportSource,
  PlatformSetupSuggestedSpace,
} from "@/types/platform-setup";

export const PLATFORM_SETUP_BULK_IMPORT_MAX_FILES = 500;
export const PLATFORM_SETUP_BULK_IMPORT_MAX_TOTAL_SIZE_BYTES =
  250 * 1024 * 1024;
export const PLATFORM_SETUP_BULK_IMPORT_MAX_DEPTH = 12;
export const PLATFORM_SETUP_BULK_IMPORT_MAX_RELATIVE_PATH_LENGTH = 500;

const allowedDocumentExtensions = new Set(
  SUPPORTED_UPLOAD_FORMATS.map((format) =>
    format.extension.slice(1).toLowerCase(),
  ),
);

type PlatformSetupBulkImportManifestEntry = {
  name: string;
  relative_path: string;
  size: number;
};

type PlatformSetupBulkImportFileError =
  | "unsupported_extension"
  | "empty_file"
  | "file_too_large"
  | "max_files_reached"
  | "path_too_long"
  | "invalid_relative_path"
  | "too_deep";

function createBulkImportFileError(
  code: PlatformSetupBulkImportFileError,
): string {
  switch (code) {
    case "unsupported_extension":
      return "Formato no permitido. Usa PDF, DOCX, TXT, XLSX o CSV.";
    case "empty_file":
      return "El archivo está vacío y no puede importarse.";
    case "file_too_large":
      return "El archivo supera el límite local de tamaño.";
    case "max_files_reached":
      return `Se superó el máximo local de ${PLATFORM_SETUP_BULK_IMPORT_MAX_FILES} archivos.`;
    case "path_too_long":
      return `La ruta relativa supera el máximo de ${PLATFORM_SETUP_BULK_IMPORT_MAX_RELATIVE_PATH_LENGTH} caracteres.`;
    case "invalid_relative_path":
      return "La ruta relativa no puede comenzar con / ni incluir segmentos ..";
    case "too_deep":
      return `La ruta supera el máximo local de ${PLATFORM_SETUP_BULK_IMPORT_MAX_DEPTH} segmentos.`;
  }
}

function normalizeFileNameExtension(fileName: string) {
  const trimmedName = fileName.trim();
  const lastDotIndex = trimmedName.lastIndexOf(".");

  if (lastDotIndex <= 0) {
    return "";
  }

  return trimmedName.slice(lastDotIndex + 1).toLowerCase();
}

function normalizeRelativePath(relativePath: string) {
  const trimmedPath = relativePath.trim().replace(/\\/g, "/");

  if (trimmedPath.length === 0) {
    return {
      relative_path: "",
      error: createBulkImportFileError("invalid_relative_path"),
    };
  }

  if (trimmedPath.startsWith("/")) {
    return {
      relative_path: "",
      error: createBulkImportFileError("invalid_relative_path"),
    };
  }

  if (trimmedPath.length > PLATFORM_SETUP_BULK_IMPORT_MAX_RELATIVE_PATH_LENGTH) {
    return {
      relative_path: trimmedPath,
      error: createBulkImportFileError("path_too_long"),
    };
  }

  const segments = trimmedPath
    .split("/")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  if (
    segments.length === 0 ||
    segments.some((segment) => segment === "..")
  ) {
    return {
      relative_path: "",
      error: createBulkImportFileError("invalid_relative_path"),
    };
  }

  if (segments.length > PLATFORM_SETUP_BULK_IMPORT_MAX_DEPTH) {
    return {
      relative_path: segments.join("/"),
      error: createBulkImportFileError("too_deep"),
    };
  }

  return {
    relative_path: segments.join("/"),
    error: null,
  };
}

function buildFileValidationErrorMessage(
  fileName: string,
  relativePath: string,
  size: number,
  runningTotalSize: number,
  runningProcessedCount: number,
): string | null {
  const fileType = getDocumentFileTypeFromFileName(fileName);
  const extension = normalizeFileNameExtension(fileName);
  const pathCheck = normalizeRelativePath(relativePath);

  if (runningProcessedCount >= PLATFORM_SETUP_BULK_IMPORT_MAX_FILES) {
    return createBulkImportFileError("max_files_reached");
  }

  if (size === 0) {
    return createBulkImportFileError("empty_file");
  }

  if (fileType === null || !allowedDocumentExtensions.has(extension)) {
    return createBulkImportFileError("unsupported_extension");
  }

  if (pathCheck.error) {
    return pathCheck.error;
  }

  if (runningTotalSize + size > PLATFORM_SETUP_BULK_IMPORT_MAX_TOTAL_SIZE_BYTES) {
    return createBulkImportFileError("file_too_large");
  }

  return null;
}

function buildBulkImportFile(
  entry: PlatformSetupBulkImportManifestEntry,
  runningState: {
    processedCount: number;
    validCount: number;
    totalSize: number;
  },
): PlatformSetupBulkImportFile {
  const normalizedPath = normalizeRelativePath(entry.relative_path);
  const validationError = buildFileValidationErrorMessage(
    entry.name,
    normalizedPath.relative_path || entry.relative_path,
    entry.size,
    runningState.totalSize,
    runningState.processedCount,
  );
  const extension = normalizeFileNameExtension(entry.name);
  const status = validationError ? "error" : "valid";

  runningState.processedCount += 1;

  if (!validationError) {
    runningState.validCount += 1;
    runningState.totalSize += entry.size;
  }

  return {
    id: createPlatformSetupLocalId("bulk-import-file"),
    name: entry.name.trim(),
    relative_path: normalizedPath.relative_path || entry.relative_path.trim(),
    size: entry.size,
    extension,
    status,
    error: validationError,
  };
}

function normalizePathKey(path: string) {
  return path.trim().toLowerCase();
}

export function createPlatformSetupBulkImportEntriesFromFiles(
  files: File[],
): PlatformSetupBulkImportManifestEntry[] {
  return files.map((file) => ({
    name: file.name,
    relative_path: file.webkitRelativePath?.trim().length
      ? file.webkitRelativePath
      : file.name,
    size: file.size,
  }));
}

export function createPlatformSetupBulkImportDemoEntries(): PlatformSetupBulkImportManifestEntry[] {
  return [
    {
      name: "Gastos comunes consolidado 2026.xlsx",
      relative_path: "Finanzas/Gastos comunes consolidado 2026.xlsx",
      size: 184_320,
    },
    {
      name: "Contrato administración Edificio Centro.pdf",
      relative_path:
        "Legal/Contratos/Contrato administración Edificio Centro.pdf",
      size: 263_144,
    },
    {
      name: "Directorio proveedores activos.csv",
      relative_path: "Operaciones/Directorio proveedores activos.csv",
      size: 28_184,
    },
    {
      name: "Informe avance mayo.docx",
      relative_path: "Proyectos/Proyecto A/Informe avance mayo.docx",
      size: 92_156,
    },
    {
      name: "Presupuesto interno.xlsx",
      relative_path:
        "Proyectos/Proyecto B Confidencial/Presupuesto interno.xlsx",
      size: 240_448,
    },
    {
      name: "Acta reunión comité abril 2026.docx",
      relative_path: "General/Acta reunión comité abril 2026.docx",
      size: 64_832,
    },
  ];
}

export function buildPlatformSetupBulkImportDraft(
  entries: PlatformSetupBulkImportManifestEntry[],
  source: PlatformSetupBulkImportSource | null,
  zipFileName: string | null = null,
): PlatformSetupBulkImportDraft {
  const runningState = {
    processedCount: 0,
    validCount: 0,
    totalSize: 0,
  };

  const files = entries.map((entry) =>
    buildBulkImportFile(entry, runningState),
  );

  return {
    source,
    zip_file_name: zipFileName,
    files,
    total_size: entries.reduce((total, entry) => total + entry.size, 0),
  };
}

function getSpacePathParent(path: string) {
  const segments = path.split("/").filter((segment) => segment.length > 0);

  if (segments.length <= 1) {
    return null;
  }

  return segments.slice(0, -1).join("/");
}

export function buildPlatformSetupSuggestedSpaces(
  files: PlatformSetupBulkImportFile[],
): PlatformSetupSuggestedSpace[] {
  const nodeMap = new Map<
    string,
    {
      name: string;
      path: string;
      depth: number;
      files_count: number;
      parent_key: string | null;
    }
  >();

  const ensureNode = (path: string) => {
    const key = normalizePathKey(path);

    if (nodeMap.has(key)) {
      return nodeMap.get(key)!;
    }

    const segments = path.split("/").filter((segment) => segment.length > 0);
    const name = segments.at(-1) ?? path;
    const parentPath = getSpacePathParent(path);

    const node = {
      name,
      path,
      depth: segments.length,
      files_count: 0,
      parent_key: parentPath ? normalizePathKey(parentPath) : null,
    };

    nodeMap.set(key, node);
    return node;
  };

  files.forEach((file) => {
    const normalizedPath = file.relative_path.replace(/\\/g, "/");
    const pathSegments = normalizedPath.split("/").filter(Boolean);
    const folderSegments =
      pathSegments.length > 1 ? pathSegments.slice(0, -1) : [];

    if (folderSegments.length === 0) {
      ensureNode("General").files_count += 1;
      return;
    }

    folderSegments.forEach((_, index) => {
      const folderPath = folderSegments.slice(0, index + 1).join("/");
      ensureNode(folderPath).files_count += 1;
    });
  });

  const orderedNodes = Array.from(nodeMap.values()).sort((left, right) =>
    left.path.localeCompare(right.path, "es", {
      numeric: true,
      sensitivity: "base",
    }),
  );

  const pathToId = new Map<string, string>();

  return orderedNodes.map((node) => {
    const id = createPlatformSetupLocalId("suggested-space");
    pathToId.set(normalizePathKey(node.path), id);

    return {
      id,
      name: node.name,
      path: node.path,
      parent_id: node.parent_key ? pathToId.get(node.parent_key) ?? null : null,
      enabled: true,
      files_count: node.files_count,
    };
  });
}

export function validatePlatformSetupSuggestedSpaces(
  spaces: PlatformSetupSuggestedSpace[],
  validFiles: PlatformSetupBulkImportFile[],
): {
  by_id: Record<string, { name: string | null; path: string | null }>;
  has_errors: boolean;
  enabled_count: number;
  files_without_enabled_space: number;
} {
  const byId: Record<string, { name: string | null; path: string | null }> = {};
  const pathToSpace = new Map<string, PlatformSetupSuggestedSpace>();
  const normalizedPathCounts = new Map<string, number>();
  const enabledSpaces = spaces.filter((space) => space.enabled);

  spaces.forEach((space) => {
    const normalizedPath = normalizePathKey(space.path);
    const parentSpace =
      space.parent_id == null
        ? null
        : spaces.find((candidate) => candidate.id === space.parent_id) ?? null;

    if (normalizedPath.length === 0) {
      byId[space.id] = {
        name: "El nombre del espacio es obligatorio.",
        path: "La ruta visible es obligatoria.",
      };
      return;
    }

    if (space.name.trim().length === 0) {
      byId[space.id] = {
        name: "El nombre del espacio es obligatorio.",
        path: byId[space.id]?.path ?? null,
      };
    }

    if (
      space.path.trim().startsWith("/") ||
      space.path.includes("..") ||
      space.path.split("/").some((segment) => segment.trim().length === 0)
    ) {
      byId[space.id] = {
        name: byId[space.id]?.name ?? null,
        path: "La ruta visible no puede ser absoluta ni incluir segmentos inválidos.",
      };
    }

    const previousCount = normalizedPathCounts.get(normalizedPath) ?? 0;
    normalizedPathCounts.set(normalizedPath, previousCount + 1);

    pathToSpace.set(normalizedPath, space);

    if (parentSpace) {
      const parentNormalizedPath = normalizePathKey(parentSpace.path);
      const expectedParentPath = getSpacePathParent(space.path);
      const expectedParentNormalized = expectedParentPath
        ? normalizePathKey(expectedParentPath)
        : null;

      if (
        expectedParentNormalized !== parentNormalizedPath ||
        !normalizePathKey(space.path).startsWith(
          `${parentNormalizedPath}/`,
        )
      ) {
        byId[space.id] = {
          name: byId[space.id]?.name ?? null,
          path: "La jerarquía visible no coincide con el espacio padre.",
        };
      }
    } else if (space.path.includes("/")) {
      byId[space.id] = {
        name: byId[space.id]?.name ?? null,
        path: "La jerarquía visible no coincide con el espacio padre.",
      };
    }
  });

  normalizedPathCounts.forEach((count, pathKey) => {
    if (count <= 1) {
      return;
    }

    spaces.forEach((space) => {
      if (normalizePathKey(space.path) === pathKey) {
        byId[space.id] = {
          name: byId[space.id]?.name ?? null,
          path: "Ya existe otra propuesta con la misma ruta visible.",
        };
      }
    });
  });

  const filesWithoutEnabledSpace = validFiles.reduce((total, file) => {
    const folderPath = file.relative_path.includes("/")
      ? file.relative_path.split("/").slice(0, -1).join("/")
      : "General";
    const assignedSpace = pathToSpace.get(normalizePathKey(folderPath));

    if (!assignedSpace || !assignedSpace.enabled) {
      return total + 1;
    }

    return total;
  }, 0);

  return {
    by_id: byId,
    has_errors: Object.keys(byId).length > 0,
    enabled_count: enabledSpaces.length,
    files_without_enabled_space: filesWithoutEnabledSpace,
  };
}
