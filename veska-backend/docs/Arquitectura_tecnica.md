## 1. Objetivo de la arquitectura

Construir una plataforma web de IA documental privada para empresas medianas, con foco en:

- subir documentos internos, incluyendo planillas XLSX y CSV;
- procesarlos mediante RAG textual o tabular según el formato;
- permitir preguntas en lenguaje natural;
- entregar respuestas con fuentes;
- separar datos por empresa;
- controlar usuarios, roles y permisos;
- mantener costos bajos durante el MVP.

La arquitectura debe ser simple para partir, pero suficientemente ordenada para escalar sin rehacer todo desde cero.

---

# 2. Principios generales

## Simplicidad primero

Para el MVP se prioriza usar servicios administrados como Supabase y proveedores de inferencia configurables por tenant en vez de construir infraestructura propia.

La primera versión debe poder utilizar:

- OpenAI API para clientes del plan estándar;
- Runpod para clientes del plan privado o con mayores requisitos de control.

El backend debe desacoplar la lógica RAG del proveedor de inferencia para evitar mantener implementaciones paralelas.

## Separación por empresa

Todo dato perteneciente a una empresa debe estar asociado a una empresa
mediante `tenant_id` o ser alcanzable desde una relación tenant-scoped.
Las identidades en `users` son globales, no tienen `tenant_id`, y se vinculan a
empresas mediante `tenant_memberships`.

Esto aplica a:

- membresías de usuarios;
- documentos;
- espacios;
- subespacios;
- grupos;
- membresías de grupos;
- permisos por espacio;
- chunks;
- embeddings;
- chats;
- mensajes;
- logs;
- métricas;
- configuración del proveedor IA;
- permisos.

Además del filtro por tenant, toda consulta documental debe respetar los espacios accesibles para el usuario.

## Seguridad desde el backend

El frontend nunca debe decidir por sí solo qué puede ver un usuario.

Toda acción importante debe ser validada en el backend:

- acceso a documentos;
- acceso a chats;
- subida de archivos;
- eliminación;
- uso de IA;
- permisos administrativos.

## Proveedores IA solo para inferencia

OpenAI API, Runpod u otros proveedores futuros no deben manejar lógica de negocio, usuarios ni permisos.

El proveedor seleccionado para cada tenant solo recibe:

- pregunta del usuario;
- chunks relevantes y autorizados;
- instrucciones del sistema;
- configuración del modelo.

Y devuelve:

- respuesta generada por el modelo.

La selección del proveedor debe realizarse en backend mediante una capa interna desacoplada, por ejemplo:

```txt
AIService.generate_answer(prompt, tenant_ai_settings)
```

No se necesitan backends separados para OpenAI y Runpod.

## PostgreSQL como centro del sistema

PostgreSQL + pgvector será el cerebro operativo del producto.

Ahí se guardan:

- usuarios;
- empresas;
- roles;
- documentos;
- chunks;
- embeddings;
- chats;
- logs;
- uso por cliente.

## Storage solo para archivos pesados

Los PDF, DOCX, TXT, XLSX, CSV y demás archivos originales permitidos deben guardarse en storage.

PostgreSQL guarda metadata y referencias, no archivos pesados directamente.

---

# 3. Bloques principales

La arquitectura se divide en 4 grandes bloques:
1. Frontend
2. Backend/API
3. Datos y Storage
4. IA/Inferencia

Arquitectura general:

```txt
Usuario
↓
Frontend Next.js
↓
Backend FastAPI
├── Supabase PostgreSQL + pgvector
├── Supabase Storage
└── AIService
    ├── OpenAI API
    └── Runpod
```

En paralelo:

```
Supabase Storage
```

para archivos originales.

---

# 4. Frontend

## Tecnología

- Next.js
- React
- Tailwind CSS, opcional
- shadcn/ui, opcional

## Responsabilidades

El frontend será una web app.

Debe permitir:

- iniciar sesión mediante OAuth Microsoft o Google;
- ver chats;
- crear nuevos chats;
- hacer preguntas;
- subir documentos individuales;
- subir carpetas masivamente durante onboarding;
- ver biblioteca documental organizada por espacios;
- buscar documentos;
- filtrar por espacios accesibles;
- seleccionar espacios o documentos para un chat;
- ver fuentes usadas en cada respuesta;
- acceder a panel de administración, si el usuario tiene permisos;
- reportar errores o respuestas incorrectas.

## Qué NO debe hacer

El frontend no debe:

- comunicarse directamente con proveedores IA;
- acceder directamente a archivos privados sin autorización;
- decidir permisos sensibles;
- guardar API keys;
- exponer claves de Supabase con permisos elevados;
- construir prompts finales para el modelo.

---

# 5. Backend

## Tecnología

- Python
- FastAPI

## Responsabilidades

El backend es el centro lógico del sistema.

Debe encargarse de:

- validar sesión del usuario;
- identificar empresa mediante `tenant_id`;
- verificar roles y permisos;
- validar inputs;
- validar documentos;
- recibir archivos;
- subir archivos al storage;
- extraer contenido textual o tabular según el formato;
- dividir contenido en chunks textuales o tabulares;
- generar embeddings;
- guardar chunks y embeddings;
- recibir preguntas;
- recuperar chunks relevantes;
- construir prompts;
- seleccionar proveedor IA según configuración del tenant;
- llamar a OpenAI API o Runpod mediante un servicio interno desacoplado;
- guardar historial;
- registrar métricas de uso;
- manejar errores;
- aplicar rate limiting;
- proteger datos entre empresas.

## Servicios internos del backend

Se pueden organizar módulos internos como:

```
auth_servicetenant_servicedocument_servicerag_serviceembedding_servicechat_servicepermission_serviceusage_servicerunpod_servicestorage_service
```

---

# 6. Supabase

Supabase se usará inicialmente para:

- Auth;
- PostgreSQL;
- pgvector;
- Storage;
- dashboard administrativo básico;
- backups administrados.

## Por qué usar Supabase

Ventajas para MVP:

- reduce complejidad inicial;
- entrega Auth listo;
- permite usar PostgreSQL con pgvector;
- incluye Storage;
- facilita dashboard y administración;
- permite avanzar más rápido hacia clientes reales.

## Riesgo

Supabase cobra por comodidad. Más adelante, si el costo crece mucho, se puede migrar:

- storage a Cloudflare R2, Backblaze B2 o S3;
- backend a servidor propio;
- PostgreSQL a VPS/dedicado administrado directamente.

---

# 6.1 Autenticación OAuth empresarial

Supabase Auth debe habilitar OAuth con:

```txt
Microsoft
Google
```

OAuth será el mecanismo principal de acceso al MVP.

La autenticación externa confirma identidad, pero no autoriza automáticamente el uso de Veska. Después del callback, el backend debe validar:

- email autenticado;
- usuario activo;
- membresía activa;
- tenant activo;
- rol aplicable.

El admin puede autorizar emails manualmente, enviar invitaciones o importar una lista CSV durante el setup.

Las integraciones OAuth de login no implican acceso automático a SharePoint, OneDrive, Outlook, Drive o Gmail.

---

# 7. Base de datos

## Tecnología

- PostgreSQL
- pgvector

## Qué guarda PostgreSQL

PostgreSQL guarda datos estructurados y semánticos:

- empresas;
- usuarios;
- roles;
- permisos;
- documentos metadata;
- chunks;
- embeddings;
- chats;
- mensajes;
- logs;
- métricas de uso;
- configuración por empresa;
- configuración del proveedor IA por tenant;
- espacios, grupos y permisos heredables;
- jobs de importación masiva.

## Qué NO debe guardar PostgreSQL

No debería guardar directamente:

- PDFs originales;
- DOCX originales;
- imágenes pesadas;
- archivos grandes.

Eso debe ir a Storage.

---

# 8. pgvector

## Función

pgvector permite guardar embeddings dentro de PostgreSQL.

Sirve para hacer búsqueda semántica.

Ejemplo:

El usuario pregunta:

```
¿Qué documentos mencionan gastos comunes?
```

El sistema convierte la pregunta en un embedding y busca chunks similares en la base.

## Flujo de búsqueda

```
Pregunta del usuario↓Embedding de la pregunta↓Consulta en pgvector↓Chunks más relevantes↓Prompt para el LLM↓Respuesta
```

## Importante

Toda búsqueda vectorial debe filtrar por `tenant_id`.

Ejemplo lógico:

```
SELECT *FROM document_chunksWHERE tenant_id = 'empresa_x'ORDER BY embedding <-> query_embeddingLIMIT 8;
```

Nunca se debe buscar globalmente sin filtrar por empresa.

---

# 9. Storage

## Tecnología inicial

- Supabase Storage

## Qué guarda

- PDF originales;
- DOCX originales;
- TXT originales;
- XLSX originales;
- CSV originales;
- imágenes futuras;
- archivos pesados;
- posibles backups de documentos.

## Relación con PostgreSQL

PostgreSQL guarda la referencia al archivo.

Ejemplo:

```
documents- id- tenant_id- file_name- file_type- storage_path- uploaded_by- status- created_at
```

El archivo real vive en Storage.

## Acceso a archivos

Los archivos no deben ser públicos.

El acceso debe hacerse mediante:

- rutas protegidas;
- signed URLs;
- validación previa en backend.

---

# 9.1 Preparación para conectores externos futuros

Aunque el MVP no implementa sincronización automática con nubes externas, la tabla `documents` debe quedar preparada con campos como:

```txt
source_type
external_provider nullable
external_id nullable
external_path nullable
sync_status nullable
last_synced_at nullable
relative_path nullable
space_id
```

Valores esperados inicialmente:

```txt
source_type:
- upload
- external_sync

external_provider:
- microsoft_sharepoint
- microsoft_onedrive
- google_drive
```

Durante el MVP se utilizará principalmente `source_type = upload`.

---

# 10. Inferencia IA configurable por tenant

## Función

Veska utilizará un proveedor de inferencia configurado por tenant.

Opciones iniciales:

```txt
openai
runpod
```

OpenAI API será la opción estándar inicial. Runpod permitirá ofrecer un plan privado o una configuración con mayor control.

## Qué recibe el proveedor IA

El proveedor seleccionado debe recibir solamente:

- pregunta del usuario;
- chunks relevantes;
- instrucciones del sistema;
- configuración del modelo.

## Qué NO debe recibir el proveedor IA

No debe recibir:

- documentos completos innecesarios;
- datos de otros tenants;
- credenciales internas;
- información no relacionada con la pregunta;
- claves del sistema.

## OpenAI API

La API permite pagar por consumo y reduce complejidad operativa durante la validación.

## Runpod

Runpod puede utilizarse para clientes privados o sensibles.

En modo serverless se paga por uso, no por tener una GPU prendida todo el día.

Esto permite:

- controlar costos;
- ofrecer una opción con modelo open-source;
- validar clientes con necesidades distintas;
- evitar infraestructura propia temprana.

## Futuro

Si el uso crece, se puede pasar a:

- endpoint persistente;
- pod dedicado;
- GPU dedicada;
- infraestructura on-premise;
- AI Box.

---

# 11. Modelos IA

## Modelos posibles

Para MVP se pueden evaluar:

- Qwen 14B;
- Llama 3/3.1 8B;
- Mistral;
- DeepSeek distill.

## Criterios de elección

El modelo debe equilibrar:

- calidad de respuesta;
- costo;
- latencia;
- tamaño;
- compatibilidad con el proveedor de inferencia elegido;
- capacidad en español;
- buen comportamiento con RAG.

## Importante

El producto no depende de crear un modelo propio.

El valor está en:

- UX;
- integración documental;
- permisos;
- RAG confiable;
- fuentes;
- implementación;
- soporte.

---

# 11.1 Configuración IA por tenant

Tabla sugerida:

```txt
tenant_ai_settings
- id
- tenant_id
- ai_provider
- model_name
- privacy_tier
- endpoint_config
- max_tokens
- temperature
- enabled
- created_at
- updated_at
```

La API key real no debe guardarse ni enviarse al frontend. Debe vivir en secretos del backend.

---

# 12. Embeddings

## Función

Los embeddings convierten texto en vectores numéricos.

Se usan para comparar significado entre preguntas y documentos.

## Cuándo se generan

Se generan en dos momentos:

1. Cuando se procesa un documento.
2. Cuando un usuario hace una pregunta.

## Opciones iniciales

Se puede partir con:

- embeddings vía API externa;
- embeddings open-source en Runpod;
- embeddings locales si más adelante se necesita privacidad total.

## Consideración

Los embeddings también tienen costo si se usa proveedor externo o GPU.

Deben registrarse como parte del costo por cliente.

---

# 13. Multi-tenant

## Concepto

La plataforma debe soportar varias empresas dentro del mismo sistema.

Cada empresa es un `tenant`.

## Regla central

Todo recurso perteneciente a un tenant debe tener `tenant_id` o ser alcanzable
desde una tabla tenant-scoped. `users` es una tabla global de identidades y no
tiene `tenant_id`.

Ejemplos:

```
tenant_memberships.tenant_id
documents.tenant_id
document_chunks.tenant_id
chats.tenant_id
messages.tenant_id
usage_logs.tenant_id
```

## Beneficio

Permite:

- separar clientes;
- medir uso por empresa;
- evitar mezcla de datos;
- escalar con múltiples clientes;
- eventualmente migrar un tenant grande a infraestructura dedicada.

---

# 14. Roles y permisos

## Roles iniciales

Para membresías de tenant en el MVP se proponen estos roles:

```
company_admin
company_user
read_only
```

## Platform admin

Representa al dueño o administrador interno de Veska. No es un rol de
membresía de tenant; se representa por separado mediante `platform_admins`.

Puede:

- crear empresas;
- eliminar/desactivar empresas;
- crear administrador inicial;
- ver métricas por empresa;
- ver uso y costos;
- configurar límites;
- ver errores técnicos.

## Company admin

Administrador de una empresa cliente.

Puede:

- invitar usuarios;
- desactivar usuarios;
- eliminar documentos;
- ver métricas básicas de su empresa;
- gestionar permisos simples;
- reportar problemas prioritarios.

## Company user

Usuario normal de una empresa.

Puede:

- subir documentos, si está permitido;
- hacer preguntas;
- crear chats;
- ver documentos autorizados;
- compartir respuestas dentro de su empresa;
- reportar problemas.

## Permisos futuros

Más adelante se puede agregar:

- solo lectura;
- editor documental;
- gestor de documentos;
- acceso por carpeta;
- acceso por proyecto;
- permisos por documento.

---

# 14.1 Espacios, grupos y permisos heredables

## Objetivo

Evitar configurar permisos archivo por archivo durante el onboarding y mantener una capa de autorización comprensible para empresas medianas.

## Modelo principal

Cada documento debe pertenecer a un espacio.

Ejemplos:

```txt
General
Finanzas
Legal
Operaciones
Proyectos
```

Los espacios pueden contener subespacios. Por defecto, un subespacio hereda permisos del espacio padre, salvo que exista un override explícito.

## Grupos

Los grupos representan necesidades de acceso documental y no deben confundirse con roles de aplicación.

Ejemplos:

```txt
Gerencia
Contabilidad
Legal
Operaciones
Lectura general
```

Un usuario puede pertenecer a uno o más grupos.

## Diferencia entre rol y grupo

Los roles de aplicación definen qué acciones puede ejecutar una persona dentro de Veska:

```txt
company_admin
company_user
read_only
```

`platform_admin` es una capacidad de plataforma separada de los roles de
membresía de tenant.

Los grupos definen qué información puede consultar.

## Tablas sugeridas

```txt
spaces
- id
- tenant_id
- parent_space_id nullable
- name
- path
- visibility
- inherits_permissions
- created_at
- updated_at

groups
- id
- tenant_id
- name
- description
- created_at
- updated_at

group_memberships
- id
- tenant_id
- group_id
- user_id
- created_at

space_permissions
- id
- tenant_id
- space_id
- group_id nullable
- user_id nullable
- access_level
- source
- created_at
```

## Regla de consulta

Toda consulta sobre documentos debe filtrar como mínimo por:

```txt
tenant_id
+
space_id permitido
+
document.status = ready
```

Esta validación aplica a biblioteca, RAG, búsqueda, selección de documentos y generación de URLs firmadas.

---

# 15. Row Level Security

Si se usa Supabase, se debe considerar RLS.

## Objetivo

Evitar que un usuario pueda leer datos de otra empresa.

## Regla general

Un usuario solo puede acceder a filas tenant-scoped cuando su identidad
autenticada se resuelve a un `users.auth_user_id` y existe una
`tenant_memberships` activa para el tenant correspondiente.

```
row.tenant_id = active_membership.tenant_id
```

Un usuario puede tener cero, una o varias membresías. No debe dependerse de
`users.tenant_id`, porque `users` es global y no tiene `tenant_id`.

## Importante

Aunque se use RLS, el backend también debe validar permisos.

La seguridad no debe depender de una sola capa.

---

# 16. Validación de inputs

Antes de procesar cualquier request, el backend debe validar:

- tipo de dato;
- longitud máxima;
- campos obligatorios;
- valores permitidos;
- IDs válidos;
- pertenencia al tenant;
- permisos del usuario.

## Ejemplos

En preguntas al chat:

- limitar largo máximo del prompt;
- evitar inputs vacíos;
- sanitizar contenido;
- registrar abuso;
- aplicar rate limiting.

En creación de empresa:

- validar nombre;
- validar email de administrador;
- evitar duplicados.

En cambio de permisos:

- verificar que quien ejecuta la acción sea admin;
- verificar que el usuario modificado pertenezca al mismo tenant.

---

# 17. Validación de documentos

Antes de aceptar un archivo, el backend debe validar:

- extensión permitida;
- tamaño máximo;
- MIME type;
- nombre de archivo;
- archivo no vacío;
- cantidad de archivos por empresa;
- storage disponible según plan;
- posible archivo duplicado;
- si el usuario tiene permiso para subir documentos;
- límites específicos para planillas cuando corresponda.

## Extensiones MVP

Inicialmente permitir:

```txt
.pdf
.docx
.txt
.xlsx
.csv
```

No permitir inicialmente:

```txt
.xls
.xlsm
.ods
```

`.xlsm` queda fuera del MVP porque puede contener macros. Veska no debe ejecutar macros ni código embebido en archivos subidos.

## Validaciones adicionales para XLSX y CSV

Para planillas, el backend debe aplicar límites configurables como:

- cantidad máxima de hojas;
- cantidad máxima de filas;
- cantidad máxima de columnas;
- cantidad máxima de celdas no vacías;
- tiempo máximo de parsing;
- tamaño máximo del archivo descomprimido cuando corresponda;
- rechazo de archivos corruptos o estructuras anómalas.

Para XLSX:

- recorrer hojas visibles;
- leer valores almacenados en celdas;
- conservar nombre de hoja y rango de celdas;
- no ejecutar macros;
- no recalcular fórmulas;
- no interpretar gráficos ni tablas dinámicas en el MVP.

Para CSV:

- detectar encoding razonable;
- detectar delimitador de forma controlada;
- limitar filas, columnas y tamaño;
- tratar el contenido como tabla plana.

## Estados de documento

Cada documento debe tener estado:

```txt
uploaded
processing
ready
error
deleted
```

## Errores posibles

- archivo corrupto;
- extensión no permitida;
- MIME type inválido;
- archivo demasiado grande;
- archivo vacío;
- texto no extraíble;
- planilla sin contenido útil;
- planilla con demasiadas hojas, filas o celdas;
- estructura tabular no procesable;
- error OCR;
- error embeddings;
- error storage.

---

# 18. Flujo: subida de documento

```txt
Usuario sube documento
↓
Frontend envía archivo al backend
↓
Backend valida sesión
↓
Backend identifica tenant_id
↓
Backend valida permisos del usuario
↓
Backend valida input y metadata
↓
Backend valida extensión, MIME type, tamaño y límites del plan
↓
Backend crea registro en PostgreSQL con status = uploaded
↓
Backend sube archivo original a Supabase Storage
↓
Backend actualiza storage_path
↓
Backend cambia status = processing
↓
Backend conserva ruta relativa y asigna espacio
↓
Backend selecciona extractor según formato
├── PDF / DOCX / TXT → extracción textual
└── XLSX / CSV       → extracción tabular estructurada
↓
Backend divide contenido en chunks textuales o tabulares
↓
Backend genera embeddings
↓
Backend guarda chunks + embeddings en PostgreSQL/pgvector
↓
Backend cambia status = ready
↓
Frontend muestra documento como disponible
```

Si ocurre error:

```txt
Backend cambia status = error
↓
Guarda detalle técnico en logs
↓
Muestra mensaje simple al usuario
```

## Procesamiento tabular XLSX y CSV

Para XLSX y CSV, cada chunk tabular debe conservar metadata suficiente para reconstruir una fuente visible:

- nombre de archivo;
- nombre de hoja, cuando aplique;
- rango de celdas o filas;
- encabezados relevantes;
- índice del bloque;
- tenant_id;
- document_id.

Ejemplo conceptual:

```txt
Archivo: Gastos_Comunes_2026.xlsx
Hoja: Gastos 2026
Rango: A1:D4

Mes: Enero | Proveedor: Ascensores SPA | Categoría: Mantención | Monto: 850000
Mes: Enero | Proveedor: Limpieza Ltda. | Categoría: Aseo | Monto: 430000
Mes: Febrero | Proveedor: Ascensores SPA | Categoría: Mantención | Monto: 850000
```

---

# 19. Flujo: pregunta en chat

```
Usuario escribe pregunta↓Frontend envía pregunta al backend↓Backend valida sesión↓Backend identifica tenant_id↓Backend valida permisos del usuario↓Backend valida input:    - pregunta no vacía    - largo máximo    - formato válido    - rate limit↓Backend determina alcance:    - todos los espacios accesibles    - espacios específicos    - documentos específicos↓Backend determina espacios accesibles para el usuario↓Backend crea embedding de la pregunta↓Backend busca chunks relevantes en pgvector filtrando por tenant_id, espacios permitidos y permisos↓Backend arma prompt con:    - instrucciones del sistema    - pregunta    - chunks relevantes    - reglas de citación↓Backend selecciona proveedor IA según configuración del tenant↓Backend llama a OpenAI API o Runpod↓Proveedor IA genera respuesta↓Backend valida respuesta básica↓Backend guarda:    - pregunta    - respuesta    - fuentes usadas    - proveedor    - costo estimado    - latencia↓Frontend muestra respuesta con fuentes
```

---

# 20. Flujo: respuesta con fuentes

Cada respuesta debe poder mostrar:

- documento usado;
- página, si la fuente proviene de un documento paginado;
- hoja y rango de celdas, si la fuente proviene de XLSX;
- rango de filas o columnas, si la fuente proviene de CSV;
- fragmento citado;
- link al documento original;
- score o relevancia interna, opcional;
- advertencia si no hubo suficiente evidencia.

Ejemplo de fuente textual:

```txt
Fuente: Contrato_Arriendo_Local_23.pdf
Página: 4
Fragmento: "Los gastos comunes serán responsabilidad del arrendatario..."
```

Ejemplo de fuente tabular:

```txt
Fuente: Gastos_Comunes_2026.xlsx
Hoja: Gastos 2026
Rango: A1:D4
Fragmento: "Mes: Enero | Proveedor: Ascensores SPA | Categoría: Mantención | Monto: 850000"
```

---

# 20.1 Flujo: setup asistido e importación masiva

Durante el MVP, el `platform_admin` debe poder ejecutar un onboarding asistido.

```txt
Crear empresa
↓
Configurar proveedor IA
↓
Crear o autorizar admin inicial
↓
Agregar usuarios manualmente o importar CSV
↓
Crear grupos
↓
Subir estructura de carpetas masivamente
↓
Conservar rutas relativas
↓
Detectar carpetas principales
↓
Proponer espacios
↓
Asignar permisos por espacio
↓
Aplicar herencia a subespacios
↓
Configurar excepciones puntuales
↓
Procesar documentos
↓
Revisar errores
↓
Activar empresa
```

La importación masiva debe permitir seleccionar carpeta, arrastrar carpeta o utilizar un ZIP seguro. La decisión técnica puede tomarse durante implementación.

Si se admite ZIP, debe validarse:

- tamaño descomprimido;
- path traversal;
- zip bombs;
- extensiones;
- cantidad de archivos;
- profundidad máxima de carpetas.

---

# 21. Flujo: creación de empresa

```
Platform admin crea empresa↓Backend valida permisos platform_admin↓Backend valida datos de empresa↓Backend crea tenant↓Backend crea configuración inicial↓Backend configura proveedor IA↓Backend autoriza email del admin inicial o envía invitación↓Backend asigna límites de plan↓Empresa queda lista para setup asistido
```

---

# 22. Flujo: autorización e ingreso de usuario

```
Company admin o platform admin autoriza email, invita usuario o importa CSV↓Backend valida sesión y permisos↓Backend valida email↓Backend verifica límites del plan↓Backend crea membresía pending o invitación↓Usuario inicia sesión mediante OAuth Microsoft o Google↓Backend valida identidad OAuth↓Backend vincula o crea identidad global users, asocia auth_user_id cuando corresponda y valida membresía activa, tenant y rol de membresía
```

La invitación por email queda disponible como alternativa, pero el usuario no necesita crear una contraseña exclusiva para Veska.

---

# 23. Flujo: eliminación de documento

```
Usuario/admin solicita eliminar documento↓Backend valida sesión↓Backend valida tenant_id↓Backend valida permisos↓Backend marca documento como deleted↓Backend elimina o desactiva chunks asociados↓Backend elimina archivo original del Storage o lo marca para eliminación diferida↓Backend registra acción en audit log
```

Para MVP, puede ser mejor usar soft delete inicialmente.

---

# 24. Logs y métricas

## Logs técnicos

Guardar:

- errores backend;
- errores procesamiento documentos;
- errores del proveedor IA;
- errores storage;
- errores auth.

## Logs de auditoría

Guardar:

- login;
- subida documento;
- eliminación documento;
- invitación usuario;
- cambio de rol;
- cambio de plan;
- reporte de problema.

## Métricas de uso

Guardar por empresa:

- requests diarios;
- requests mensuales;
- usuarios activos;
- documentos subidos;
- storage usado;
- tokens aproximados;
- costo estimado por proveedor IA;
- tokens de entrada y salida por proveedor;
- latencia promedio;
- errores.

---

# 25. Límites por plan

Cada tenant debe tener límites configurables.

Ejemplos:

```txt
max_users
max_documents
max_storage_gb
max_requests_month
max_file_size_mb
max_chats
max_spreadsheet_sheets
max_spreadsheet_rows
max_spreadsheet_columns
max_spreadsheet_non_empty_cells
max_spreadsheet_parse_seconds
max_bulk_import_files
max_bulk_import_total_size_mb
max_bulk_import_depth
```

Los límites tabulares evitan que una planilla anómala o excesivamente grande bloquee el worker de procesamiento.

Esto permite controlar costos y vender planes distintos.

---

# 26. Rate limiting

Aplicar rate limiting por:

- usuario;
- empresa;
- IP;
- endpoint sensible.

Endpoints especialmente importantes:

- login;
- reset password;
- subida de documentos;
- preguntas al modelo;
- invitaciones.

---

# 27. Manejo de errores

El sistema debe separar:

## Error visible para usuario

Mensaje simple:

```
No pudimos procesar este documento. Intenta nuevamente o contacta soporte.
```

## Error interno

Log técnico con:

- stack trace;
- tenant_id;
- user_id;
- endpoint;
- timestamp;
- request_id;
- detalle técnico.

Nunca mostrar al usuario:

- stack traces;
- API keys;
- queries;
- rutas internas;
- credenciales;
- detalles de infraestructura.

---

# 28. Variables de entorno y secretos

Guardar en variables de entorno:

- Supabase URL;
- Supabase anon key;
- Supabase service role key;
- OpenAI API key;
- Runpod API key;
- database URL;
- email provider key;
- JWT secrets;
- storage secrets.

## Regla importante

La `service_role_key` de Supabase nunca debe llegar al frontend.

Solo puede vivir en backend seguro.

---

# 29. Ambientes

Separar ambientes:

```
developmentstagingproduction
```

## Development

Para pruebas locales.

## Staging

Para probar antes de lanzar cambios.

## Production

Clientes reales.

Nunca usar documentos reales de clientes en development.

---

# 30. Deploy inicial

## Frontend

Opciones:

- Vercel;
- Netlify;
- Cloudflare Pages.

## Backend

Opciones:

- Railway;
- Render;
- Fly.io;
- Hetzner VPS.

## Datos

- Supabase PostgreSQL + pgvector.
- Supabase Storage.

## IA

- OpenAI API para plan estándar.
- Runpod Serverless para plan privado o clientes sensibles.
