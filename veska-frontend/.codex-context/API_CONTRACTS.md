# Veska API Contracts

## 1. Objetivo

Este documento define los contratos iniciales entre el frontend desarrollado con Next.js y el backend desarrollado con FastAPI para el MVP de Veska.

Su propósito es establecer una estructura común antes de implementar todos los endpoints reales. De esta manera:

- el frontend puede trabajar con mocks realistas;
- el backend puede implementar respuestas predecibles;
- se evitan inconsistencias entre pantallas y API;
- los cambios futuros quedan documentados;
- cualquier desarrollador puede entender qué datos recibe y entrega cada endpoint.

Los contratos pueden evolucionar durante el desarrollo. Cuando se modifique el formato de una request o response, este documento también debe actualizarse.

---

# 2. Convenciones generales

## 2.1 Base URL local

Durante desarrollo local, la API estará disponible en:

```txt
http://localhost:8000
```

Ejemplo:

```txt
GET http://localhost:8000/health
```

---

## 2.2 Formato de datos

La API utiliza JSON para requests y responses, excepto en endpoints que requieren archivos, como la subida de documentos.

Formato habitual:

```http
Content-Type: application/json
```

Para subir archivos:

```http
Content-Type: multipart/form-data
```

---

## 2.3 Identificadores

Todos los recursos deben utilizar UUIDs impredecibles.

Ejemplos de recursos con UUID:

```txt
user_id
tenant_id
document_id
chat_id
message_id
source_id
invitation_id
feedback_id
```

Ejemplo conceptual:

```txt
550e8400-e29b-41d4-a716-446655440000
```

No se deben utilizar IDs incrementales expuestos públicamente, como:

```txt
1
2
3
```

---

## 2.4 Separación por empresa

Cada empresa cliente se representa mediante un `tenant`.

Todos los recursos sensibles deben quedar asociados a un `tenant_id`.

Esto incluye:

```txt
users
tenant_memberships
groups
group_memberships
spaces
space_permissions
documents
document_chunks
chats
messages
message_sources
usage_logs
audit_logs
error_logs
feedback_reports
invitations
tenant_limits
tenant_ai_settings
bulk_import_jobs
```

El frontend puede enviar IDs de recursos, pero el backend siempre debe validar que:

1. el usuario está autenticado;
2. el usuario pertenece al tenant activo;
3. el recurso solicitado pertenece al mismo tenant;
4. el usuario tiene permisos suficientes;
5. el tenant y el usuario están activos.

Nunca debe confiarse únicamente en lo que envía el frontend.

---

## 2.5 Fechas

Las fechas deben enviarse como strings en formato ISO 8601 y preferentemente en UTC.

Ejemplo:

```txt
2026-05-31T18:30:00Z
```

---

## 2.6 Estados de tenant

Estados permitidos para una empresa:

```txt
active
inactive
trial
suspended
deleted
```

---

## 2.7 Estados de usuario

Estados permitidos para un usuario o membresía:

```txt
active
inactive
pending
```

---

## 2.8 Roles iniciales

Roles permitidos en el MVP:

```txt
platform_admin
company_admin
company_user
read_only
```

Descripción:

| Rol              | Descripción                                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `platform_admin` | Dueño o administrador interno de Veska. Puede gestionar empresas cliente y revisar métricas globales.                              |
| `company_admin`  | Administrador de una empresa cliente. Puede gestionar usuarios y documentos de su tenant.                                          |
| `company_user`   | Usuario normal de una empresa. Puede consultar documentos y utilizar el chat según sus permisos.                                   |
| `read_only`      | Rol preparado para restringir acciones de escritura. Su implementación completa puede postergarse si no es necesaria inicialmente. |

Los roles definen qué acciones puede ejecutar una persona. El acceso documental se controla mediante grupos y espacios.

---

## 2.9 Estados de documento

Estados permitidos:

```txt
uploaded
processing
ready
error
deleted
```

Descripción:

| Estado       | Significado                                                  |
| ------------ | ------------------------------------------------------------ |
| `uploaded`   | El archivo fue recibido correctamente.                       |
| `processing` | El documento está siendo procesado.                          |
| `ready`      | El documento ya puede utilizarse como fuente en consultas.   |
| `error`      | Ocurrió un error durante el procesamiento.                   |
| `deleted`    | El documento fue eliminado lógicamente y no debe utilizarse. |

---

## 2.9.1 Formatos documentales permitidos

Formatos permitidos en el MVP:

```txt
pdf
docx
txt
xlsx
csv
```

Reglas iniciales:

- `xlsx` y `csv` se procesan como fuentes tabulares estructuradas;
- `xls`, `xlsm` y `ods` quedan fuera del MVP;
- Veska no ejecuta macros;
- Veska no recalcula fórmulas;
- Veska no interpreta gráficos ni tablas dinámicas durante el MVP.

## 2.9.2 Localizadores de fuente

Cada fuente debe permitir ubicar el fragmento usado dentro del documento original.

Para documentos paginados:

```txt
page_number
```

Para fuentes tabulares:

```txt
sheet_name
cell_range
```

Los campos que no correspondan al formato del documento pueden enviarse como `null`.

---

## 2.10 Alcance de un chat

Valores permitidos:

```txt
all_accessible_spaces
selected_spaces
selected_documents
```

Descripción:

| Scope                   | Significado                                                                  |
| ----------------------- | ---------------------------------------------------------------------------- |
| `all_accessible_spaces` | El chat consulta documentos `ready` dentro de todos los espacios permitidos. |
| `selected_spaces`       | El chat limita la búsqueda a espacios accesibles seleccionados.              |
| `selected_documents`    | El chat limita la búsqueda a documentos accesibles seleccionados.            |

El backend siempre debe validar espacios y documentos autorizados. El frontend no puede ampliar permisos.

---

## 2.11 Roles de mensaje

Valores permitidos:

```txt
user
assistant
system
```

---

## 2.12 Formato general de errores

Los errores visibles para el frontend nunca deben exponer:

- stack traces;
- credenciales;
- queries SQL;
- API keys;
- rutas internas;
- detalles sensibles de infraestructura;
- información perteneciente a otros tenants.

Formato recomendado:

```json
{
  "error": {
    "code": "DOCUMENT_PROCESSING_FAILED",
    "message": "No pudimos procesar este documento. Intenta nuevamente o contacta soporte.",
    "request_id": "request_uuid"
  }
}
```

El campo `request_id` permite relacionar el error visible con un registro técnico interno.

---

# 2.13 Autenticación OAuth empresarial

OAuth con Microsoft y Google será el mecanismo principal de acceso.

El frontend inicia el flujo OAuth mediante Supabase Auth y vuelve a:

```txt
/auth/callback
```

Después del callback, el backend debe validar:

1. email autenticado;
2. usuario activo;
3. membresía activa;
4. tenant activo;
5. rol aplicable.

Las invitaciones y el alta manual de emails siguen disponibles como mecanismos de autorización previa.

OAuth de login no implica acceso a SharePoint, OneDrive, Outlook, Google Drive ni Gmail.

---

# 2.14 Espacios, grupos y permisos

Cada documento debe pertenecer a un espacio.

Los espacios pueden tener jerarquía:

```txt
General
Finanzas
Legal
Operaciones
Proyectos
  Proyecto A
  Proyecto B Confidencial
```

Los subespacios heredan permisos salvo override explícito.

Los grupos permiten asignar acceso documental sin configurar archivo por archivo.

---

# 2.15 Configuración IA por tenant

Cada tenant debe tener una configuración IA.

Valores iniciales permitidos:

```txt
openai
runpod
```

El frontend nunca recibe API keys.

El backend utiliza una interfaz interna como:

```txt
AIService.generate_answer(prompt, tenant_ai_settings)
```

---

# 3. Health check

## GET `/health`

Comprueba que la API está activa.

Este endpoint puede ser público porque no expone información sensible.

### Response `200 OK`

```json
{
  "status": "ok",
  "environment": "development",
  "service": "veska-backend"
}
```

---

# 4. Usuario autenticado

## GET `/me`

Retorna la información del usuario autenticado, su tenant activo y su rol.

### Requiere autenticación

Sí.

### Response `200 OK`

```json
{
  "id": "user_uuid",
  "email": "diego@example.com",
  "name": "Diego Undurraga",
  "avatar_url": null,
  "auth_provider": "microsoft",
  "status": "active",
  "current_tenant": {
    "id": "tenant_uuid",
    "name": "Demo Company",
    "slug": "demo-company",
    "status": "active"
  },
  "role": "company_admin"
}
```

### Errores posibles

```txt
401 Unauthorized
403 Forbidden
```

---

# 5. Tenant actual

## GET `/tenant/current`

Retorna la empresa activa del usuario autenticado.

### Requiere autenticación

Sí.

### Response `200 OK`

```json
{
  "id": "tenant_uuid",
  "name": "Demo Company",
  "slug": "demo-company",
  "status": "active",
  "plan": {
    "id": "plan_uuid",
    "name": "basic"
  },
  "limits": {
    "max_users": 10,
    "max_documents": 500,
    "max_storage_gb": 10,
    "max_requests_month": 2000,
    "max_file_size_mb": 25,
    "max_bulk_import_files": 5000,
    "max_bulk_import_total_size_mb": 2048
  },
  "ai_settings": {
    "provider": "openai",
    "privacy_tier": "standard"
  }
}
```

### Errores posibles

```txt
401 Unauthorized
403 Forbidden
404 Tenant not found
```

---

# 6. Documentos

## 6.1 GET `/documents`

Retorna los documentos visibles para el usuario autenticado dentro de su tenant.

### Requiere autenticación

Sí.

### Query params opcionales

| Parámetro   | Tipo      | Descripción                         |
| ----------- | --------- | ----------------------------------- |
| `search`    | `string`  | Búsqueda por nombre de archivo.     |
| `file_type` | `string`  | Filtra por `pdf`, `docx`, `txt`, `xlsx` o `csv`. |
| `status`    | `string`  | Filtra por estado de procesamiento. |
| `space_id`  | `uuid`    | Filtra por espacio accesible.        |
| `page`      | `integer` | Página actual de resultados.        |
| `page_size` | `integer` | Cantidad de resultados por página.  |

### Ejemplo de request

```txt
GET /documents?search=contrato&file_type=pdf&status=ready&page=1&page_size=20
```

### Response `200 OK`

```json
{
  "items": [
    {
      "id": "document_uuid",
      "tenant_id": "tenant_uuid",
      "file_name": "Contrato arriendo 2024.pdf",
      "file_type": "pdf",
      "mime_type": "application/pdf",
      "file_size": 1240000,
      "status": "ready",
      "space": {
        "id": "space_uuid",
        "name": "Legal",
        "path": "Legal/Contratos"
      },
      "relative_path": "Legal/Contratos/Contrato arriendo 2024.pdf",
      "uploaded_by": {
        "id": "user_uuid",
        "name": "Diego Undurraga"
      },
      "page_count": 12,
      "sheet_count": null,
      "text_length": 45000,
      "created_at": "2026-05-31T18:00:00Z",
      "updated_at": "2026-05-31T18:05:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20
}
```

### Errores posibles

```txt
401 Unauthorized
403 Forbidden
```

---

## 6.2 POST `/documents/upload`

Sube un documento para procesamiento.

### Requiere autenticación

Sí.

### Requiere permisos

El usuario debe tener permiso para subir documentos.

### Content type

```http
multipart/form-data
```

### Campos

| Campo  | Tipo   | Obligatorio | Descripción              |
| ------ | ------ | ----------- | ------------------------ |
| `file`          | `file`   | Sí          | Archivo PDF, DOCX, TXT, XLSX o CSV. |
| `space_id`      | `uuid`   | Sí          | Espacio accesible al que pertenecerá el documento. |
| `relative_path` | `string` | No          | Ruta relativa preservada durante importación masiva. |

### Response `201 Created`

```json
{
  "id": "document_uuid",
  "file_name": "Contrato arriendo 2024.pdf",
  "status": "uploaded",
  "message": "Documento recibido correctamente. El procesamiento comenzará pronto."
}
```

### Validaciones mínimas del backend

El backend debe validar:

- sesión activa;
- tenant activo;
- permisos del usuario;
- acceso al espacio indicado;
- extensión permitida;
- MIME type;
- tamaño máximo;
- archivo no vacío;
- nombre del archivo;
- límites del tenant;
- storage disponible;
- posibles duplicados básicos;
- límites tabulares para XLSX y CSV;
- rechazo de macros y formatos no permitidos;
- cantidad máxima de hojas, filas, columnas y celdas no vacías;
- tiempo máximo de parsing.

### Errores posibles

```txt
400 Invalid file
401 Unauthorized
403 Forbidden
409 Duplicate document
413 File too large
422 Spreadsheet limit exceeded
422 Unsupported spreadsheet format
429 Too many requests
```

---

## 6.2.1 POST `/documents/bulk-upload`

Crea una importación masiva preservando estructura de carpetas.

### Requiere autenticación

Sí.

### Requiere permisos

`platform_admin` durante el onboarding inicial. Puede habilitarse posteriormente para `company_admin`.

### Objetivo

Permitir subir una carpeta completa o un ZIP seguro sin configurar documentos uno por uno.

### Request conceptual

```json
{
  "tenant_id": "tenant_uuid",
  "import_mode": "folder",
  "files": [
    {
      "file": "binary",
      "relative_path": "Finanzas/2026/reporte.xlsx"
    },
    {
      "file": "binary",
      "relative_path": "Legal/Contratos/contrato.pdf"
    }
  ]
}
```

La implementación concreta puede usar múltiples partes `multipart/form-data`, selección de carpeta en navegador o ZIP seguro.

### Response `202 Accepted`

```json
{
  "job_id": "bulk_import_job_uuid",
  "status": "pending",
  "files_received": 2,
  "message": "Importación recibida. La estructura de carpetas será analizada."
}
```

### Reglas

- preservar rutas relativas;
- validar cada archivo;
- limitar cantidad de archivos;
- limitar profundidad;
- impedir path traversal;
- impedir zip bombs;
- detectar carpetas principales;
- proponer espacios;
- registrar errores por archivo.

---

## 6.2.2 GET `/documents/bulk-upload/{job_id}`

Retorna estado de importación masiva.

### Response `200 OK`

```json
{
  "id": "bulk_import_job_uuid",
  "status": "processing",
  "files_received": 1200,
  "files_ready": 820,
  "files_error": 12,
  "spaces_suggested": [
    {
      "name": "Finanzas",
      "path": "Finanzas",
      "files_count": 380
    },
    {
      "name": "Legal",
      "path": "Legal",
      "files_count": 190
    }
  ]
}
```

---

## 6.3 GET `/documents/{document_id}`

Retorna metadata detallada de un documento.

### Requiere autenticación

Sí.

### Response `200 OK`

```json
{
  "id": "document_uuid",
  "tenant_id": "tenant_uuid",
  "file_name": "Contrato arriendo 2024.pdf",
  "file_type": "pdf",
  "mime_type": "application/pdf",
  "file_size": 1240000,
  "storage_path": "tenants/tenant_uuid/documents/document_uuid/Contrato arriendo 2024.pdf",
  "relative_path": "Legal/Contratos/Contrato arriendo 2024.pdf",
  "space": {
    "id": "space_uuid",
    "name": "Legal",
    "path": "Legal/Contratos"
  },
  "source_type": "upload",
  "external_provider": null,
  "external_id": null,
  "status": "ready",
  "error_message": null,
  "page_count": 12,
  "sheet_count": null,
  "text_length": 45000,
  "uploaded_by": {
    "id": "user_uuid",
    "name": "Diego Undurraga"
  },
  "created_at": "2026-05-31T18:00:00Z",
  "updated_at": "2026-05-31T18:05:00Z"
}
```

### Errores posibles

```txt
401 Unauthorized
403 Forbidden
404 Document not found
```

---

## 6.4 GET `/documents/{document_id}/status`

Retorna el estado de procesamiento de un documento.

Este endpoint será utilizado por el frontend para consultar periódicamente si un documento terminó de procesarse.

### Requiere autenticación

Sí.

### Response `200 OK`

```json
{
  "id": "document_uuid",
  "status": "processing",
  "error_message": null,
  "updated_at": "2026-05-31T18:05:00Z"
}
```

### Ejemplo de documento con error

```json
{
  "id": "document_uuid",
  "status": "error",
  "error_message": "No pudimos procesar este documento. Intenta nuevamente o contacta soporte.",
  "updated_at": "2026-05-31T18:05:00Z"
}
```

### Errores posibles

```txt
401 Unauthorized
403 Forbidden
404 Document not found
```

---

## 6.5 GET `/documents/{document_id}/signed-url`

Retorna una URL firmada temporal para abrir el archivo original privado.

### Requiere autenticación

Sí.

### Response `200 OK`

```json
{
  "document_id": "document_uuid",
  "signed_url": "temporary_signed_url",
  "expires_in_seconds": 300
}
```

### Reglas

- El archivo no debe ser público.
- La URL debe expirar.
- El backend debe validar permisos antes de generarla.
- El backend debe comprobar que el documento pertenece al mismo tenant del usuario.

### Errores posibles

```txt
401 Unauthorized
403 Forbidden
404 Document not found
```

---

## 6.6 DELETE `/documents/{document_id}`

Realiza una eliminación lógica del documento.

### Requiere autenticación

Sí.

### Requiere permisos

Sí. El backend debe verificar que el usuario tenga permisos suficientes.

### Response `200 OK`

```json
{
  "id": "document_uuid",
  "status": "deleted",
  "message": "Documento eliminado correctamente."
}
```

### Reglas

- El documento debe marcarse como `deleted`.
- Sus chunks no deben utilizarse en consultas posteriores.
- La acción debe registrarse en audit logs.
- La eliminación física del archivo puede realizarse inmediatamente o mediante un proceso posterior.

### Errores posibles

```txt
401 Unauthorized
403 Forbidden
404 Document not found
```

---

# 7. Chats

## 7.1 GET `/chats`

Retorna los chats visibles para el usuario autenticado dentro del tenant actual.

### Requiere autenticación

Sí.

### Query params opcionales

| Parámetro   | Tipo      | Descripción                        |
| ----------- | --------- | ---------------------------------- |
| `search`    | `string`  | Búsqueda por título.               |
| `page`      | `integer` | Página actual.                     |
| `page_size` | `integer` | Cantidad de resultados por página. |

### Response `200 OK`

```json
{
  "items": [
    {
      "id": "chat_uuid",
      "title": "Consulta gastos comunes",
      "scope": "all_accessible_spaces",
      "created_by": {
        "id": "user_uuid",
        "name": "Diego Undurraga"
      },
      "created_at": "2026-05-31T18:00:00Z",
      "updated_at": "2026-05-31T18:15:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20
}
```

### Errores posibles

```txt
401 Unauthorized
403 Forbidden
```

---

## 7.2 POST `/chats`

Crea un nuevo chat.

### Requiere autenticación

Sí.

### Request para consultar todos los documentos

```json
{
  "title": "Consulta gastos comunes",
  "scope": "all_accessible_spaces",
  "document_ids": []
}
```

### Request para consultar espacios específicos

```json
{
  "title": "Consulta Proyecto A",
  "scope": "selected_spaces",
  "space_ids": ["space_uuid"],
  "document_ids": []
}
```

### Request para consultar documentos específicos

```json
{
  "title": "Consulta sobre contrato de arriendo",
  "scope": "selected_documents",
  "space_ids": [],
  "document_ids": ["document_uuid"]
}
```

### Response `201 Created`

```json
{
  "id": "chat_uuid",
  "title": "Consulta gastos comunes",
  "scope": "all_accessible_spaces",
  "space_ids": [],
  "document_ids": [],
  "created_at": "2026-05-31T18:00:00Z",
  "updated_at": "2026-05-31T18:00:00Z"
}
```

### Reglas

Si `scope` es `selected_spaces`, el backend debe validar que:

- `space_ids` no esté vacío;
- todos los espacios pertenezcan al tenant activo;
- el usuario tenga acceso efectivo a cada espacio.

Si `scope` es `selected_documents`, el backend debe validar que:

- `document_ids` no esté vacío;
- todos los documentos existan;
- todos pertenezcan al tenant activo;
- todos estén en estado `ready`;
- el usuario tenga permiso efectivo para consultarlos según espacio, herencia y overrides.

### Errores posibles

```txt
400 Invalid scope
401 Unauthorized
403 Forbidden
404 Document not found
```

---

## 7.3 GET `/chats/{chat_id}`

Retorna un chat con sus mensajes y metadata básica.

### Requiere autenticación

Sí.

### Response `200 OK`

```json
{
  "id": "chat_uuid",
  "title": "Consulta gastos comunes",
  "scope": "selected_documents",
  "space_ids": [],
  "document_ids": ["document_uuid"],
  "created_by": {
    "id": "user_uuid",
    "name": "Diego Undurraga"
  },
  "messages": [
    {
      "id": "message_uuid",
      "role": "user",
      "content": "¿Qué dice el contrato sobre gastos comunes?",
      "created_at": "2026-05-31T18:20:00Z"
    },
    {
      "id": "assistant_message_uuid",
      "role": "assistant",
      "content": "Según el contrato, los gastos comunes serán responsabilidad del arrendatario.",
      "created_at": "2026-05-31T18:20:08Z",
      "sources": [
        {
          "id": "source_uuid",
          "document_id": "document_uuid",
          "document_name": "Contrato arriendo 2024.pdf",
          "space_id": "space_uuid",
          "space_path": "Legal/Contratos",
          "page_number": 4,
          "sheet_name": null,
          "cell_range": null,
          "snippet": "Los gastos comunes serán responsabilidad del arrendatario.",
          "score": 0.87
        }
      ]
    }
  ],
  "created_at": "2026-05-31T18:00:00Z",
  "updated_at": "2026-05-31T18:20:08Z"
}
```

### Errores posibles

```txt
401 Unauthorized
403 Forbidden
404 Chat not found
```

---

## 7.4 POST `/chats/{chat_id}/messages`

Envía una pregunta y retorna una respuesta basada en documentos.

### Requiere autenticación

Sí.

### Request

```json
{
  "content": "¿Qué dice el contrato sobre gastos comunes?",
  "scope": "selected_documents",
  "space_ids": [],
  "document_ids": ["document_uuid"]
}
```

### Response `201 Created`

```json
{
  "user_message": {
    "id": "user_message_uuid",
    "role": "user",
    "content": "¿Qué dice el contrato sobre gastos comunes?",
    "created_at": "2026-05-31T18:20:00Z"
  },
  "assistant_message": {
    "id": "assistant_message_uuid",
    "role": "assistant",
    "content": "Según el contrato, los gastos comunes serán responsabilidad del arrendatario.",
    "created_at": "2026-05-31T18:20:08Z",
    "sources": [
      {
        "id": "source_uuid",
        "document_id": "document_uuid",
        "document_name": "Contrato arriendo 2024.pdf",
        "space_id": "space_uuid",
        "space_path": "Legal/Contratos",
        "page_number": 4,
        "sheet_name": null,
        "cell_range": null,
        "snippet": "Los gastos comunes serán responsabilidad del arrendatario.",
        "score": 0.87
      }
    ]
  },
  "metadata": {
    "model_used": "pending",
    "latency_ms": 8000,
    "token_input": 1800,
    "token_output": 260,
    "cost_estimate": 0.012
  }
}
```

### Ejemplo de fuente tabular

Cuando una respuesta use una planilla, la fuente debe poder apuntar a hoja y rango de celdas:

```json
{
  "id": "source_uuid",
  "document_id": "document_uuid",
  "document_name": "Gastos_Comunes_2026.xlsx",
  "space_id": "space_uuid",
  "space_path": "Operaciones/Gastos comunes",
  "page_number": null,
  "sheet_name": "Gastos 2026",
  "cell_range": "A1:D4",
  "snippet": "Mes: Enero | Proveedor: Ascensores SPA | Categoría: Mantención | Monto: 850000",
  "score": 0.89
}
```

### Reglas

Antes de generar una respuesta, el backend debe validar:

- sesión activa;
- tenant activo;
- usuario activo;
- chat perteneciente al tenant;
- largo máximo de la pregunta;
- input no vacío;
- scope válido;
- documentos seleccionados permitidos;
- límites de uso del tenant;
- rate limiting;
- estado `ready` de los documentos consultados.

### Respuesta sin evidencia suficiente

Cuando no existan fuentes suficientemente relevantes, la respuesta debe ser controlada:

```json
{
  "user_message": {
    "id": "user_message_uuid",
    "role": "user",
    "content": "¿Cuál es el número de cuenta bancaria del proveedor?",
    "created_at": "2026-05-31T18:20:00Z"
  },
  "assistant_message": {
    "id": "assistant_message_uuid",
    "role": "assistant",
    "content": "No encontré suficiente evidencia en los documentos disponibles para responder con seguridad.",
    "created_at": "2026-05-31T18:20:03Z",
    "sources": []
  },
  "metadata": {
    "model_used": "pending",
    "latency_ms": 3000,
    "token_input": 500,
    "token_output": 25,
    "cost_estimate": 0.002
  }
}
```

### Errores posibles

```txt
400 Invalid request
401 Unauthorized
403 Forbidden
404 Chat not found
429 Too many requests
502 AI provider error
504 AI provider timeout
```

---

## 7.5 DELETE `/chats/{chat_id}`

Realiza una eliminación lógica del chat.

### Requiere autenticación

Sí.

### Response `200 OK`

```json
{
  "id": "chat_uuid",
  "status": "deleted",
  "message": "Chat eliminado correctamente."
}
```

### Reglas

- El chat solo puede eliminarse dentro del tenant del usuario.
- La eliminación puede ser lógica para preservar auditoría.
- Los mensajes eliminados no deben mostrarse en la interfaz habitual.

---

# 8. Feedback de respuestas

## POST `/messages/{message_id}/feedback`

Registra si una respuesta fue útil, no útil o problemática.

### Requiere autenticación

Sí.

### Valores permitidos para `type`

```txt
helpful
not_helpful
problematic
```

### Request

```json
{
  "type": "not_helpful",
  "comment": "La fuente citada no responde completamente la pregunta."
}
```

### Response `201 Created`

```json
{
  "status": "recorded"
}
```

### Reglas

El backend debe guardar:

- tenant;
- usuario;
- chat;
- mensaje;
- tipo de feedback;
- comentario opcional;
- timestamp.

---

# 8.1 Espacios y grupos

Los siguientes endpoints requieren autenticación. Las operaciones de escritura requieren permisos administrativos.

## GET `/spaces`

Retorna espacios visibles para el usuario autenticado.

### Response `200 OK`

```json
{
  "items": [
    {
      "id": "space_uuid",
      "name": "Proyectos",
      "path": "Proyectos",
      "parent_space_id": null,
      "visibility": "restricted",
      "inherits_permissions": true
    }
  ]
}
```

## POST `/spaces`

Crea un espacio.

### Request

```json
{
  "name": "Finanzas",
  "parent_space_id": null,
  "visibility": "restricted",
  "inherits_permissions": true
}
```

## PATCH `/spaces/{space_id}`

Actualiza nombre, jerarquía o herencia.

## GET `/groups`

Lista grupos del tenant.

## POST `/groups`

Crea un grupo.

### Request

```json
{
  "name": "Contabilidad",
  "description": "Acceso documental del equipo contable"
}
```

## POST `/groups/{group_id}/members`

Agrega usuarios a un grupo.

### Request

```json
{
  "user_ids": ["user_uuid"]
}
```

## PUT `/spaces/{space_id}/permissions`

Configura permisos de un espacio.

### Request

```json
{
  "inherits_permissions": false,
  "group_ids": ["group_uuid"],
  "user_ids": ["user_uuid"],
  "access_level": "read"
}
```

### Reglas

- validar tenant;
- registrar cambios en audit logs;
- aplicar herencia cuando corresponda;
- impedir que el frontend amplíe permisos;
- permitir overrides explícitos en subespacios;
- exigir que cada permiso apunte a un grupo o a un usuario específico.

---

# 9. Administración de empresa

Los siguientes endpoints requieren autenticación y rol `company_admin`, excepto cuando se indique lo contrario.

Además de usuarios, el admin puede revisar espacios, grupos y permisos simples de su tenant.

## 9.1 GET `/tenant/users`

Retorna usuarios del tenant actual.

### Response `200 OK`

```json
{
  "items": [
    {
      "id": "user_uuid",
      "email": "usuario@example.com",
      "name": "Nombre Usuario",
      "avatar_url": null,
      "role": "company_user",
      "status": "active",
      "created_at": "2026-05-31T18:00:00Z"
    }
  ],
  "total": 1
}
```

---

## 9.2 POST `/tenant/invitations`

Crea una invitación para un nuevo usuario.

### Request

```json
{
  "email": "nuevo.usuario@example.com",
  "role": "company_user"
}
```

### Response `201 Created`

```json
{
  "id": "invitation_uuid",
  "email": "nuevo.usuario@example.com",
  "role": "company_user",
  "status": "pending",
  "expires_at": "2026-06-02T18:00:00Z"
}
```

### Reglas

La invitación debe:

- asociarse al tenant;
- tener expiración;
- ser de un solo uso;
- guardar rol inicial;
- respetar límites del plan;
- registrarse en audit logs.

---

## 9.2.1 POST `/tenant/users/import-csv`

Importa usuarios autorizados desde CSV.

### Requiere permisos

`company_admin` o `platform_admin`.

### Formato esperado

```csv
email,name,role,group
juan@empresa.cl,Juan Pérez,company_user,Operaciones
maria@empresa.cl,María Soto,company_admin,Gerencia
```

### Response `202 Accepted`

```json
{
  "status": "accepted",
  "users_received": 2,
  "message": "Usuarios autorizados correctamente."
}
```

### Reglas

- validar email;
- validar rol permitido;
- crear membresía pendiente;
- crear o asociar grupo;
- registrar auditoría;
- permitir vinculación posterior mediante OAuth.

---

## 9.3 PATCH `/tenant/users/{user_id}`

Actualiza el estado o rol de un usuario del tenant actual.

### Request

```json
{
  "role": "company_user",
  "status": "inactive"
}
```

### Response `200 OK`

```json
{
  "id": "user_uuid",
  "role": "company_user",
  "status": "inactive",
  "updated_at": "2026-05-31T18:00:00Z"
}
```

### Reglas

- El usuario modificado debe pertenecer al mismo tenant.
- El backend debe impedir modificaciones no autorizadas.
- La acción debe registrarse en audit logs.

---

## 9.4 DELETE `/tenant/users/{user_id}`

Desactiva lógicamente un usuario del tenant actual.

### Response `200 OK`

```json
{
  "id": "user_uuid",
  "status": "inactive",
  "message": "Usuario desactivado correctamente."
}
```

### Reglas

Para el MVP conviene desactivar usuarios antes que eliminarlos físicamente.

---

## 9.5 GET `/tenant/usage`

Retorna métricas básicas del tenant actual.

### Response `200 OK`

```json
{
  "tenant_id": "tenant_uuid",
  "active_users": 8,
  "documents_count": 142,
  "storage_used_bytes": 524288000,
  "requests_current_month": 734,
  "average_latency_ms": 6200,
  "errors_current_month": 3
}
```

---

# 10. Administración de plataforma

Los siguientes endpoints requieren rol `platform_admin`.

Un administrador de empresa nunca debe tener acceso a información de otras empresas.

## 10.1 GET `/platform/tenants`

Retorna empresas registradas.

### Response `200 OK`

```json
{
  "items": [
    {
      "id": "tenant_uuid",
      "name": "Demo Company",
      "slug": "demo-company",
      "status": "active",
      "plan": {
        "id": "plan_uuid",
        "name": "basic"
      },
      "active_users": 8,
      "documents_count": 142,
      "storage_used_bytes": 524288000,
      "requests_current_month": 734,
      "created_at": "2026-05-31T18:00:00Z"
    }
  ],
  "total": 1
}
```

---

## 10.2 POST `/platform/tenants`

Crea una nueva empresa.

### Request

```json
{
  "name": "Demo Company",
  "slug": "demo-company",
  "plan_id": "plan_uuid"
}
```

### Response `201 Created`

```json
{
  "id": "tenant_uuid",
  "name": "Demo Company",
  "slug": "demo-company",
  "status": "active",
  "plan_id": "plan_uuid",
  "created_at": "2026-05-31T18:00:00Z"
}
```

---

## 10.3 PATCH `/platform/tenants/{tenant_id}`

Actualiza datos o estado de una empresa.

### Request

```json
{
  "status": "suspended"
}
```

### Response `200 OK`

```json
{
  "id": "tenant_uuid",
  "status": "suspended",
  "updated_at": "2026-05-31T18:00:00Z"
}
```

---

## 10.4 POST `/platform/tenants/{tenant_id}/admin`

Crea o asigna el administrador inicial de una empresa.

### Request

```json
{
  "email": "admin@example.com",
  "name": "Administrador Empresa"
}
```

### Response `201 Created`

```json
{
  "tenant_id": "tenant_uuid",
  "invitation_id": "invitation_uuid",
  "email": "admin@example.com",
  "role": "company_admin",
  "status": "pending"
}
```

---

## 10.4.1 PATCH `/platform/tenants/{tenant_id}/ai-settings`

Configura proveedor IA del tenant.

### Request

```json
{
  "provider": "openai",
  "model_name": "configured-model",
  "privacy_tier": "standard",
  "enabled": true
}
```

### Reglas

- solo `platform_admin`;
- no retornar API keys;
- registrar cambio en audit logs.

---

## 10.4.2 GET `/platform/tenants/{tenant_id}/setup`

Retorna progreso del onboarding asistido.

### Response `200 OK`

```json
{
  "tenant_id": "tenant_uuid",
  "steps": {
    "company": "completed",
    "ai_provider": "completed",
    "admin": "completed",
    "users": "pending",
    "groups": "pending",
    "files": "pending",
    "spaces": "pending",
    "permissions": "pending",
    "processing": "pending",
    "activation": "pending"
  }
}
```

---

## 10.5 GET `/platform/usage`

Retorna métricas agregadas por empresa.

### Response `200 OK`

```json
{
  "items": [
    {
      "tenant_id": "tenant_uuid",
      "tenant_name": "Demo Company",
      "active_users": 8,
      "documents_count": 142,
      "storage_used_bytes": 524288000,
      "requests_current_month": 734,
      "average_latency_ms": 6200,
      "errors_current_month": 3,
      "estimated_ai_cost": 18.42
    }
  ]
}
```

---

## 10.6 GET `/platform/errors`

Retorna errores técnicos básicos para administración interna.

### Response `200 OK`

```json
{
  "items": [
    {
      "id": "error_uuid",
      "tenant_id": "tenant_uuid",
      "user_id": "user_uuid",
      "endpoint": "/documents/upload",
      "error_type": "DOCUMENT_PROCESSING_FAILED",
      "request_id": "request_uuid",
      "created_at": "2026-05-31T18:00:00Z"
    }
  ],
  "total": 1
}
```

### Reglas

Los detalles técnicos completos deben permanecer restringidos a administración interna.

---

## 10.7 GET `/platform/costs`

Retorna costos estimados por empresa.

### Response `200 OK`

```json
{
  "items": [
    {
      "tenant_id": "tenant_uuid",
      "tenant_name": "Demo Company",
      "ai_provider": "openai",
      "model_name": "configured-model",
      "estimated_ai_cost": 18.42,
      "estimated_embedding_cost": 2.15,
      "estimated_storage_cost": 0.11,
      "estimated_total_cost": 20.68,
      "period": "2026-05"
    }
  ]
}
```

---

# 11. Endpoints preparados para implementación posterior

Los siguientes endpoints no son obligatorios para el primer bloque funcional, pero deben quedar considerados para mantener una arquitectura escalable.

## Documentos

```txt
POST /documents/{document_id}/reprocess
GET  /documents/{document_id}/search
```

## Chats

```txt
POST /messages/{message_id}/regenerate
PATCH /chats/{chat_id}
```

## Usuario

```txt
PATCH /me
POST  /me/avatar
```

## Empresa

```txt
GET   /tenant/audit-logs
PATCH /tenant/settings
```

## Conectores externos futuros

```txt
POST  /integrations/microsoft/connect
POST  /integrations/google/connect
POST  /integrations/{integration_id}/sync
GET   /integrations/{integration_id}/status
```

Estos endpoints quedan fuera del MVP. Se documentan solo para evitar cerrar la arquitectura.

## Plataforma

```txt
PATCH /platform/tenants/{tenant_id}/limits
PATCH /platform/tenants/{tenant_id}/plan
```

---

# 12. Tabla resumida de endpoints MVP

| Método   | Ruta                                  | Objetivo                         | Autenticación | Rol mínimo          |
| -------- | ------------------------------------- | -------------------------------- | ------------- | ------------------- |
| `GET`    | `/health`                             | Verificar que la API esté activa | No            | Público             |
| `GET`    | `/me`                                 | Obtener usuario autenticado      | Sí            | Usuario activo      |
| `GET`    | `/tenant/current`                     | Obtener tenant actual            | Sí            | Usuario activo      |
| `GET`    | `/documents`                          | Listar documentos                | Sí            | Usuario activo      |
| `POST`   | `/documents/upload`                   | Subir documento                  | Sí            | Usuario con permiso |
| `GET`    | `/documents/{document_id}`            | Obtener metadata de documento    | Sí            | Usuario con acceso  |
| `GET`    | `/documents/{document_id}/status`     | Consultar procesamiento          | Sí            | Usuario con acceso  |
| `GET`    | `/documents/{document_id}/signed-url` | Abrir archivo privado            | Sí            | Usuario con acceso  |
| `DELETE` | `/documents/{document_id}`            | Eliminar documento               | Sí            | Usuario con permiso |
| `GET`    | `/chats`                              | Listar chats                     | Sí            | Usuario activo      |
| `POST`   | `/chats`                              | Crear chat                       | Sí            | Usuario activo      |
| `GET`    | `/chats/{chat_id}`                    | Ver historial de chat            | Sí            | Usuario con acceso  |
| `POST`   | `/chats/{chat_id}/messages`           | Enviar pregunta                  | Sí            | Usuario activo      |
| `DELETE` | `/chats/{chat_id}`                    | Eliminar chat                    | Sí            | Usuario con acceso  |
| `POST`   | `/messages/{message_id}/feedback`     | Evaluar respuesta                | Sí            | Usuario activo      |
| `POST`   | `/documents/bulk-upload`               | Importar carpeta o ZIP seguro    | Sí            | `platform_admin` inicial |
| `GET`    | `/documents/bulk-upload/{job_id}`      | Revisar importación masiva       | Sí            | Usuario con permiso |
| `GET`    | `/spaces`                              | Listar espacios accesibles       | Sí            | Usuario activo      |
| `POST`   | `/spaces`                              | Crear espacio                    | Sí            | `company_admin`     |
| `PATCH`  | `/spaces/{space_id}`                   | Editar espacio                   | Sí            | `company_admin`     |
| `GET`    | `/groups`                              | Listar grupos                    | Sí            | `company_admin`     |
| `POST`   | `/groups`                              | Crear grupo                      | Sí            | `company_admin`     |
| `POST`   | `/groups/{group_id}/members`           | Agregar miembros a grupo         | Sí            | `company_admin`     |
| `PUT`    | `/spaces/{space_id}/permissions`       | Configurar permisos espacio      | Sí            | `company_admin`     |
| `GET`    | `/tenant/users`                       | Listar usuarios empresa          | Sí            | `company_admin`     |
| `POST`   | `/tenant/invitations`                 | Invitar usuario                  | Sí            | `company_admin`     |
| `POST`   | `/tenant/users/import-csv`            | Importar usuarios autorizados    | Sí            | `company_admin`     |
| `PATCH`  | `/tenant/users/{user_id}`             | Editar rol o estado              | Sí            | `company_admin`     |
| `DELETE` | `/tenant/users/{user_id}`             | Desactivar usuario               | Sí            | `company_admin`     |
| `GET`    | `/tenant/usage`                       | Ver métricas empresa             | Sí            | `company_admin`     |
| `GET`    | `/platform/tenants`                   | Listar empresas                  | Sí            | `platform_admin`    |
| `POST`   | `/platform/tenants`                   | Crear empresa                    | Sí            | `platform_admin`    |
| `PATCH`  | `/platform/tenants/{tenant_id}`       | Editar empresa                   | Sí            | `platform_admin`    |
| `POST`   | `/platform/tenants/{tenant_id}/admin` | Crear admin inicial              | Sí            | `platform_admin`    |
| `PATCH`  | `/platform/tenants/{tenant_id}/ai-settings` | Configurar proveedor IA tenant | Sí         | `platform_admin`    |
| `GET`    | `/platform/tenants/{tenant_id}/setup` | Revisar progreso setup           | Sí            | `platform_admin`    |
| `GET`    | `/platform/usage`                     | Ver métricas globales            | Sí            | `platform_admin`    |
| `GET`    | `/platform/errors`                    | Ver errores básicos              | Sí            | `platform_admin`    |
| `GET`    | `/platform/costs`                     | Ver costos estimados             | Sí            | `platform_admin`    |

---

# 13. Regla de mantenimiento

Cada vez que se agregue, elimine o modifique un endpoint:

1. actualizar este archivo;
2. actualizar los schemas Pydantic correspondientes en FastAPI;
3. actualizar los tipos TypeScript correspondientes en Next.js;
4. revisar los mocks utilizados por el frontend;
5. verificar que la documentación automática de FastAPI coincida con este contrato;
6. agregar o actualizar pruebas cuando corresponda.

Este documento funciona como contrato inicial humano. La validación real deberá implementarse mediante schemas, permisos y tests automatizados.
