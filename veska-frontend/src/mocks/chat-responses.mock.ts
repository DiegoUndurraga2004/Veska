import { mockDocumentIds } from "@/mocks/documents.mock";
import { mockSpaceIds } from "@/mocks/spaces.mock";
import type { ChatScope } from "@/types/chats";
import type {
  ChatMessage,
  MessageSource,
} from "@/types/messages";

function createMessageId() {
  return crypto.randomUUID();
}

function getCurrentTimestamp() {
  return new Date().toISOString();
}

function includesAny(
  value: string,
  terms: string[],
) {
  return terms.some((term) => value.includes(term));
}

function canUseSource(
  scope: ChatScope,
  selectedDocumentIds: string[],
  selectedSpaceIds: string[],
  source: MessageSource,
) {
  if (scope === "all_accessible_spaces") {
    return true;
  }

  if (scope === "selected_spaces") {
    return selectedSpaceIds.includes(source.space_id);
  }

  return selectedDocumentIds.includes(source.document_id);
}

function createInsufficientEvidenceMessage(): ChatMessage {
  return {
    id: createMessageId(),
    role: "assistant",
    content:
      "No encontré suficiente información en los documentos disponibles para responder con seguridad.",
    created_at: getCurrentTimestamp(),
    sources: [],
    feedback: null,
  };
}

function createSourcedAssistantMessage(
  content: string,
  source: MessageSource,
): ChatMessage {
  return {
    id: createMessageId(),
    role: "assistant",
    content,
    created_at: getCurrentTimestamp(),
    sources: [source],
    feedback: null,
  };
}

function createSpreadsheetSource(): MessageSource {
  return {
    id: createMessageId(),
    document_id: mockDocumentIds.monthlyExpenses,
    document_name:
      "Gastos comunes consolidado 2026.xlsx",
    space_id: mockSpaceIds.finance,
    space_path: "Finanzas",
    page_number: null,
    sheet_name: "Resumen mensual",
    cell_range: "A1:D4",
    snippet:
      "Mes: Enero | Proveedor: Ascensores SPA | Categoría: Mantención | Monto: 850000. Mes: Febrero | Proveedor: Ascensores SPA | Categoría: Mantención | Monto: 850000.",
    score: 0.91,
  };
}

function createContractSource(): MessageSource {
  return {
    id: createMessageId(),
    document_id: mockDocumentIds.contractAdministration,
    document_name:
      "Contrato administración Edificio Centro.pdf",
    space_id: mockSpaceIds.legalContracts,
    space_path: "Legal/Contratos",
    page_number: 7,
    sheet_name: null,
    cell_range: null,
    snippet:
      "El presente contrato tendrá una vigencia inicial de doce meses, renovándose automáticamente por períodos iguales salvo aviso previo.",
    score: 0.88,
  };
}

function createProvidersSource(): MessageSource {
  return {
    id: createMessageId(),
    document_id: mockDocumentIds.activeProvidersCsv,
    document_name:
      "Directorio proveedores activos.csv",
    space_id: mockSpaceIds.operations,
    space_path: "Operaciones",
    page_number: null,
    sheet_name: null,
    cell_range: "Filas 1-4",
    snippet:
      "Ascensores SPA | Mantención de ascensores. Servicios Eléctricos Demo | Mantención eléctrica. Bombas Centro Ltda. | Mantención de bombas de agua.",
    score: 0.86,
  };
}

export function createMockUserMessage(
  content: string,
): ChatMessage {
  return {
    id: createMessageId(),
    role: "user",
    content,
    created_at: getCurrentTimestamp(),
  };
}

export function createMockAssistantMessage(
  question: string,
  scope: ChatScope,
  selectedDocumentIds: string[],
  selectedSpaceIds: string[] = [],
): ChatMessage {
  const normalizedQuestion = question
    .trim()
    .toLocaleLowerCase("es-CL");

  if (
    includesAny(normalizedQuestion, [
      "clave",
      "contraseña",
      "password",
      "cuenta bancaria",
      "secreto",
    ])
  ) {
    return createInsufficientEvidenceMessage();
  }

  if (
    includesAny(normalizedQuestion, [
      "proveedor",
      "proveedores",
      "servicios",
    ])
  ) {
    const source = createProvidersSource();

    if (
      !canUseSource(
        scope,
        selectedDocumentIds,
        selectedSpaceIds,
        source,
      )
    ) {
      return createInsufficientEvidenceMessage();
    }

    return createSourcedAssistantMessage(
      "El directorio registra proveedores activos para mantención de ascensores, sistemas eléctricos y bombas de agua.",
      source,
    );
  }

  if (
    includesAny(normalizedQuestion, [
      "ascensor",
      "ascensores",
      "gastos comunes",
      "mantención",
      "mantenimiento",
    ])
  ) {
    const source = createSpreadsheetSource();

    if (
      !canUseSource(
        scope,
        selectedDocumentIds,
        selectedSpaceIds,
        source,
      )
    ) {
      return createInsufficientEvidenceMessage();
    }

    return createSourcedAssistantMessage(
      "Según la planilla consolidada, durante enero y febrero de 2026 se registraron dos pagos de $850.000 por mantención de ascensores, por un total de $1.700.000.",
      source,
    );
  }

  if (
    includesAny(normalizedQuestion, [
      "contrato",
      "duración",
      "vigencia",
      "renovación",
    ])
  ) {
    const source = createContractSource();

    if (
      !canUseSource(
        scope,
        selectedDocumentIds,
        selectedSpaceIds,
        source,
      )
    ) {
      return createInsufficientEvidenceMessage();
    }

    return createSourcedAssistantMessage(
      "El contrato de administración tiene una vigencia inicial de doce meses y contempla renovación automática por períodos iguales, salvo aviso previo dentro del plazo indicado en el documento.",
      source,
    );
  }

  return createInsufficientEvidenceMessage();
}
