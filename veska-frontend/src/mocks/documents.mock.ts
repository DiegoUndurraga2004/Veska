import { mockTenantId } from "@/mocks/tenants.mock";
import { mockSpaceIds } from "@/mocks/spaces.mock";
import { mockUserIds, mockUsers } from "@/mocks/users.mock";
import type {
  DocumentDetail,
  DocumentListItem,
} from "@/types/documents";

export const mockDocumentIds = {
  contractAdministration:
    "22222222-2222-4222-8222-222222222223",
  committeeMinutes:
    "22222222-2222-4222-8222-222222222224",
  providersList:
    "22222222-2222-4222-8222-222222222225",
  buildingRegulation:
    "22222222-2222-4222-8222-222222222226",
  elevatorQuote:
    "22222222-2222-4222-8222-222222222227",
  financialReport:
    "22222222-2222-4222-8222-222222222228",
  historicProviderContracts:
    "22222222-2222-4222-8222-222222222229",
  technicalReport:
    "22222222-2222-4222-8222-222222222230",
  securityAgreement:
    "22222222-2222-4222-8222-222222222231",
  monthlyExpenses:
    "22222222-2222-4222-8222-222222222232",
  activeProvidersCsv:
    "22222222-2222-4222-8222-222222222233",
} as const;

const userById: Record<
  string,
  (typeof mockUsers)[number]
> = Object.fromEntries(
  mockUsers.map((user) => [user.id, user]),
);

const mockDocumentTextById: Record<string, string> = {
  [mockDocumentIds.contractAdministration]:
    "Contrato de administración del Edificio Centro. Vigencia inicial de doce meses, con renovación automática por períodos iguales salvo aviso previo dentro del plazo pactado. El administrador debe rendir cuentas mensuales, coordinar mantenciones y remitir actas de reunión al comité.",
  [mockDocumentIds.committeeMinutes]:
    "Acta de reunión del comité de abril de 2026. Se revisaron trabajos pendientes, presupuesto de mantención, proveedores activos y fechas de seguimiento. El comité acordó actualizar el cronograma de inspecciones durante mayo y revisar el estado de los contratos vigentes.",
  [mockDocumentIds.providersList]:
    "Listado de proveedores activos. Ascensores SPA: mantención de ascensores. Servicios Eléctricos Demo: mantención eléctrica. Bombas Centro Ltda.: mantención de bombas de agua. Limpieza Norte: aseo general. Seguridad Central: vigilancia nocturna.",
  [mockDocumentIds.buildingRegulation]:
    "Reglamento de copropiedad del Edificio Norte. Define uso de áreas comunes, responsabilidades de residentes, horarios de silencio, procedimientos de mantención y sanciones por incumplimiento. También regula accesos, estacionamientos y administración del edificio.",
  [mockDocumentIds.elevatorQuote]:
    "Cotización para mantención de ascensores. Incluye inspección preventiva, revisión de tableros, lubricación, reemplazo de piezas menores y respuesta a incidencias. La propuesta considera un plan mensual de servicio con visitas programadas y reporte técnico posterior.",
  [mockDocumentIds.securityAgreement]:
    "Convenio de servicio de seguridad 2026. Define turnos, rondas, dotación mínima, coordinación con administración y protocolos de emergencia. El servicio contempla vigilancia nocturna, control de accesos y registro de novedades en bitácora.",
  [mockDocumentIds.monthlyExpenses]:
    "Resumen de gastos comunes consolidado 2026. Mes, proveedor, categoría y monto. Enero: Ascensores SPA, mantención, 850000. Febrero: Ascensores SPA, mantención, 850000. Marzo: Servicios Eléctricos Demo, electricidad, 620000. Abril: Bombas Centro Ltda., bombas de agua, 540000.",
  [mockDocumentIds.activeProvidersCsv]:
    "Directorio de proveedores activos. Fila 1, Ascensores SPA, mantención de ascensores. Fila 2, Servicios Eléctricos Demo, mantención eléctrica. Fila 3, Bombas Centro Ltda., mantención de bombas de agua. Fila 4, Seguridad Central, vigilancia nocturna.",
};

const mockDocumentErrorMessageById: Record<string, string> = {
  [mockDocumentIds.technicalReport]:
    "El documento no pudo procesarse porque la extracción de texto falló al leer el archivo original.",
};

function getMockDocumentDetailExtras(
  document: DocumentListItem,
): Pick<
  DocumentDetail,
  "version" | "last_processed_at" | "error_message" | "extracted_text"
> {
  if (document.status === "error") {
    return {
      version: 1,
      last_processed_at: null,
      error_message:
        mockDocumentErrorMessageById[document.id] ??
        "No pudimos procesar este documento.",
      extracted_text: null,
    };
  }

  if (document.status === "ready") {
    return {
      version: 1,
      last_processed_at: document.updated_at,
      error_message: null,
      extracted_text: mockDocumentTextById[document.id] ?? null,
    };
  }

  return {
    version: 1,
    last_processed_at: null,
    error_message: null,
    extracted_text: null,
  };
}

export const mockDocuments: DocumentListItem[] = [
  {
    id: mockDocumentIds.contractAdministration,
    tenant_id: mockTenantId,
    file_name: "Contrato administración Edificio Centro.pdf",
    file_type: "pdf",
    mime_type: "application/pdf",
    file_size: 1320000,
    space_id: mockSpaceIds.legalContracts,
    space: {
      id: mockSpaceIds.legalContracts,
      name: "Contratos",
      path: "Legal/Contratos",
    },
    relative_path:
      "Legal/Contratos/Contrato administración Edificio Centro.pdf",
    source_type: "upload",
    status: "ready",
    uploaded_by: {
      id: mockUserIds.diegoDemo,
      name: userById[mockUserIds.diegoDemo]?.name ?? null,
    },
    page_count: 18,
    sheet_count: null,
    text_length: 48200,
    created_at: "2026-05-31T15:00:00Z",
    updated_at: "2026-05-31T15:08:00Z",
  },
  {
    id: mockDocumentIds.committeeMinutes,
    tenant_id: mockTenantId,
    file_name: "Acta reunión comité abril 2026.docx",
    file_type: "docx",
    mime_type:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    file_size: 430000,
    space_id: mockSpaceIds.general,
    space: {
      id: mockSpaceIds.general,
      name: "General",
      path: "General",
    },
    relative_path: "General/Acta reunión comité abril 2026.docx",
    source_type: "upload",
    status: "ready",
    uploaded_by: {
      id: mockUserIds.mariaDemo,
      name: userById[mockUserIds.mariaDemo]?.name ?? null,
    },
    page_count: 7,
    sheet_count: null,
    text_length: 16400,
    created_at: "2026-05-30T17:00:00Z",
    updated_at: "2026-05-30T17:03:00Z",
  },
  {
    id: mockDocumentIds.providersList,
    tenant_id: mockTenantId,
    file_name: "Listado de proveedores.txt",
    file_type: "txt",
    mime_type: "text/plain",
    file_size: 18000,
    space_id: mockSpaceIds.operations,
    space: {
      id: mockSpaceIds.operations,
      name: "Operaciones",
      path: "Operaciones",
    },
    relative_path: "Operaciones/Listado de proveedores.txt",
    source_type: "upload",
    status: "ready",
    uploaded_by: {
      id: mockUserIds.diegoDemo,
      name: userById[mockUserIds.diegoDemo]?.name ?? null,
    },
    page_count: null,
    sheet_count: null,
    text_length: 13800,
    created_at: "2026-05-29T10:00:00Z",
    updated_at: "2026-05-29T10:01:00Z",
  },
  {
    id: mockDocumentIds.buildingRegulation,
    tenant_id: mockTenantId,
    file_name: "Reglamento copropiedad Edificio Norte.pdf",
    file_type: "pdf",
    mime_type: "application/pdf",
    file_size: 3740000,
    space_id: mockSpaceIds.legal,
    space: {
      id: mockSpaceIds.legal,
      name: "Legal",
      path: "Legal",
    },
    relative_path: "Legal/Reglamento copropiedad Edificio Norte.pdf",
    source_type: "upload",
    status: "ready",
    uploaded_by: {
      id: mockUserIds.mariaDemo,
      name: userById[mockUserIds.mariaDemo]?.name ?? null,
    },
    page_count: 42,
    sheet_count: null,
    text_length: 116300,
    created_at: "2026-05-27T12:30:00Z",
    updated_at: "2026-05-27T12:42:00Z",
  },
  {
    id: mockDocumentIds.elevatorQuote,
    tenant_id: mockTenantId,
    file_name: "Cotización mantención ascensores.pdf",
    file_type: "pdf",
    mime_type: "application/pdf",
    file_size: 920000,
    space_id: mockSpaceIds.operations,
    space: {
      id: mockSpaceIds.operations,
      name: "Operaciones",
      path: "Operaciones",
    },
    relative_path: "Operaciones/Cotización mantención ascensores.pdf",
    source_type: "upload",
    status: "ready",
    uploaded_by: {
      id: mockUserIds.diegoDemo,
      name: userById[mockUserIds.diegoDemo]?.name ?? null,
    },
    page_count: 9,
    sheet_count: null,
    text_length: 21400,
    created_at: "2026-05-24T09:15:00Z",
    updated_at: "2026-05-24T09:19:00Z",
  },
  {
    id: mockDocumentIds.financialReport,
    tenant_id: mockTenantId,
    file_name: "Informe financiero mayo 2026.pdf",
    file_type: "pdf",
    mime_type: "application/pdf",
    file_size: 2480000,
    space_id: mockSpaceIds.finance,
    space: {
      id: mockSpaceIds.finance,
      name: "Finanzas",
      path: "Finanzas",
    },
    relative_path: "Finanzas/Informe financiero mayo 2026.pdf",
    source_type: "upload",
    status: "processing",
    uploaded_by: {
      id: mockUserIds.diegoDemo,
      name: userById[mockUserIds.diegoDemo]?.name ?? null,
    },
    page_count: null,
    sheet_count: null,
    text_length: null,
    created_at: "2026-06-01T14:10:00Z",
    updated_at: "2026-06-01T14:12:00Z",
  },
  {
    id: mockDocumentIds.historicProviderContracts,
    tenant_id: mockTenantId,
    file_name: "Contratos proveedores históricos.docx",
    file_type: "docx",
    mime_type:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    file_size: 780000,
    space_id: mockSpaceIds.legalContracts,
    space: {
      id: mockSpaceIds.legalContracts,
      name: "Contratos",
      path: "Legal/Contratos",
    },
    relative_path: "Legal/Contratos/Contratos proveedores históricos.docx",
    source_type: "upload",
    status: "uploaded",
    uploaded_by: {
      id: mockUserIds.mariaDemo,
      name: userById[mockUserIds.mariaDemo]?.name ?? null,
    },
    page_count: null,
    sheet_count: null,
    text_length: null,
    created_at: "2026-06-01T14:20:00Z",
    updated_at: "2026-06-01T14:20:00Z",
  },
  {
    id: mockDocumentIds.technicalReport,
    tenant_id: mockTenantId,
    file_name: "Informe técnico filtraciones subterráneo.pdf",
    file_type: "pdf",
    mime_type: "application/pdf",
    file_size: 5640000,
    space_id: mockSpaceIds.projectBConfidential,
    space: {
      id: mockSpaceIds.projectBConfidential,
      name: "Proyecto B Confidencial",
      path: "Proyectos/Proyecto B Confidencial",
    },
    relative_path:
      "Proyectos/Proyecto B Confidencial/Informe técnico filtraciones subterráneo.pdf",
    source_type: "upload",
    status: "error",
    uploaded_by: {
      id: mockUserIds.diegoDemo,
      name: userById[mockUserIds.diegoDemo]?.name ?? null,
    },
    page_count: null,
    sheet_count: null,
    text_length: null,
    created_at: "2026-05-28T19:30:00Z",
    updated_at: "2026-05-28T19:33:00Z",
  },
  {
    id: mockDocumentIds.securityAgreement,
    tenant_id: mockTenantId,
    file_name: "Convenio servicio seguridad 2026.pdf",
    file_type: "pdf",
    mime_type: "application/pdf",
    file_size: 1860000,
    space_id: mockSpaceIds.operations,
    space: {
      id: mockSpaceIds.operations,
      name: "Operaciones",
      path: "Operaciones",
    },
    relative_path: "Operaciones/Convenio servicio seguridad 2026.pdf",
    source_type: "upload",
    status: "ready",
    uploaded_by: {
      id: mockUserIds.mariaDemo,
      name: userById[mockUserIds.mariaDemo]?.name ?? null,
    },
    page_count: 15,
    sheet_count: null,
    text_length: 39600,
    created_at: "2026-05-20T11:10:00Z",
    updated_at: "2026-05-20T11:17:00Z",
  },
  {
    id: mockDocumentIds.monthlyExpenses,
    tenant_id: mockTenantId,
    file_name: "Gastos comunes consolidado 2026.xlsx",
    file_type: "xlsx",
    mime_type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    file_size: 1180000,
    space_id: mockSpaceIds.finance,
    space: {
      id: mockSpaceIds.finance,
      name: "Finanzas",
      path: "Finanzas",
    },
    relative_path: "Finanzas/Gastos comunes consolidado 2026.xlsx",
    source_type: "upload",
    status: "ready",
    uploaded_by: {
      id: mockUserIds.mariaDemo,
      name: userById[mockUserIds.mariaDemo]?.name ?? null,
    },
    page_count: null,
    sheet_count: 4,
    text_length: 89300,
    created_at: "2026-05-18T13:40:00Z",
    updated_at: "2026-05-18T13:49:00Z",
  },
  {
    id: mockDocumentIds.activeProvidersCsv,
    tenant_id: mockTenantId,
    file_name: "Directorio proveedores activos.csv",
    file_type: "csv",
    mime_type: "text/csv",
    file_size: 128000,
    space_id: mockSpaceIds.operations,
    space: {
      id: mockSpaceIds.operations,
      name: "Operaciones",
      path: "Operaciones",
    },
    relative_path: "Operaciones/Directorio proveedores activos.csv",
    source_type: "upload",
    status: "ready",
    uploaded_by: {
      id: mockUserIds.diegoDemo,
      name: userById[mockUserIds.diegoDemo]?.name ?? null,
    },
    page_count: null,
    sheet_count: null,
    text_length: 58400,
    created_at: "2026-05-16T09:25:00Z",
    updated_at: "2026-05-16T09:28:00Z",
  },
  
];

export const mockDocumentDetails: DocumentDetail[] =
  mockDocuments.map((document) => ({
    ...document,
    ...getMockDocumentDetailExtras(document),
  }));

const mockDocumentDetailsById = new Map(
  mockDocumentDetails.map((document) => [document.id, document]),
);

export const mockReadyDocuments = mockDocuments.filter(
  (document) => document.status === "ready",
);

export const mockRecentReadyDocuments =
  mockReadyDocuments.slice(0, 3);

export const mockProcessingDocuments = mockDocuments.filter(
  (document) =>
    document.status === "uploaded" ||
    document.status === "processing",
);

export function getMockDocumentById(
  documentId: string,
): DocumentListItem | undefined {
  return mockDocuments.find((document) => document.id === documentId);
}

export function getMockDocumentDetailById(
  documentId: string,
): DocumentDetail | undefined {
  return mockDocumentDetailsById.get(documentId);
}
