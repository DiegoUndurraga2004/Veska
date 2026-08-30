import { mockDocumentIds } from "@/mocks/documents.mock";
import { mockSpaceIds } from "@/mocks/spaces.mock";
import { mockUserIds } from "@/mocks/users.mock";
import type {
  ChatDetail,
  ChatListItem,
} from "@/types/chats";

const demoUser = {
  id: mockUserIds.diegoDemo,
  name: "Usuario Demo",
};

const mariaDemoUser = {
  id: mockUserIds.mariaDemo,
  name: "María Demo",
};

export const mockChats: ChatDetail[] = [
  {
    id: "44444444-4444-4444-8444-444444444441",
    title: "Consulta sobre gastos comunes",
    scope: "all_accessible_spaces",
    space_ids: [],
    document_ids: [],
    created_by: demoUser,
    created_at: "2026-06-01T13:00:00Z",
    updated_at: "2026-06-01T13:24:00Z",
    messages: [
      {
        id: "66666666-6666-4666-8666-666666666611",
        role: "user",
        content:
          "¿Cuánto se pagó por mantención de ascensores durante enero y febrero de 2026?",
        created_at: "2026-06-01T13:20:00Z",
      },
      {
        id: "66666666-6666-4666-8666-666666666612",
        role: "assistant",
        content:
          "Según la planilla consolidada, durante enero y febrero de 2026 se registraron dos pagos de $850.000 por mantención de ascensores, por un total de $1.700.000.",
        created_at: "2026-06-01T13:20:08Z",
        sources: [
          {
            id: "77777777-7777-4777-8777-777777777711",
            document_id:
              mockDocumentIds.monthlyExpenses,
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
          },
        ],
        feedback: null,
      },
    ],
  },
  {
    id: "44444444-4444-4444-8444-444444444442",
    title: "Consulta espacios legales",
    scope: "selected_spaces",
    space_ids: [mockSpaceIds.legal, mockSpaceIds.legalContracts],
    document_ids: [],
    created_by: mariaDemoUser,
    created_at: "2026-05-31T18:00:00Z",
    updated_at: "2026-05-31T18:16:00Z",
    messages: [
      {
        id: "66666666-6666-4666-8666-666666666621",
        role: "user",
        content:
          "¿Cuál es la duración del contrato de administración del Edificio Centro?",
        created_at: "2026-05-31T18:14:00Z",
      },
      {
        id: "66666666-6666-4666-8666-666666666622",
        role: "assistant",
        content:
          "El contrato de administración tiene una vigencia inicial de doce meses y contempla renovación automática, salvo aviso previo dentro del plazo indicado en el documento.",
        created_at: "2026-05-31T18:14:07Z",
        sources: [
          {
            id: "77777777-7777-4777-8777-777777777721",
            document_id:
              mockDocumentIds.contractAdministration,
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
          },
        ],
        feedback: "helpful",
      },
    ],
  },
  {
    id: "44444444-4444-4444-8444-444444444443",
    title: "Historial de proveedores edificio Centro",
    scope: "selected_documents",
    space_ids: [],
    document_ids: [mockDocumentIds.activeProvidersCsv],
    created_by: mariaDemoUser,
    created_at: "2026-05-30T16:00:00Z",
    updated_at: "2026-05-30T16:42:00Z",
    messages: [
      {
        id: "66666666-6666-4666-8666-666666666631",
        role: "user",
        content:
          "¿Qué proveedores activos tienen servicios relacionados con mantención?",
        created_at: "2026-05-30T16:40:00Z",
      },
      {
        id: "66666666-6666-4666-8666-666666666632",
        role: "assistant",
        content:
          "El directorio registra proveedores activos para mantención de ascensores, sistemas eléctricos y bombas de agua.",
        created_at: "2026-05-30T16:40:05Z",
        sources: [
          {
            id: "77777777-7777-4777-8777-777777777731",
            document_id:
              mockDocumentIds.activeProvidersCsv,
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
          },
        ],
        feedback: null,
      },
    ],
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    title: "Consulta sin evidencia suficiente",
    scope: "all_accessible_spaces",
    space_ids: [],
    document_ids: [],
    created_by: demoUser,
    created_at: "2026-05-29T12:00:00Z",
    updated_at: "2026-05-29T12:03:00Z",
    messages: [
      {
        id: "66666666-6666-4666-8666-666666666641",
        role: "user",
        content:
          "¿Cuál es la clave bancaria utilizada para pagar a los proveedores?",
        created_at: "2026-05-29T12:02:00Z",
      },
      {
        id: "66666666-6666-4666-8666-666666666642",
        role: "assistant",
        content:
          "No encontré suficiente información en los documentos disponibles para responder con seguridad.",
        created_at: "2026-05-29T12:02:03Z",
        sources: [],
        feedback: null,
      },
    ],
  },
  {
    id: "44444444-4444-4444-8444-444444444445",
    title: "Revisión de contratos de mantención",
    scope: "selected_spaces",
    space_ids: [mockSpaceIds.legalContracts, mockSpaceIds.operations],
    document_ids: [],
    created_by: mariaDemoUser,
    created_at: "2026-05-28T14:00:00Z",
    updated_at: "2026-05-28T14:34:00Z",
    messages: [
      {
        id: "66666666-6666-4666-8666-666666666651",
        role: "user",
        content:
          "¿Qué cláusulas de renovación automática aparecen en los contratos de mantención?",
        created_at: "2026-05-28T14:31:00Z",
      },
      {
        id: "66666666-6666-4666-8666-666666666652",
        role: "assistant",
        content:
          "Los contratos revisados consideran renovación automática por períodos iguales, salvo aviso previo dentro del plazo pactado.",
        created_at: "2026-05-28T14:31:08Z",
        sources: [
          {
            id: "77777777-7777-4777-8777-777777777741",
            document_id:
              mockDocumentIds.contractAdministration,
            document_name:
              "Contrato administración Edificio Centro.pdf",
            space_id: mockSpaceIds.legalContracts,
            space_path: "Legal/Contratos",
            page_number: 7,
            sheet_name: null,
            cell_range: null,
            snippet:
              "El presente contrato tendrá una vigencia inicial de doce meses, renovándose automáticamente por períodos iguales salvo aviso previo.",
            score: 0.89,
          },
        ],
        feedback: null,
      },
    ],
  },
  {
    id: "44444444-4444-4444-8444-444444444446",
    title: "Resumen de proveedores activos",
    scope: "all_accessible_spaces",
    space_ids: [],
    document_ids: [],
    created_by: demoUser,
    created_at: "2026-05-27T09:00:00Z",
    updated_at: "2026-05-27T09:11:00Z",
    messages: [
      {
        id: "66666666-6666-4666-8666-666666666661",
        role: "user",
        content:
          "¿Qué proveedores activos están disponibles para mantención y seguridad?",
        created_at: "2026-05-27T09:09:00Z",
      },
      {
        id: "66666666-6666-4666-8666-666666666662",
        role: "assistant",
        content:
          "El directorio incluye proveedores para mantención de ascensores, mantenimiento eléctrico, bombas de agua y vigilancia nocturna.",
        created_at: "2026-05-27T09:09:06Z",
        sources: [
          {
            id: "77777777-7777-4777-8777-777777777742",
            document_id:
              mockDocumentIds.providersList,
            document_name:
              "Listado de proveedores.txt",
            space_id: mockSpaceIds.operations,
            space_path: "Operaciones",
            page_number: null,
            sheet_name: null,
            cell_range: "Líneas 1-4",
            snippet:
              "Ascensores SPA | Mantención de ascensores. Servicios Eléctricos Demo | Mantención eléctrica. Bombas Centro Ltda. | Mantención de bombas de agua. Seguridad Central | Vigilancia nocturna.",
            score: 0.87,
          },
        ],
        feedback: "helpful",
      },
    ],
  },
  {
    id: "44444444-4444-4444-8444-444444444447",
    title: "Consulta sobre presupuesto anual",
    scope: "selected_documents",
    space_ids: [],
    document_ids: [mockDocumentIds.monthlyExpenses],
    created_by: mariaDemoUser,
    created_at: "2026-05-26T10:00:00Z",
    updated_at: "2026-05-26T10:26:00Z",
    messages: [
      {
        id: "66666666-6666-4666-8666-666666666671",
        role: "user",
        content:
          "¿Qué tendencias de gasto se ven en el presupuesto anual hasta abril?",
        created_at: "2026-05-26T10:24:00Z",
      },
      {
        id: "66666666-6666-4666-8666-666666666672",
        role: "assistant",
        content:
          "La planilla muestra gastos concentrados en mantención de ascensores, electricidad y bombas de agua durante los primeros meses del año.",
        created_at: "2026-05-26T10:24:07Z",
        sources: [
          {
            id: "77777777-7777-4777-8777-777777777743",
            document_id:
              mockDocumentIds.monthlyExpenses,
            document_name:
              "Gastos comunes consolidado 2026.xlsx",
            space_id: mockSpaceIds.finance,
            space_path: "Finanzas",
            page_number: null,
            sheet_name: "Resumen mensual",
            cell_range: "A1:D6",
            snippet:
              "Enero: Ascensores SPA 850000. Febrero: Ascensores SPA 850000. Marzo: Servicios Eléctricos Demo 620000. Abril: Bombas Centro Ltda. 540000.",
            score: 0.9,
          },
        ],
        feedback: null,
      },
    ],
  },
  {
    id: "44444444-4444-4444-8444-444444444448",
    title: "Historial de actas del comité",
    scope: "all_accessible_spaces",
    space_ids: [],
    document_ids: [],
    created_by: demoUser,
    created_at: "2026-05-25T11:00:00Z",
    updated_at: "2026-05-25T11:05:00Z",
    messages: [
      {
        id: "66666666-6666-4666-8666-666666666681",
        role: "user",
        content:
          "¿Qué temas de seguimiento quedaron pendientes en el acta del comité?",
        created_at: "2026-05-25T11:03:00Z",
      },
      {
        id: "66666666-6666-4666-8666-666666666682",
        role: "assistant",
        content:
          "El acta dejó pendientes la actualización del cronograma de inspecciones y la revisión de los contratos vigentes durante mayo.",
        created_at: "2026-05-25T11:03:05Z",
        sources: [
          {
            id: "77777777-7777-4777-8777-777777777744",
            document_id:
              mockDocumentIds.committeeMinutes,
            document_name:
              "Acta reunión comité abril 2026.docx",
            space_id: mockSpaceIds.general,
            space_path: "General",
            page_number: 2,
            sheet_name: null,
            cell_range: null,
            snippet:
              "Se acordó actualizar el cronograma de inspecciones durante mayo y revisar el estado de los contratos vigentes.",
            score: 0.84,
          },
        ],
        feedback: null,
      },
    ],
  },
];

export const mockRecentChats: ChatListItem[] = mockChats
  .slice(0, 3)
  .map((chat) => ({
    id: chat.id,
    title: chat.title,
    scope: chat.scope,
    created_by: chat.created_by,
    created_at: chat.created_at,
    updated_at: chat.updated_at,
  }));

export function getMockChatById(
  chatId: string,
): ChatDetail | undefined {
  return mockChats.find((chat) => chat.id === chatId);
}
