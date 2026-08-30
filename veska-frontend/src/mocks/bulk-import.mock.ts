import { mockTenantId } from "@/mocks/tenants.mock";
import type { BulkImportJob } from "@/types/bulk-import";


const mockPlatformAdminUserId =
  "33333333-3333-4333-8333-333333333331";

export const mockBulkImportJobs: BulkImportJob[] = [
  {
    id: "88888888-8888-4888-8888-888888888881",
    tenant_id: mockTenantId,
    created_by: mockPlatformAdminUserId,
    status: "pending",
    files_received: 2,
    files_ready: 0,
    files_error: 0,
    spaces_suggested: [
      {
        name: "Finanzas",
        path: "Finanzas",
        files_count: 1,
      },
      {
        name: "Legal",
        path: "Legal",
        files_count: 1,
      },
    ],
    created_at: "2026-06-01T10:00:00Z",
    updated_at: "2026-06-01T10:00:00Z",
  },
  {
    id: "88888888-8888-4888-8888-888888888882",
    tenant_id: mockTenantId,
    created_by: mockPlatformAdminUserId,
    status: "processing",
    files_received: 1200,
    files_ready: 820,
    files_error: 12,
    spaces_suggested: [
      {
        name: "Finanzas",
        path: "Finanzas",
        files_count: 380,
      },
      {
        name: "Legal",
        path: "Legal",
        files_count: 190,
      },
      {
        name: "Operaciones",
        path: "Operaciones",
        files_count: 560,
      },
    ],
    created_at: "2026-06-01T12:00:00Z",
    updated_at: "2026-06-01T12:30:00Z",
  },
  {
    id: "88888888-8888-4888-8888-888888888883",
    tenant_id: mockTenantId,
    created_by: mockPlatformAdminUserId,
    status: "failed",
    files_received: 48,
    files_ready: 41,
    files_error: 7,
    spaces_suggested: [
      {
        name: "Proyectos",
        path: "Proyectos",
        files_count: 18,
      },
      {
        name: "Proyectos/Proyecto A",
        path: "Proyectos/Proyecto A",
        files_count: 23,
      },
    ],
    created_at: "2026-05-30T09:00:00Z",
    updated_at: "2026-05-30T09:40:00Z",
  },
];
