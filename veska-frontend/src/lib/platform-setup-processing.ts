import { createPlatformSetupLocalId } from "@/lib/platform-setup-csv";
import type {
  PlatformSetupActivationChecklistItem,
  PlatformSetupBulkImportFile,
  PlatformSetupDraft,
  PlatformSetupProcessingFile,
  PlatformSetupProcessingStatus,
  PlatformSetupSuggestedSpace,
} from "@/types/platform-setup";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function normalizePath(value: string) {
  return value.trim().toLowerCase().replace(/\\/g, "/");
}

function isDeterministicProcessingError(
  file: PlatformSetupBulkImportFile,
  index: number,
) {
  const normalizedPath = normalizePath(file.relative_path);

  if (normalizedPath.includes("presupuesto interno")) {
    return true;
  }

  return (index + 1) % 7 === 0;
}

export function buildPlatformSetupProcessingFiles(
  validFiles: PlatformSetupBulkImportFile[],
): PlatformSetupProcessingFile[] {
  return validFiles.map((file, index) => ({
    id: createPlatformSetupLocalId("processing-file"),
    source_file_id: file.id,
    file_name: file.name,
    relative_path: file.relative_path,
    file_type: file.extension as PlatformSetupProcessingFile["file_type"],
    size: file.size,
    status: "uploaded",
    error_message: null,
    attempts: 0,
    should_fail_initially: isDeterministicProcessingError(file, index),
  }));
}

export function getPlatformSetupActiveSpaces(
  draft: PlatformSetupDraft,
): PlatformSetupSuggestedSpace[] {
  return draft.suggested_spaces.filter((space) => space.enabled);
}

export function getPlatformSetupSpacesWithoutCoverageCount(
  draft: PlatformSetupDraft,
): number {
  const spacesById = new Map(
    draft.suggested_spaces.map((space) => [space.id, space]),
  );
  const activeSpaces = getPlatformSetupActiveSpaces(draft);

  return activeSpaces.filter((space) => {
    const ancestorIds: string[] = [];
    let cursor: PlatformSetupSuggestedSpace | null = space;

    while (cursor) {
      ancestorIds.unshift(cursor.id);
      cursor = cursor.parent_id
        ? spacesById.get(cursor.parent_id) ?? null
        : null;
    }

    return !draft.space_permissions.some((permission) =>
      ancestorIds.includes(permission.space_id),
    );
  }).length;
}

export function getPlatformSetupProcessingProgress(
  files: PlatformSetupProcessingFile[],
) {
  const pending = files.filter((file) => file.status === "uploaded").length;
  const processing = files.filter((file) => file.status === "processing").length;
  const ready = files.filter((file) => file.status === "ready").length;
  const error = files.filter((file) => file.status === "error").length;
  const total = files.length;
  const completed = ready + error;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    pending,
    processing,
    ready,
    error,
    total,
    percentage,
  };
}

function getCompanyChecklistStatus(
  draft: PlatformSetupDraft,
): PlatformSetupActivationChecklistItem["status"] {
  const nameValid = draft.company.name.trim().length > 0;
  const slugValid = draft.company.slug.trim().length > 0;

  return nameValid && slugValid ? "completed" : "pending";
}

function getAiChecklistStatus(
  draft: PlatformSetupDraft,
): PlatformSetupActivationChecklistItem["status"] {
  return draft.ai.enabled && draft.ai.model_name.trim().length > 0
    ? "completed"
    : "pending";
}

function getAdminChecklistStatus(
  draft: PlatformSetupDraft,
): PlatformSetupActivationChecklistItem["status"] {
  return draft.initial_admin.full_name.trim().length > 0 &&
    isValidEmail(draft.initial_admin.email)
    ? "completed"
    : "pending";
}

function getUsersChecklistStatus(
  draft: PlatformSetupDraft,
): PlatformSetupActivationChecklistItem["status"] {
  return draft.initial_users.length > 0 ? "completed" : "pending";
}

function getGroupsChecklistStatus(
  draft: PlatformSetupDraft,
): PlatformSetupActivationChecklistItem["status"] {
  return draft.initial_groups.length > 0 ? "completed" : "pending";
}

function getSpacesChecklistStatus(
  draft: PlatformSetupDraft,
): PlatformSetupActivationChecklistItem["status"] {
  const activeSpaces = getPlatformSetupActiveSpaces(draft);
  const hasDocuments = draft.bulk_import.files.some(
    (file) => file.status === "valid",
  );

  if (!hasDocuments) {
    return activeSpaces.length > 0 ? "completed" : "pending";
  }

  return activeSpaces.length > 0 ? "completed" : "requires_review";
}

function getCoverageChecklistStatus(
  draft: PlatformSetupDraft,
): PlatformSetupActivationChecklistItem["status"] {
  return getPlatformSetupSpacesWithoutCoverageCount(draft) > 0
    ? "requires_review"
    : "completed";
}

function getDocumentsChecklistStatus(
  processingFiles: PlatformSetupProcessingFile[],
  hasDocuments: boolean,
): PlatformSetupActivationChecklistItem["status"] {
  if (!hasDocuments || processingFiles.length === 0) {
    return "pending";
  }

  return processingFiles.some((file) => file.status === "uploaded" || file.status === "processing")
    ? "pending"
    : "completed";
}

function getDocumentErrorsChecklistStatus(
  processingFiles: PlatformSetupProcessingFile[],
  hasDocuments: boolean,
): PlatformSetupActivationChecklistItem["status"] {
  if (!hasDocuments || processingFiles.length === 0) {
    return "pending";
  }

  return processingFiles.some((file) => file.status === "error")
    ? "requires_review"
    : "completed";
}

export function buildPlatformSetupActivationChecklist(
  draft: PlatformSetupDraft,
  processingFiles: PlatformSetupProcessingFile[],
): PlatformSetupActivationChecklistItem[] {
  const hasDocuments = draft.bulk_import.files.some(
    (file) => file.status === "valid",
  );
  const spacesWithoutCoverageCount =
    getPlatformSetupSpacesWithoutCoverageCount(draft);
  const validationErrorCount = draft.bulk_import.files.filter(
    (file) => file.status === "error",
  ).length;
  const processingErrorCount = processingFiles.filter(
    (file) => file.status === "error",
  ).length;

  return [
    {
      id: "company-configured",
      label: "Empresa configurada",
      status: getCompanyChecklistStatus(draft),
      detail:
        draft.company.name.trim().length > 0 && draft.company.slug.trim().length > 0
          ? null
          : "Faltan datos obligatorios de empresa.",
    },
    {
      id: "ai-configured",
      label: "Proveedor IA configurado y habilitado",
      status: getAiChecklistStatus(draft),
      detail: draft.ai.enabled
        ? null
        : "La configuración IA está preparada, pero el servicio sigue deshabilitado.",
    },
    {
      id: "admin-prepared",
      label: "Administrador inicial preparado",
      status: getAdminChecklistStatus(draft),
      detail:
        draft.initial_admin.full_name.trim().length > 0 &&
        isValidEmail(draft.initial_admin.email)
          ? null
          : "El email o el nombre del administrador inicial requiere revisión.",
    },
    {
      id: "users-reviewed",
      label: "Usuarios iniciales revisados",
      status: getUsersChecklistStatus(draft),
      detail:
        draft.initial_users.length > 0
          ? null
          : "No hay usuarios iniciales adicionales en memoria local.",
    },
    {
      id: "groups-reviewed",
      label: "Grupos iniciales revisados",
      status: getGroupsChecklistStatus(draft),
      detail:
        draft.initial_groups.length > 0
          ? null
          : "Todavía no se prepararon grupos iniciales.",
    },
    {
      id: "spaces-active",
      label: "Espacios activos preparados",
      status: getSpacesChecklistStatus(draft),
      detail:
        getPlatformSetupActiveSpaces(draft).length > 0
          ? null
          : "Activa al menos un espacio si existen documentos válidos.",
    },
    {
      id: "coverage-reviewed",
      label: "Cobertura de permisos revisada",
      status: getCoverageChecklistStatus(draft),
      detail:
        spacesWithoutCoverageCount > 0
          ? `${spacesWithoutCoverageCount} espacio${spacesWithoutCoverageCount === 1 ? "" : "s"} sin cobertura efectiva.`
          : null,
    },
    {
      id: "documents-processed",
      label: "Documentos procesados",
      status: getDocumentsChecklistStatus(processingFiles, hasDocuments),
      detail: hasDocuments
        ? processingFiles.some(
            (file) => file.status === "uploaded" || file.status === "processing",
          )
          ? "Todavía hay documentos en cola o en procesamiento."
          : null
        : "No hay documentos válidos importados.",
    },
    {
      id: "document-errors-reviewed",
      label: "Errores documentales revisados",
      status: getDocumentErrorsChecklistStatus(processingFiles, hasDocuments),
      detail:
        validationErrorCount > 0 || processingErrorCount > 0
          ? `${validationErrorCount} error${validationErrorCount === 1 ? "" : "es"} previo${validationErrorCount === 1 ? "" : "s"} y ${processingErrorCount} error${processingErrorCount === 1 ? "" : "es"} de procesamiento en memoria local.`
          : null,
    },
  ];
}

export function canActivatePlatformSetup({
  draft,
  processingFiles,
}: {
  draft: PlatformSetupDraft;
  processingFiles: PlatformSetupProcessingFile[];
}) {
  const hasDocuments = draft.bulk_import.files.some(
    (file) => file.status === "valid",
  );
  const hasValidAdmin =
    draft.initial_admin.full_name.trim().length > 0 &&
    isValidEmail(draft.initial_admin.email);
  const activeSpaces = getPlatformSetupActiveSpaces(draft);
  const pendingFiles = processingFiles.some(
    (file) => file.status === "uploaded" || file.status === "processing",
  );
  const unresolvedProcessingErrors = processingFiles.some(
    (file) => file.status === "error",
  );

  if (!draft.ai.enabled || !hasValidAdmin) {
    return false;
  }

  if (hasDocuments && processingFiles.length === 0) {
    return false;
  }

  if (pendingFiles || unresolvedProcessingErrors) {
    return false;
  }

  if (hasDocuments && activeSpaces.length === 0) {
    return false;
  }

  return hasDocuments;
}

export function canFinalizeWithoutActivation(
  draft: PlatformSetupDraft,
  processingFiles: PlatformSetupProcessingFile[],
) {
  const hasDocuments = draft.bulk_import.files.some(
    (file) => file.status === "valid",
  );
  const pendingFiles = processingFiles.some(
    (file) => file.status === "uploaded" || file.status === "processing",
  );
  const unresolvedProcessingErrors = processingFiles.some(
    (file) => file.status === "error",
  );

  return !hasDocuments && !pendingFiles && !unresolvedProcessingErrors;
}

export function getPlatformSetupProcessingStatus(
  processingFiles: PlatformSetupProcessingFile[],
): PlatformSetupProcessingStatus {
  if (processingFiles.length === 0) {
    return "idle";
  }

  if (processingFiles.some((file) => file.status === "uploaded" || file.status === "processing")) {
    return "running";
  }

  return processingFiles.some((file) => file.status === "error")
    ? "completed_with_errors"
    : "completed";
}
