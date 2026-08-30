# Actualización MVP — OAuth, proveedores IA y espacios

## Objetivo

Este registro documenta la actualización transversal incorporada al MVP de Veska después de definir tres decisiones:

1. utilizar OAuth con Microsoft y Google como mecanismo principal de acceso;
2. permitir un proveedor de inferencia configurable por tenant (`openai` o `runpod`) sin mantener dos backends;
3. organizar documentos y permisos mediante espacios, subespacios y grupos para evitar configurar accesos archivo por archivo.

También se incorpora un flujo de setup asistido con importación masiva de carpetas preservando rutas relativas.

---

# Archivos fuente actualizados

- `MVP_Scope.md`
- `Arquitectura_tecnica.md`
- `ROADMAP-MVP.md`
- `API_CONTRACTS.md`
- `SECURITY_RULES.md`
- `ENVIRONMENTS_AND_URLS.md`
- `Relatos_de_usuario_software.md`
- `Pricing.md`
- `Vision.md`

## Archivos que no fue necesario modificar

- `Posibles Nichos.md`
- `CAMBIOS_XLSX_CSV_MVP.md`

---

# Decisión 1 — OAuth Microsoft y Google en el MVP

## Qué cambia

OAuth pasa a ser el mecanismo principal de acceso.

El trabajador no necesita crear una contraseña exclusiva para Veska.

## Qué NO cambia

OAuth no permite que cualquier persona ingrese automáticamente.

Después del callback, el backend debe verificar:

- email autenticado;
- usuario activo;
- membresía activa;
- tenant activo;
- rol aplicable.

## Flujos que pueden coexistir

- autorización manual previa del email;
- importación CSV de usuarios;
- invitación mediante email como alternativa;
- login local solo como fallback opcional.

## Fuera del MVP

El OAuth de login no implica acceso automático a:

- Outlook;
- SharePoint;
- OneDrive;
- Gmail;
- Google Drive;
- directorios corporativos.

---

# Decisión 2 — Proveedor IA configurable por tenant

## Arquitectura

Se mantiene un único frontend y un único backend.

El backend utiliza una interfaz desacoplada:

```txt
AIService.generate_answer(prompt, tenant_ai_settings)
```

Adaptadores iniciales:

```txt
OpenAIProvider
RunpodProvider
```

## Configuración por tenant

```txt
tenant_ai_settings
- tenant_id
- ai_provider
- model_name
- privacy_tier
- endpoint_config
- max_tokens
- temperature
- enabled
```

## Uso esperado

### Plan estándar

```txt
openai
```

Pensado para menor complejidad operativa y cobro por consumo.

### Plan privado

```txt
runpod
```

Pensado para clientes sensibles o que soliciten mayor control del modelo y endpoint.

## Seguridad

- las API keys viven solo en backend o secret manager;
- el frontend nunca recibe secretos;
- los documentos completos no se envían al proveedor;
- solo se envían chunks relevantes y autorizados.

---

# Decisión 3 — Espacios, subespacios, grupos y permisos heredables

## Problema resuelto

No se deben asignar permisos manualmente a miles de archivos durante onboarding.

## Modelo

Cada documento pertenece a un espacio.

Ejemplo:

```txt
General
Finanzas
Legal
Operaciones
Proyectos
  Proyecto A
  Proyecto B Confidencial
```

Los subespacios heredan permisos del espacio padre, salvo override explícito.

## Grupos

Ejemplos:

```txt
Gerencia
Contabilidad
Legal
Operaciones
Lectura general
```

Los grupos definen qué información puede consultar una persona.

Los roles de aplicación siguen definiendo qué acciones puede ejecutar:

```txt
platform_admin
company_admin
company_user
read_only
```

## Regla RAG

Toda consulta documental debe filtrar por:

```txt
tenant_id
+
space_id permitido
+
document.status = ready
```

Esta regla aplica también a biblioteca, búsqueda y URLs firmadas.

---

# Decisión 4 — Setup asistido e importación masiva

Durante el MVP, el onboarding inicial debe ser asistido por `platform_admin`.

## Flujo

1. crear empresa;
2. configurar proveedor IA;
3. crear o autorizar admin inicial;
4. agregar usuarios manualmente o mediante CSV;
5. crear grupos;
6. subir carpeta completa o ZIP seguro;
7. preservar rutas relativas;
8. detectar carpetas principales;
9. proponer espacios;
10. asignar permisos por espacio;
11. configurar excepciones puntuales en subespacios;
12. procesar documentos;
13. revisar errores;
14. activar empresa.

## Conectores futuros

La arquitectura queda preparada para:

- SharePoint;
- OneDrive;
- Google Drive.

Pero quedan fuera del MVP:

- sincronización automática;
- sincronización en tiempo real;
- herencia automática de permisos desde Graph;
- importación automática del directorio corporativo;
- actualización bidireccional.

Durante piloto, los archivos nuevos relevantes deben subirse manualmente a Veska.

---

# Cambios exactos en Etapa 0

La estructura de repositorios no cambia.

Se mantienen:

```txt
veska-frontend
veska-backend
```

## 0.2 Variables de entorno

### Frontend

Agregar a `.env.example`:

```env
NEXT_PUBLIC_AUTH_CALLBACK_URL=http://localhost:3000/auth/callback
```

En production:

```env
NEXT_PUBLIC_AUTH_CALLBACK_URL=https://app.veska.cl/auth/callback
```

### Backend

Agregar a `.env.example`:

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

## 0.3 Contratos iniciales

Agregar contratos para:

- callback OAuth;
- espacios;
- grupos;
- permisos por espacio;
- importación masiva;
- configuración IA por tenant.

Actualizar scopes de chat:

```txt
all_accessible_spaces
selected_spaces
selected_documents
```

---

# Cambios exactos en Etapa 1

## 1.1 Pantallas

Agregar:

- gestión simple de espacios y grupos para admin;
- flujo interno de setup asistido para platform admin.

## 1.2 Layout

Agregar:

- filtro o navegación por espacios accesibles.

## 1.3 Login

Agregar:

```txt
Continuar con Microsoft
Continuar con Google
```

Agregar manejo de callback:

```txt
/auth/callback
```

Mantener invitación como alternativa.

Los estados visuales deben cubrir:

- cuenta no asociada a empresa;
- cuenta pendiente;
- invitación expirada;
- acceso no autorizado;
- error de OAuth.

## 1.4 Dashboard

Agregar accesos rápidos a espacios disponibles.

## 1.5 Biblioteca

Agregar:

- navegación por espacios y subespacios;
- filtro por espacio;
- ruta relativa visible;
- visualización limitada a documentos autorizados;
- jerarquía de subespacios.

## 1.6 Subida documental

### Subida individual

Agregar:

- selector de espacio destino;
- envío de `space_id`;
- ruta relativa opcional.

### Importación masiva

Agregar UI para:

- seleccionar carpeta;
- arrastrar carpeta;
- ZIP seguro si se adopta esa implementación;
- preservar rutas relativas;
- mostrar archivos detectados;
- mostrar espacios sugeridos;
- mostrar progreso;
- mostrar errores por archivo.

## 1.7 Chat

Mantener el chat principal, pero asociarlo a espacios usados cuando aplique.

## 1.8 Selector de alcance

Reemplazar la selección anterior por:

```txt
Todos mis espacios
Espacios seleccionados
Documentos seleccionados
```

Payloads esperados:

```json
{
  "scope": "all_accessible_spaces"
}
```

```json
{
  "scope": "selected_spaces",
  "space_ids": ["space_1", "space_2"]
}
```

```json
{
  "scope": "selected_documents",
  "document_ids": ["doc_1", "doc_2"]
}
```

## 1.9 Vista documento

Agregar:

- espacio;
- ruta relativa.

## 1.10 Panel admin empresa

Agregar:

- autorización previa de emails;
- grupos;
- espacios;
- permisos simples por espacio;
- excepciones en subespacios.

## 1.11 Panel platform admin

Agregar:

- selector de proveedor IA por tenant;
- setup asistido;
- carga manual o CSV de usuarios;
- creación de grupos;
- importación de carpeta;
- confirmación de espacios sugeridos;
- permisos por espacio;
- errores de procesamiento.

## Mocks y tipos frontend

Actualizar mocks y tipos para incorporar:

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

---

# Regla para implementar ahora

En Etapa 1 solo se implementa frontend y mocks coherentes.

No implementar todavía:

- Graph API;
- SharePoint sync;
- OneDrive sync;
- Drive sync;
- directorio corporativo automático;
- permisos heredados desde nube externa;
- backend real de OpenAI;
- backend real de Runpod.

Esas integraciones se implementan en etapas posteriores del roadmap.
