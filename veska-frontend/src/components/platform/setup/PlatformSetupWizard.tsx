"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  buildPlatformSetupBulkImportDraft,
  buildPlatformSetupSuggestedSpaces,
  createPlatformSetupBulkImportDemoEntries,
  createPlatformSetupBulkImportEntriesFromFiles,
  validatePlatformSetupSuggestedSpaces,
} from "@/lib/platform-setup-bulk-import";
import {
  createPlatformSetupLocalId,
  normalizePlatformSetupEmail,
  parsePlatformSetupInitialUsersCsvFile,
} from "@/lib/platform-setup-csv";
import {
  buildPlatformSetupActivationChecklist,
  buildPlatformSetupProcessingFiles,
  canActivatePlatformSetup,
  canFinalizeWithoutActivation,
  getPlatformSetupActiveSpaces,
  getPlatformSetupProcessingProgress,
  getPlatformSetupProcessingStatus,
  getPlatformSetupSpacesWithoutCoverageCount,
} from "@/lib/platform-setup-processing";
import {
  type PlatformSetupActivationResult,
  type PlatformSetupAIInput,
  type PlatformSetupBulkImportDraft,
  type PlatformSetupCompanyInput,
  type PlatformSetupCsvPreview,
  type PlatformSetupDraft,
  type PlatformSetupInitialAdminInput,
  type PlatformSetupInitialGroup,
  type PlatformSetupInitialGroupParticipant,
  type PlatformSetupInitialUser,
  type PlatformSetupInitialUserInput,
  type PlatformSetupProcessingFile,
  type PlatformSetupProcessingStatus,
  type PlatformSetupSpacePermission,
  type PlatformSetupSuggestedSpace,
} from "@/types/platform-setup";

import { BulkImportSetupStep } from "./BulkImportSetupStep";
import { AISetupStep } from "./AISetupStep";
import { CompanySetupStep } from "./CompanySetupStep";
import { InitialAdminSetupStep } from "./InitialAdminSetupStep";
import { InitialGroupsSetupStep } from "./InitialGroupsSetupStep";
import { InitialUsersSetupStep } from "./InitialUsersSetupStep";
import { InitialSpacePermissionsSetupStep } from "./InitialSpacePermissionsSetupStep";
import { ProcessingActivationStep } from "./ProcessingActivationStep";
import { type PlatformSetupProcessingFileFilter } from "./ProcessingFileList";
import { ReviewSetupStep } from "./ReviewSetupStep";
import { SetupConfirmDialog } from "./SetupConfirmDialog";
import { SetupGroupForm } from "./SetupGroupForm";
import { SetupGroupMembersForm } from "./SetupGroupMembersForm";
import { SetupProgress } from "./SetupProgress";
import { SetupSuccess } from "./SetupSuccess";
import { SuggestedSpacesSetupStep } from "./SuggestedSpacesSetupStep";

type FieldErrors<T extends object> = Partial<Record<keyof T, string>>;
type NoticeTone = "success" | "error" | "info";

const totalSteps = 10;

const defaultCompany: PlatformSetupCompanyInput = {
  name: "",
  slug: "",
  plan: "piloto",
  status: "trial",
};

const defaultAi: PlatformSetupAIInput = {
  provider: "openai",
  privacy_tier: "standard",
  model_name: "gpt-4o-mini",
  enabled: true,
};

const defaultInitialAdminBase: Omit<PlatformSetupInitialAdminInput, "id"> = {
  full_name: "",
  email: "",
  access_provider: "microsoft",
  role: "company_admin",
};

const defaultInitialUser: PlatformSetupInitialUserInput = {
  name: "",
  email: "",
  role: "company_user",
  auth_provider: "microsoft",
};

const defaultBulkImportDraft: PlatformSetupBulkImportDraft = {
  source: null,
  zip_file_name: null,
  files: [],
  total_size: 0,
};

function normalizeSlug(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function createDefaultAdmin(): PlatformSetupInitialAdminInput {
  return {
    id: createPlatformSetupLocalId("initial-admin"),
    ...defaultInitialAdminBase,
  };
}

function buildDraft(
  company: PlatformSetupCompanyInput,
  ai: PlatformSetupAIInput,
  initialAdmin: PlatformSetupInitialAdminInput,
  initialUsers: PlatformSetupInitialUser[],
  initialGroups: PlatformSetupInitialGroup[],
  bulkImport: PlatformSetupBulkImportDraft,
  suggestedSpaces: PlatformSetupSuggestedSpace[],
  spacePermissions: PlatformSetupSpacePermission[],
): PlatformSetupDraft {
  return {
    company,
    ai,
    initial_admin: initialAdmin,
    initial_users: initialUsers,
    initial_groups: initialGroups,
    bulk_import: bulkImport,
    suggested_spaces: suggestedSpaces,
    space_permissions: spacePermissions,
  };
}

function createManualUser(values: PlatformSetupInitialUserInput) {
  return {
    id: createPlatformSetupLocalId("manual-user"),
    name: values.name.trim(),
    email: normalizePlatformSetupEmail(values.email),
    role: values.role,
    auth_provider: values.auth_provider,
    source: "manual" as const,
  };
}

function buildGroupParticipants(
  initialAdmin: PlatformSetupInitialAdminInput,
  initialUsers: PlatformSetupInitialUser[],
): PlatformSetupInitialGroupParticipant[] {
  return [
    {
      id: initialAdmin.id,
      name:
        initialAdmin.full_name.trim().length > 0
          ? initialAdmin.full_name.trim()
          : "Administrador inicial",
      email: normalizePlatformSetupEmail(initialAdmin.email),
      role: initialAdmin.role,
      auth_provider: initialAdmin.access_provider,
      source: "initial_admin",
    },
    ...initialUsers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      auth_provider: user.auth_provider,
      source: user.source,
    })),
  ];
}

function sumGroupAssignments(groups: PlatformSetupInitialGroup[]) {
  return groups.reduce((total, group) => total + group.member_ids.length, 0);
}

export function PlatformSetupWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [company, setCompany] = useState(defaultCompany);
  const [ai, setAi] = useState(defaultAi);
  const [initialAdmin, setInitialAdmin] = useState<PlatformSetupInitialAdminInput>(
    createDefaultAdmin,
  );
  const [initialUsers, setInitialUsers] = useState<PlatformSetupInitialUser[]>(
    [],
  );
  const [initialGroups, setInitialGroups] = useState<
    PlatformSetupInitialGroup[]
  >([]);
  const [bulkImport, setBulkImport] = useState<PlatformSetupBulkImportDraft>(
    defaultBulkImportDraft,
  );
  const [suggestedSpaces, setSuggestedSpaces] = useState<
    PlatformSetupSuggestedSpace[]
  >([]);
  const [spacePermissions, setSpacePermissions] = useState<
    PlatformSetupSpacePermission[]
  >([]);
  const [processingFiles, setProcessingFiles] = useState<
    PlatformSetupProcessingFile[]
  >([]);
  const [processingStatus, setProcessingStatus] =
    useState<PlatformSetupProcessingStatus>("idle");
  const [processingFilter, setProcessingFilter] =
    useState<PlatformSetupProcessingFileFilter>("all");
  const [processingFeedback, setProcessingFeedback] = useState<{
    tone: NoticeTone;
    message: string | null;
  }>({
    tone: "info",
    message: null,
  });
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [manualUser, setManualUser] =
    useState<PlatformSetupInitialUserInput>(defaultInitialUser);
  const [manualUserErrors, setManualUserErrors] = useState<
    FieldErrors<PlatformSetupInitialUserInput>
  >({});
  const [manualFeedback, setManualFeedback] = useState<string | null>(null);
  const [manualFeedbackTone, setManualFeedbackTone] =
    useState<NoticeTone | null>(null);
  const [csvPreview, setCsvPreview] = useState<PlatformSetupCsvPreview | null>(
    null,
  );
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvFeedback, setCsvFeedback] = useState<string | null>(null);
  const [csvFeedbackTone, setCsvFeedbackTone] = useState<NoticeTone | null>(
    null,
  );
  const [isCsvProcessing, setIsCsvProcessing] = useState(false);
  const [companyErrors, setCompanyErrors] = useState<
    FieldErrors<PlatformSetupCompanyInput>
  >({});
  const [aiErrors, setAiErrors] = useState<FieldErrors<PlatformSetupAIInput>>(
    {},
  );
  const [adminErrors, setAdminErrors] = useState<
    FieldErrors<PlatformSetupInitialAdminInput>
  >({});
  const [groupFeedback, setGroupFeedback] = useState<string | null>(null);
  const [groupFeedbackTone, setGroupFeedbackTone] =
    useState<NoticeTone | null>(null);
  const [groupFormState, setGroupFormState] = useState<{
    mode: "create" | "edit";
    group: PlatformSetupInitialGroup | null;
  } | null>(null);
  const [groupMembersState, setGroupMembersState] = useState<{
    group: PlatformSetupInitialGroup;
  } | null>(null);
  const [deleteGroupState, setDeleteGroupState] = useState<
    PlatformSetupInitialGroup | null
  >(null);
  const [isAwaitingConfirmation, setIsAwaitingConfirmation] = useState(false);
  const [isAwaitingActivationConfirmation, setIsAwaitingActivationConfirmation] =
    useState(false);
  const [activationConfirmationMode, setActivationConfirmationMode] = useState<
    "activate" | "finalize" | null
  >(null);
  const [result, setResult] = useState<PlatformSetupActivationResult | null>(
    null,
  );

  const draft = useMemo(
    () =>
      buildDraft(
        company,
        ai,
        initialAdmin,
        initialUsers,
        initialGroups,
        bulkImport,
        suggestedSpaces,
        spacePermissions,
      ),
    [
      ai,
      bulkImport,
      company,
      initialAdmin,
      initialGroups,
      initialUsers,
      suggestedSpaces,
      spacePermissions,
    ],
  );

  const validBulkImportFiles = useMemo(
    () => bulkImport.files.filter((file) => file.status === "valid"),
    [bulkImport.files],
  );

  const validationErrorCount = bulkImport.files.filter(
    (file) => file.status === "error",
  ).length;

  const suggestedSpacesValidation = useMemo(
    () =>
      validatePlatformSetupSuggestedSpaces(
        suggestedSpaces,
        validBulkImportFiles,
      ),
    [suggestedSpaces, validBulkImportFiles],
  );

  const isPlatformAdmin = true;

  const stepTitles = [
    "Datos de empresa",
    "Configuración IA",
    "Administrador inicial",
    "Usuarios iniciales",
    "Grupos iniciales",
    "Importación documental",
    "Espacios sugeridos",
    "Permisos iniciales",
    "Revisión",
    "Procesamiento y activación",
  ];

  const participants = useMemo(
    () => buildGroupParticipants(initialAdmin, initialUsers),
    [initialAdmin, initialUsers],
  );

  const totalAssignments = useMemo(
    () => sumGroupAssignments(initialGroups),
    [initialGroups],
  );

  const groupsWarning =
    initialGroups.length === 0
      ? "Todavía no agregaste grupos. Podrás configurarlos después, aunque normalmente conviene prepararlos antes de asignar permisos documentales."
      : null;

  const bulkImportWarning =
    bulkImport.files.length === 0
      ? "Todavía no cargaste documentos. Podrás completar la importación posteriormente, pero la empresa no estará lista para activarse."
      : null;

  const activeSpaces = useMemo(
    () => getPlatformSetupActiveSpaces(draft),
    [draft],
  );

  const spacesWithoutCoverageCount = useMemo(
    () => getPlatformSetupSpacesWithoutCoverageCount(draft),
    [draft],
  );

  const processingProgress = useMemo(
    () => getPlatformSetupProcessingProgress(processingFiles),
    [processingFiles],
  );

  const activationChecklist = useMemo(
    () => buildPlatformSetupActivationChecklist(draft, processingFiles),
    [draft, processingFiles],
  );

  const canActivate = useMemo(
    () =>
      canActivatePlatformSetup({
        draft,
        processingFiles,
      }),
    [draft, processingFiles],
  );

  const canFinalizeWithoutActivationLocal = useMemo(
    () => canFinalizeWithoutActivation(draft, processingFiles),
    [draft, processingFiles],
  );

  const hasValidDocuments = validBulkImportFiles.length > 0;

  const activationBlockingReasons = useMemo(() => {
    const reasons: string[] = [];

    if (hasValidDocuments) {
      if (processingFiles.length === 0 || processingStatus === "idle") {
        reasons.push("Inicia el procesamiento simulado antes de activar.");
      }

      if (processingProgress.pending > 0) {
        reasons.push("Hay documentos en estado uploaded pendientes de simulación.");
      }

      if (processingProgress.processing > 0) {
        reasons.push("Hay documentos todavía en processing.");
      }

      if (processingProgress.error > 0) {
        reasons.push("Reintenta o revisa los documentos con error de procesamiento.");
      }

      if (!draft.ai.enabled) {
        reasons.push("El proveedor IA debe estar habilitado.");
      }

      if (
        initialAdmin.full_name.trim().length === 0 ||
        !isValidEmail(initialAdmin.email)
      ) {
        reasons.push("El administrador inicial todavía no está validado.");
      }

      if (activeSpaces.length === 0) {
        reasons.push(
          "Si existen documentos válidos, debe existir al menos un espacio activo.",
        );
      }
    } else if (!canFinalizeWithoutActivationLocal) {
      reasons.push(
        "Todavía hay estados documentales temporales que deben quedar resueltos.",
      );
    }

    return reasons;
  }, [
    activeSpaces.length,
    canFinalizeWithoutActivationLocal,
    draft.ai.enabled,
    hasValidDocuments,
    initialAdmin.email,
    initialAdmin.full_name,
    processingProgress.error,
    processingProgress.pending,
    processingProgress.processing,
    processingFiles.length,
    processingStatus,
  ]);

  function resetConfirmation() {
    setIsAwaitingConfirmation(false);
  }

  function resetProcessingState() {
    setProcessingFiles([]);
    setProcessingStatus("idle");
    setProcessingFilter("all");
    setProcessingFeedback({
      tone: "info",
      message: null,
    });
    setIsAwaitingActivationConfirmation(false);
    setActivationConfirmationMode(null);
  }

  function closeGroupDialogs() {
    setGroupFormState(null);
    setGroupMembersState(null);
    setDeleteGroupState(null);
  }

  function clearManualMessages() {
    setManualFeedback(null);
    setManualFeedbackTone(null);
  }

  function clearCsvMessages() {
    setCsvError(null);
    setCsvFeedback(null);
    setCsvFeedbackTone(null);
  }

  function clearGroupMessages() {
    setGroupFeedback(null);
    setGroupFeedbackTone(null);
  }

  function syncSuggestedSpacesWithDraft(
    nextDraft: PlatformSetupBulkImportDraft,
  ) {
    setSuggestedSpaces(
      buildPlatformSetupSuggestedSpaces(
        nextDraft.files.filter((file) => file.status === "valid"),
      ),
    );
  }

  function applyBulkImportDraft(nextDraft: PlatformSetupBulkImportDraft) {
    setBulkImport(nextDraft);
    syncSuggestedSpacesWithDraft(nextDraft);
    setSpacePermissions([]);
    resetProcessingState();
    resetConfirmation();
  }

  function handleSelectFolderFiles(files: File[]) {
    const nextDraft = buildPlatformSetupBulkImportDraft(
      createPlatformSetupBulkImportEntriesFromFiles(files),
      "folder",
    );

    applyBulkImportDraft(nextDraft);
  }

  function handleSelectZipFile(file: File) {
    setBulkImport({
      source: "zip",
      zip_file_name: file.name,
      files: [],
      total_size: 0,
    });
    setSuggestedSpaces([]);
    setSpacePermissions([]);
    resetProcessingState();
    resetConfirmation();
  }

  function handleUseDemoStructure() {
    const nextDraft = buildPlatformSetupBulkImportDraft(
      createPlatformSetupBulkImportDemoEntries(),
      "zip",
      bulkImport.zip_file_name ?? "estructura-demostrativa.zip",
    );

    applyBulkImportDraft(nextDraft);
  }

  function handleRemoveBulkImportFile(fileId: string) {
    const nextFiles = bulkImport.files.filter((file) => file.id !== fileId);
    const nextDraft = {
      ...bulkImport,
      files: nextFiles,
      total_size: nextFiles.reduce((total, file) => total + file.size, 0),
    };

    applyBulkImportDraft(nextDraft);
  }

  function handleClearBulkImportSelection() {
    setBulkImport(defaultBulkImportDraft);
    setSuggestedSpaces([]);
    setSpacePermissions([]);
    resetProcessingState();
    resetConfirmation();
  }

  function handleToggleSuggestedSpace(spaceId: string) {
    setSuggestedSpaces((currentSpaces) =>
      currentSpaces.map((space) =>
        space.id === spaceId
          ? {
              ...space,
              enabled: !space.enabled,
            }
          : space,
      ),
    );
    resetConfirmation();
  }

  function handleRenameSuggestedSpace(spaceId: string, value: string) {
    setSuggestedSpaces((currentSpaces) =>
      currentSpaces.map((space) =>
        space.id === spaceId
          ? {
              ...space,
              name: value,
            }
          : space,
      ),
    );
    resetConfirmation();
  }

  function handleUpdateSuggestedSpacePath(spaceId: string, value: string) {
    setSuggestedSpaces((currentSpaces) =>
      currentSpaces.map((space) =>
        space.id === spaceId
          ? {
              ...space,
              path: value,
            }
          : space,
      ),
    );
    resetConfirmation();
  }

  function handleRestoreAutomaticSuggestedSpaces() {
    const nextSpaces = buildPlatformSetupSuggestedSpaces(
      bulkImport.files.filter((file) => file.status === "valid"),
    );

    setSuggestedSpaces(nextSpaces);
    setSpacePermissions([]);
    resetConfirmation();
  }

  function updateCompany(patch: Partial<PlatformSetupCompanyInput>) {
    setCompany((current) => ({
      ...current,
      ...patch,
    }));
    setCompanyErrors({});
    resetConfirmation();
  }

  function updateAi(patch: Partial<PlatformSetupAIInput>) {
    setAi((current) => {
      const nextValues = {
        ...current,
        ...patch,
      };

      if (nextValues.provider === "runpod") {
        nextValues.privacy_tier = "private";
      }

      return nextValues;
    });
    setAiErrors({});
    resetConfirmation();
  }

  function updateInitialAdmin(
    patch: Partial<PlatformSetupInitialAdminInput>,
  ) {
    setInitialAdmin((current) => ({
      ...current,
      ...patch,
    }));
    setAdminErrors({});
    resetConfirmation();
  }

  function updateManualUser(patch: Partial<PlatformSetupInitialUserInput>) {
    setManualUser((current) => ({
      ...current,
      ...patch,
    }));
    setManualUserErrors({});
    clearManualMessages();
    resetConfirmation();
  }

  function validateCompanyStep() {
    const nextErrors: FieldErrors<PlatformSetupCompanyInput> = {};
    const normalizedSlug = normalizeSlug(company.slug);

    if (company.name.trim().length === 0) {
      nextErrors.name = "El nombre de empresa es obligatorio.";
    }

    if (normalizedSlug.length === 0) {
      nextErrors.slug = "El slug es obligatorio.";
    } else if (!/^[a-z0-9-]+$/.test(normalizedSlug)) {
      nextErrors.slug = "Usa solo minúsculas, números y guiones.";
    }

    if (!company.plan) {
      nextErrors.plan = "Selecciona un plan.";
    }

    if (!company.status) {
      nextErrors.status = "Selecciona un estado inicial.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setCompanyErrors(nextErrors);
      return false;
    }

    setCompany((current) => ({
      ...current,
      slug: normalizedSlug,
    }));
    setCompanyErrors({});
    return true;
  }

  function validateAiStep() {
    const nextErrors: FieldErrors<PlatformSetupAIInput> = {};

    if (!ai.provider) {
      nextErrors.provider = "Selecciona un proveedor.";
    }

    if (!ai.privacy_tier) {
      nextErrors.privacy_tier = "Selecciona un privacy tier.";
    }

    if (ai.model_name.trim().length === 0) {
      nextErrors.model_name = "El modelo es obligatorio.";
    }

    const effectivePrivacyTier =
      ai.provider === "runpod" ? "private" : ai.privacy_tier;

    if (
      ai.provider === "openai" &&
      effectivePrivacyTier !== "standard" &&
      effectivePrivacyTier !== "private"
    ) {
      nextErrors.privacy_tier = "Selecciona un privacy tier válido.";
    }

    if (ai.provider === "runpod" && effectivePrivacyTier !== "private") {
      nextErrors.privacy_tier = "Runpod fuerza privacidad privada.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setAiErrors(nextErrors);
      return false;
    }

    setAi((current) => ({
      ...current,
      privacy_tier:
        current.provider === "runpod" ? "private" : current.privacy_tier,
      model_name: current.model_name.trim(),
    }));
    setAiErrors({});
    return true;
  }

  function validateAdminStep() {
    const nextErrors: FieldErrors<PlatformSetupInitialAdminInput> = {};

    if (initialAdmin.full_name.trim().length === 0) {
      nextErrors.full_name = "El nombre completo es obligatorio.";
    }

    if (!isValidEmail(initialAdmin.email)) {
      nextErrors.email = "Ingresa un email corporativo válido.";
    }

    if (!initialAdmin.access_provider) {
      nextErrors.access_provider = "Selecciona un proveedor de acceso.";
    }

    if (initialAdmin.role !== "company_admin") {
      nextErrors.role = "El rol no es editable.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setAdminErrors(nextErrors);
      return false;
    }

    setInitialAdmin((current) => ({
      ...current,
      full_name: current.full_name.trim(),
      email: normalizePlatformSetupEmail(current.email),
    }));
    setAdminErrors({});
    return true;
  }

  function validateManualUser() {
    const nextErrors: FieldErrors<PlatformSetupInitialUserInput> = {};
    const normalizedName = manualUser.name.trim();
    const normalizedEmail = normalizePlatformSetupEmail(manualUser.email);
    const adminEmail = normalizePlatformSetupEmail(initialAdmin.email);
    const existingEmails = new Set(
      initialUsers.map((user) => normalizePlatformSetupEmail(user.email)),
    );

    if (normalizedName.length === 0) {
      nextErrors.name = "El nombre completo es obligatorio.";
    }

    if (!isValidEmail(manualUser.email)) {
      nextErrors.email = "Ingresa un email corporativo válido.";
    } else if (normalizedEmail === adminEmail) {
      nextErrors.email =
        "El email coincide con el administrador inicial y no puede repetirse.";
    } else if (existingEmails.has(normalizedEmail)) {
      nextErrors.email = "Ese email ya existe en los usuarios preparados.";
    }

    if (!manualUser.role) {
      nextErrors.role = "Selecciona un rol inicial.";
    }

    if (!manualUser.auth_provider) {
      nextErrors.auth_provider = "Selecciona un proveedor de acceso.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setManualUserErrors(nextErrors);
      setManualFeedback("Corrige los campos marcados para agregar el usuario.");
      setManualFeedbackTone("error");
      return false;
    }

    setManualUserErrors({});
    setInitialUsers((current) => [
      ...current,
      createManualUser({
        ...manualUser,
        name: normalizedName,
        email: normalizedEmail,
      }),
    ]);
    setManualUser((current) => ({
      ...defaultInitialUser,
      role: current.role,
      auth_provider: current.auth_provider,
    }));
    setManualFeedback("Usuario agregado localmente.");
    setManualFeedbackTone("success");
    resetConfirmation();
    return true;
  }

  function handleManualRemove(userId: string) {
    setInitialUsers((current) => current.filter((user) => user.id !== userId));
    setInitialGroups((currentGroups) =>
      currentGroups.map((group) => ({
        ...group,
        member_ids: group.member_ids.filter((memberId) => memberId !== userId),
      })),
    );
    clearManualMessages();
    resetConfirmation();
  }

  async function handleCsvSelectFile(file: File) {
    setIsCsvProcessing(true);
    clearCsvMessages();

    try {
      const currentEmails = initialUsers.map((user) => user.email);
      const resultFromFile = await parsePlatformSetupInitialUsersCsvFile({
        file,
        existingEmails: currentEmails,
        adminEmail: initialAdmin.email,
      });

      if (!resultFromFile.ok) {
        setCsvError(resultFromFile.error);
        setCsvPreview(null);
        return;
      }

      setCsvPreview(resultFromFile.preview);
      setCsvFeedback(
        resultFromFile.preview.invalid_rows.length > 0
          ? "El preview quedó cargado con filas válidas y errores locales para revisión."
          : "El preview quedó cargado sin errores locales.",
      );
      setCsvFeedbackTone("info");
    } catch {
      setCsvError("No se pudo leer el archivo CSV seleccionado.");
      setCsvPreview(null);
    } finally {
      setIsCsvProcessing(false);
      resetConfirmation();
    }
  }

  function handleCsvAddValidRows() {
    if (!csvPreview || csvPreview.valid_rows.length === 0) {
      setCsvFeedback("No hay filas válidas para agregar.");
      setCsvFeedbackTone("info");
      return;
    }

    const currentEmails = new Set(
      [
        normalizePlatformSetupEmail(initialAdmin.email),
        ...initialUsers.map((user) => normalizePlatformSetupEmail(user.email)),
      ].filter((email) => email.length > 0),
    );

    const addableRows = csvPreview.valid_rows.filter((row) => {
      const normalizedEmail = normalizePlatformSetupEmail(row.email);

      if (currentEmails.has(normalizedEmail)) {
        return false;
      }

      currentEmails.add(normalizedEmail);
      return true;
    });

    if (addableRows.length === 0) {
      setCsvFeedback(
        "No se agregaron filas nuevas porque ya existen en el listado local o coinciden con el administrador inicial.",
      );
      setCsvFeedbackTone("info");
      return;
    }

    const skippedRows = csvPreview.valid_rows.length - addableRows.length;

    setInitialUsers((current) => [...current, ...addableRows]);
    setCsvFeedback(
      skippedRows > 0
        ? `Se agregaron ${addableRows.length} filas válidas y se omitieron ${skippedRows} por duplicado local.`
        : `Se agregaron ${addableRows.length} filas válidas al listado local.`,
    );
    setCsvFeedbackTone("success");
    resetConfirmation();
  }

  function handleCsvClearPreview() {
    setCsvPreview(null);
    clearCsvMessages();
    resetConfirmation();
  }

  function openCreateGroup() {
    clearGroupMessages();
    setGroupFormState({
      mode: "create",
      group: null,
    });
  }

  function openEditGroup(group: PlatformSetupInitialGroup) {
    clearGroupMessages();
    setGroupFormState({
      mode: "edit",
      group,
    });
  }

  function openDeleteGroup(group: PlatformSetupInitialGroup) {
    clearGroupMessages();
    setDeleteGroupState(group);
  }

  function openManageMembers(group: PlatformSetupInitialGroup) {
    clearGroupMessages();
    setGroupMembersState({
      group,
    });
  }

  function handleSaveGroup(payload: {
    name: string;
    description: string | null;
  }) {
    if (groupFormState?.mode === "edit" && groupFormState.group) {
      const updatedGroup: PlatformSetupInitialGroup = {
        ...groupFormState.group,
        name: payload.name,
        description: payload.description,
      };

      setInitialGroups((currentGroups) =>
        currentGroups.map((currentGroup) =>
          currentGroup.id === updatedGroup.id ? updatedGroup : currentGroup,
        ),
      );
      setSelectedGroupId(updatedGroup.id);
      setGroupFeedback(
        `El grupo "${updatedGroup.name}" fue actualizado localmente.`,
      );
      setGroupFeedbackTone("success");
      setGroupFormState(null);
      return;
    }

    const newGroup: PlatformSetupInitialGroup = {
      id: createPlatformSetupLocalId("group"),
      name: payload.name,
      description: payload.description,
      member_ids: [],
    };

    setInitialGroups((currentGroups) => [newGroup, ...currentGroups]);
    setSelectedGroupId(newGroup.id);
    setGroupFeedback(`El grupo "${newGroup.name}" fue creado localmente y quedó abierto.`);
    setGroupFeedbackTone("success");
    setGroupFormState(null);
  }

  function handleSaveGroupMembers(memberIds: string[]) {
    if (!groupMembersState) {
      return;
    }

    const nextMemberIds = Array.from(new Set(memberIds));
    const targetGroupId = groupMembersState.group.id;

    setInitialGroups((currentGroups) =>
      currentGroups.map((group) =>
        group.id === targetGroupId
          ? {
              ...group,
              member_ids: nextMemberIds,
            }
          : group,
      ),
    );
    setSelectedGroupId(targetGroupId);
    setGroupFeedback(
      `Se guardaron ${nextMemberIds.length} integrante${nextMemberIds.length === 1 ? "" : "s"} en "${groupMembersState.group.name}".`,
    );
    setGroupFeedbackTone("success");
    setGroupMembersState(null);
  }

  function handleConfirmDeleteGroup() {
    if (!deleteGroupState) {
      return;
    }

    const deletedGroup = deleteGroupState;
    let nextSelectedGroupId: string | null = null;

    setInitialGroups((currentGroups) => {
      const nextGroups = currentGroups.filter(
        (group) => group.id !== deletedGroup.id,
      );
      nextSelectedGroupId =
        selectedGroupId === deletedGroup.id
          ? nextGroups[0]?.id ?? null
          : selectedGroupId;
      return nextGroups;
    });
    setSelectedGroupId(nextSelectedGroupId);

    setGroupFeedback(
      "El grupo fue eliminado localmente. Sus asignaciones simuladas de integrantes también se removieron.",
    );
    setGroupFeedbackTone("success");
    setDeleteGroupState(null);
  }

  function handleAddSpacePermission(
    permission: PlatformSetupSpacePermission,
  ) {
    setSpacePermissions((currentPermissions) => [
      permission,
      ...currentPermissions,
    ]);
  }

  function handleRemoveSpacePermission(permissionId: string) {
    setSpacePermissions((currentPermissions) =>
      currentPermissions.filter((permission) => permission.id !== permissionId),
    );
  }

  function handleContinue() {
    if (currentStep === 1) {
      if (!validateCompanyStep()) {
        return;
      }
    }

    if (currentStep === 2) {
      if (!validateAiStep()) {
        return;
      }
    }

    if (currentStep === 3) {
      if (!validateAdminStep()) {
        return;
      }
    }

    if (currentStep === 7 && suggestedSpacesValidation.has_errors) {
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, totalSteps));
    closeGroupDialogs();
    resetConfirmation();
  }

  function startProcessingSimulation() {
    if (validBulkImportFiles.length === 0) {
      setProcessingFeedback({
        tone: "info",
        message: "No hay documentos válidos para iniciar la simulación.",
      });
      return;
    }

    setProcessingFiles(buildPlatformSetupProcessingFiles(validBulkImportFiles));
    setProcessingStatus("running");
    setProcessingFilter("all");
    setProcessingFeedback({
      tone: "info",
      message:
        "La simulación documental inició con estados uploaded -> processing -> ready/error.",
    });
  }

  function retryFailedProcessingFiles() {
    const failedCount = processingFiles.filter(
      (file) => file.status === "error",
    ).length;

    if (failedCount === 0) {
      setProcessingFeedback({
        tone: "info",
        message: "No hay documentos con error de procesamiento para reintentar.",
      });
      return;
    }

    setProcessingFiles((currentFiles) =>
      currentFiles.map((file) =>
        file.status === "error"
          ? {
              ...file,
              status: "processing",
              error_message: null,
            }
          : file,
      ),
    );
    setProcessingStatus("running");
    setProcessingFeedback({
      tone: "success",
      message: `Se reintentan ${failedCount} documento${failedCount === 1 ? "" : "s"} con error de procesamiento.`,
    });
  }

  function handleRequestReviewConfirmation() {
    if (!isAwaitingConfirmation) {
      setIsAwaitingConfirmation(true);
      return;
    }

    setCurrentStep(10);
    setIsAwaitingConfirmation(false);
    setProcessingFeedback({
      tone: "info",
      message:
        "Revisión confirmada. El último paso ya está disponible para simular procesamiento y activación.",
    });
  }

  function handleCancelReviewConfirmation() {
    setIsAwaitingConfirmation(false);
  }

  function handleRequestActivationConfirmation(
    mode: "activate" | "finalize",
  ) {
    if (mode === "activate" && !canActivate) {
      setProcessingFeedback({
        tone: "error",
        message:
          "No se puede activar aún. Revisa la simulación documental y la cobertura requerida.",
      });
      return;
    }

    if (mode === "finalize" && !canFinalizeWithoutActivationLocal) {
      setProcessingFeedback({
        tone: "error",
        message:
          "No se puede finalizar sin activar porque aún hay documentos válidos por resolver.",
      });
      return;
    }

    setActivationConfirmationMode(mode);
    setIsAwaitingActivationConfirmation(true);
  }

  function handleCancelActivationConfirmation() {
    setIsAwaitingActivationConfirmation(false);
    setActivationConfirmationMode(null);
  }

  function handleConfirmActivation() {
    if (!activationConfirmationMode) {
      return;
    }

    const nextMode = activationConfirmationMode;

    setResult({
      local_tenant_id: createPlatformSetupLocalId("tenant"),
      created_at: new Date().toISOString(),
      status: nextMode === "activate" ? "active" : company.status,
      mode:
        nextMode === "activate"
          ? "activated"
          : "finalized_without_activation",
      draft,
      processing_status: getPlatformSetupProcessingStatus(processingFiles),
      processing_files: processingFiles,
      activation_checklist: activationChecklist,
      metrics: {
        documents_ready: processingProgress.ready,
        documents_with_validation_errors: validationErrorCount,
        documents_with_processing_errors: processingProgress.error,
        active_spaces: activeSpaces.length,
        permissions_configured: spacePermissions.length,
        errors_ignored_or_removed:
          validationErrorCount + processingProgress.error,
      },
    });

    setIsAwaitingActivationConfirmation(false);
    setActivationConfirmationMode(null);
    setProcessingFeedback({
      tone: "success",
      message:
        nextMode === "activate"
          ? "La empresa simulada quedó activada localmente."
          : "El setup se finalizó sin activar la empresa documentalmente.",
    });
  }

  useEffect(() => {
    if (processingStatus !== "running") {
      return;
    }

    const processingFile = processingFiles.find(
      (file) => file.status === "processing",
    );

    if (processingFile) {
      const timer = window.setTimeout(() => {
        setProcessingFiles((currentFiles) =>
          currentFiles.map((file) =>
            file.id === processingFile.id
              ? {
                  ...file,
                  attempts: file.attempts + 1,
                  status:
                    file.attempts === 0 && file.should_fail_initially
                      ? "error"
                      : "ready",
                  error_message:
                    file.attempts === 0 && file.should_fail_initially
                      ? `Error de procesamiento simulado para ${file.relative_path}.`
                      : null,
                }
              : file,
          ),
        );
      }, 650);

      return () => window.clearTimeout(timer);
    }

    const uploadedFile = processingFiles.find(
      (file) => file.status === "uploaded",
    );

    if (uploadedFile) {
      const timer = window.setTimeout(() => {
        setProcessingFiles((currentFiles) =>
          currentFiles.map((file) =>
            file.id === uploadedFile.id
              ? {
                  ...file,
                  status: "processing",
                }
              : file,
          ),
        );
      }, 450);

      return () => window.clearTimeout(timer);
    }

    const nextStatus = processingFiles.some((file) => file.status === "error")
      ? "completed_with_errors"
      : "completed";

    const completionTimer = window.setTimeout(() => {
      setProcessingStatus(nextStatus);
      setProcessingFeedback({
        tone: nextStatus === "completed" ? "success" : "info",
        message:
          nextStatus === "completed"
            ? "La simulación documental finalizó sin errores de procesamiento."
            : "La simulación documental finalizó con algunos errores de procesamiento que pueden reintentarse.",
      });
    }, 0);

    return () => window.clearTimeout(completionTimer);
  }, [processingFiles, processingStatus]);

  function handleBack() {
    if (currentStep === 10) {
      resetProcessingState();
    }

    setCurrentStep((step) => Math.max(step - 1, 1));
    closeGroupDialogs();
    resetConfirmation();
  }

  function handleCancel() {
    router.push("/platform");
  }

  const wizardContent = result ? (
    <SetupSuccess result={result} />
  ) : (
    <>
      <SetupProgress
        currentStep={currentStep}
        totalSteps={totalSteps}
        title={stepTitles[currentStep - 1]}
        stepLabels={stepTitles}
      />

      {currentStep === 1 && (
        <CompanySetupStep
          values={company}
          errors={companyErrors}
          onUpdate={updateCompany}
        />
      )}

      {currentStep === 2 && (
        <AISetupStep values={ai} errors={aiErrors} onUpdate={updateAi} />
      )}

      {currentStep === 3 && (
        <InitialAdminSetupStep
          values={initialAdmin}
          errors={adminErrors}
          onUpdate={updateInitialAdmin}
        />
      )}

      {currentStep === 4 && (
        <InitialUsersSetupStep
          manualValues={manualUser}
          manualErrors={manualUserErrors}
          manualFeedback={manualFeedback}
          manualFeedbackTone={manualFeedbackTone}
          users={initialUsers}
          adminEmail={initialAdmin.email}
          csvPreview={csvPreview}
          csvError={csvError}
          csvFeedback={csvFeedback}
          csvFeedbackTone={csvFeedbackTone}
          isCsvProcessing={isCsvProcessing}
          onManualUpdate={updateManualUser}
          onManualAdd={validateManualUser}
          onManualRemove={handleManualRemove}
          onCsvSelectFile={handleCsvSelectFile}
          onCsvAddValidRows={handleCsvAddValidRows}
          onCsvClearPreview={handleCsvClearPreview}
        />
      )}

      {currentStep === 5 && (
        <InitialGroupsSetupStep
          groups={initialGroups}
          selectedGroupId={selectedGroupId}
          participants={participants}
          totalAssignments={totalAssignments}
          warningMessage={groupsWarning}
          feedback={groupFeedback}
          feedbackTone={groupFeedbackTone}
          onSelectGroup={setSelectedGroupId}
          onCreateGroup={openCreateGroup}
          onEditGroup={openEditGroup}
          onDeleteGroup={openDeleteGroup}
          onManageMembers={openManageMembers}
        />
      )}

      {currentStep === 6 && (
        <BulkImportSetupStep
          draft={bulkImport}
          onSelectFolderFiles={handleSelectFolderFiles}
          onSelectZipFile={handleSelectZipFile}
          onUseDemoStructure={handleUseDemoStructure}
          onRemoveFile={handleRemoveBulkImportFile}
          onClearSelection={handleClearBulkImportSelection}
          warningMessage={bulkImportWarning}
        />
      )}

      {currentStep === 7 && (
        <SuggestedSpacesSetupStep
          spaces={suggestedSpaces}
          validFiles={validBulkImportFiles}
          validation={suggestedSpacesValidation}
          onToggleEnabled={handleToggleSuggestedSpace}
          onRenameSpace={handleRenameSuggestedSpace}
          onUpdatePath={handleUpdateSuggestedSpacePath}
          onRestoreAutomaticProposals={handleRestoreAutomaticSuggestedSpaces}
        />
      )}

      {currentStep === 8 && (
        <InitialSpacePermissionsSetupStep
          spaces={suggestedSpaces}
          groups={initialGroups}
          initialAdmin={initialAdmin}
          initialUsers={initialUsers}
          permissions={spacePermissions}
          onAddPermission={handleAddSpacePermission}
          onRemovePermission={handleRemoveSpacePermission}
        />
      )}

      {currentStep === 9 && (
        <ReviewSetupStep
          draft={draft}
          isAwaitingConfirmation={isAwaitingConfirmation}
          onRequestConfirmation={handleRequestReviewConfirmation}
          onCancelConfirmation={handleCancelReviewConfirmation}
        />
      )}

      {currentStep === 10 && (
        <ProcessingActivationStep
          processingFiles={processingFiles}
          processingStatus={processingStatus}
          processingFilter={processingFilter}
          processingProgress={processingProgress}
          activationChecklist={activationChecklist}
          preparedDocumentsCount={validBulkImportFiles.length}
          validationErrorCount={validationErrorCount}
          activeSpacesCount={activeSpaces.length}
          permissionsConfiguredCount={spacePermissions.length}
          spacesWithoutCoverageCount={spacesWithoutCoverageCount}
          hasDocuments={hasValidDocuments}
          canActivate={canActivate}
          canFinalizeWithoutActivation={canFinalizeWithoutActivationLocal}
          activationBlockingReasons={activationBlockingReasons}
          processingFeedback={processingFeedback}
          onFilterChange={setProcessingFilter}
          onStartProcessing={startProcessingSimulation}
          onRetryFailed={retryFailedProcessingFiles}
          onRequestActivationConfirmation={handleRequestActivationConfirmation}
        />
      )}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
        >
          Cancelar
        </button>

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anterior
          </button>

          {currentStep < totalSteps && (
          <button
            type="button"
            onClick={
              currentStep === 9
                ? handleRequestReviewConfirmation
                : handleContinue
            }
            className="rounded-xl bg-[#427AC6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#356AAE]"
          >
            {currentStep === 9
              ? "Confirmar e ir a procesamiento"
              : "Continuar"}
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <main className="mx-auto max-w-6xl space-y-8 pb-8">
      <section className="space-y-3">
        <h1 className="text-[32px] font-semibold tracking-tight text-[#152436] sm:text-[34px]">
          Nueva empresa
        </h1>

        <p className="max-w-3xl text-[15px] leading-6 text-[#526173]">
          Configura una empresa cliente dentro de Veska.
        </p>
      </section>

      <section className={isPlatformAdmin ? "space-y-6" : "hidden"}>
        <div className="rounded-[16px] border border-[#E8EDF3] bg-white px-5 py-6 shadow-[0_1px_2px_rgba(21,36,54,0.04)] sm:px-7 sm:py-7">
          {wizardContent}
        </div>
      </section>

      {groupFormState ? (
        <SetupGroupForm
          key={`${groupFormState.mode}-${groupFormState.group?.id ?? "new"}`}
          open={Boolean(groupFormState)}
          mode={groupFormState.mode}
          group={groupFormState.group}
          existingGroups={initialGroups}
          onClose={() => setGroupFormState(null)}
          onSubmit={handleSaveGroup}
        />
      ) : null}

      {groupMembersState ? (
        <SetupGroupMembersForm
          key={groupMembersState.group.id}
          open={Boolean(groupMembersState)}
          group={groupMembersState.group}
          participants={participants}
          onClose={() => setGroupMembersState(null)}
          onSubmit={handleSaveGroupMembers}
        />
      ) : null}

      <SetupConfirmDialog
        open={Boolean(deleteGroupState)}
        title="Eliminar grupo"
        description={
          <>
            <p>
              Eliminar este grupo quitará sus asignaciones simuladas de integrantes.
              No se eliminarán usuarios ni documentos.
            </p>
            {deleteGroupState ? (
              <p className="mt-2">
                Grupo seleccionado:{" "}
                <span className="font-semibold text-foreground">
                  {deleteGroupState.name}
                </span>
              </p>
            ) : null}
          </>
        }
        confirmLabel="Eliminar grupo"
        tone="danger"
        onCancel={() => setDeleteGroupState(null)}
        onConfirm={handleConfirmDeleteGroup}
      />

      <SetupConfirmDialog
        open={isAwaitingConfirmation}
        title="Confirmar avance al procesamiento"
        description={
          <>
            <p>
              Confirma que deseas pasar al último paso del setup asistido y comenzar la simulación documental local.
            </p>
            <p className="mt-2">
              La simulación representa el flujo futuro de backend sin persistencia real.
            </p>
          </>
        }
        confirmLabel="Ir a procesamiento"
        onCancel={handleCancelReviewConfirmation}
        onConfirm={handleRequestReviewConfirmation}
      />

      <SetupConfirmDialog
        open={isAwaitingActivationConfirmation}
        title={
          activationConfirmationMode === "activate"
            ? "Activar empresa simulada"
            : "Finalizar setup sin activar"
        }
        description={
          activationConfirmationMode === "activate" ? (
            <>
              <p>
                Confirma la activación local de la empresa después de la simulación documental.
              </p>
              <p className="mt-2">
                No se enviará ningún archivo ni se ejecutará persistencia real.
              </p>
            </>
          ) : (
            <>
              <p>
                Confirma que deseas finalizar el setup en estado local sin activar la empresa documentalmente.
              </p>
              <p className="mt-2">
                Esto deja el tenant en memoria local con estado trial o inactive.
              </p>
            </>
          )
        }
        confirmLabel={
          activationConfirmationMode === "activate"
            ? "Activar empresa simulada"
            : "Finalizar setup sin activar"
        }
        onCancel={handleCancelActivationConfirmation}
        onConfirm={handleConfirmActivation}
      />

      <section
        className={isPlatformAdmin ? "hidden" : "rounded-[16px] border border-[#E8EDF3] bg-white px-6 py-8"}
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex rounded-full border border-[#E8EDF3] bg-[#F7F9FC] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#7D8A99]">
            Acceso no autorizado
          </p>

          <h2 className="mt-5 text-[24px] font-semibold tracking-tight text-[#152436] sm:text-[28px]">
            Esta vista está reservada para platform_admin
          </h2>

          <p className="mt-3 text-[15px] leading-6 text-[#526173] sm:text-base">
            La sesión simulada actual corresponde a{" "}
            <span className="font-semibold text-[#152436]">platform_admin</span>
            . Cambia la vista simulada para revisar el wizard o vuelve al panel interno.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/platform"
              className="rounded-xl border border-[#D9E1EA] px-4 py-2.5 text-sm font-semibold text-[#152436] transition hover:bg-[#F7F9FC]"
            >
              Ir al panel interno
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
