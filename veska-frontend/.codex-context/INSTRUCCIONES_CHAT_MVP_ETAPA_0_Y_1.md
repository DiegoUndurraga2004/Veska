# Instrucciones para continuar el chat de desarrollo MVP

Copia este mensaje en el chat donde estás construyendo Veska:

---

Necesitamos actualizar la Etapa 0 y la Etapa 1 del frontend de Veska antes de seguir avanzando.

Ya actualizamos las fuentes oficiales. Trabaja incrementalmente, punto por punto, sin implementar backend real todavía. Usa mocks y tipos coherentes con `API_CONTRACTS.md`.

## Decisiones nuevas

1. OAuth Microsoft y Google pasa a ser el mecanismo principal de login. La invitación queda como alternativa. OAuth confirma identidad, pero el backend futuro deberá validar membresía activa y tenant.
2. El proveedor IA será configurable por tenant: `openai` o `runpod`. Habrá un solo backend con una abstracción `AIService`.
3. Los documentos se organizan mediante espacios y subespacios. Los subespacios heredan permisos salvo override explícito.
4. Los permisos se asignan principalmente por grupo y espacio, no archivo por archivo.
5. El onboarding inicial tendrá setup asistido por platform admin e importación masiva de carpetas preservando rutas relativas.

## Revisión Etapa 0

Primero revisa los archivos `.env.example`, tipos y mocks existentes.

Agregar o dejar preparados:

```env
NEXT_PUBLIC_AUTH_CALLBACK_URL=http://localhost:3000/auth/callback
```

Y para backend futuro:

```env
OPENAI_API_KEY=
RUNPOD_API_KEY=
RUNPOD_ENDPOINT_ID=
DEFAULT_AI_PROVIDER=openai
DEFAULT_OPENAI_MODEL=
DEFAULT_RUNPOD_MODEL=
MAX_BULK_IMPORT_FILES=5000
MAX_BULK_IMPORT_TOTAL_SIZE_MB=2048
MAX_BULK_IMPORT_DEPTH=12
MAX_ZIP_UNCOMPRESSED_SIZE_MB=4096
MAX_RELATIVE_PATH_LENGTH=500
```

Actualizar tipos y mocks para incorporar:

```txt
space_id
space_ids
relative_path
auth_provider
ai_provider
privacy_tier
bulk_import_job
group
space_permission
```

Actualizar scopes de chat:

```txt
all_accessible_spaces
selected_spaces
selected_documents
```

No cambies la estructura de repositorios.

## Cambios Etapa 1

Implementar visualmente y con mocks:

### Login
- botón `Continuar con Microsoft`;
- botón `Continuar con Google`;
- ruta `/auth/callback`;
- estados de error OAuth;
- mantener invitación como alternativa.

### Layout y dashboard
- navegación o filtro por espacios accesibles;
- accesos rápidos a espacios en dashboard.

### Biblioteca
- espacios y subespacios;
- filtro por espacio;
- ruta relativa visible;
- solo mostrar documentos autorizados según mock.

### Upload individual
- selector de espacio destino;
- enviar mock de `space_id`;
- ruta relativa opcional.

### Importación masiva
- vista interna para seleccionar carpeta o ZIP seguro;
- preservar rutas relativas en mocks;
- mostrar archivos detectados;
- proponer espacios a partir de carpetas principales;
- mostrar progreso y errores.

### Chat
- selector de alcance:
  - todos mis espacios;
  - espacios seleccionados;
  - documentos seleccionados.

### Vista documento
- mostrar espacio y ruta relativa.

### Admin empresa
- autorización previa de emails;
- grupos;
- espacios;
- permisos por espacio;
- override opcional en subespacios.

### Platform admin
- selector de proveedor IA por tenant;
- wizard de setup:
  1. datos empresa;
  2. proveedor IA;
  3. admin inicial;
  4. usuarios;
  5. grupos;
  6. archivos;
  7. espacios;
  8. permisos;
  9. procesamiento;
  10. activación.

## Restricciones

No implementar todavía:

- Graph API;
- SharePoint sync;
- OneDrive sync;
- Drive sync;
- importación automática de directorio corporativo;
- backend real de OpenAI;
- backend real de Runpod.

Antes de escribir código, revisa el estado actual del frontend y dime cuál es el primer cambio incremental que corresponde hacer.

---
