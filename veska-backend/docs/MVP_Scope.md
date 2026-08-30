## Objetivo del MVP

Validar que empresas medianas estén dispuestas a pagar por una plataforma de IA privada/documental que les permita:

- centralizar documentos;
- buscar información mediante lenguaje natural;
- obtener respuestas con fuentes;
- ahorrar tiempo operacional;
- mejorar acceso al conocimiento interno.

El objetivo NO es construir un ERP, CRM ni reemplazar software empresarial existente.

---

# Objetivos principales del MVP

## 1. Validar disposición a pago
Conseguir 1–3 empresas pagando por el software.

## 2. Validar utilidad real
Comprobar que los usuarios:
- hacen preguntas reales;
- vuelven a usar el sistema;
- encuentran valor en las respuestas.

## 3. Validar arquitectura técnica
Comprobar que:
- el RAG funciona correctamente;
- los costos son sostenibles;
- el sistema escala para pequeños equipos.

## 4. Validar workflows documentales
Entender:
- cómo las empresas organizan documentos;
- qué preguntas hacen;
- qué tareas desean automatizar.

---

# Qué SI entra en el MVP

## Autenticación

- Login/logout.
- OAuth con Microsoft y Google como mecanismo principal de acceso.
- Registro o autorización previa del email dentro de una empresa.
- Invitación mediante email como alternativa.
- Recuperación de contraseña únicamente si se habilita login local como fallback.
- Roles básicos:
  - usuario;
  - administrador.

OAuth reemplaza la necesidad de crear una contraseña exclusiva para Veska, pero no reemplaza la validación de pertenencia a una empresa. El backend debe comprobar que el email autenticado tenga una membresía activa dentro del tenant correspondiente.

---

# Multi-tenant

- Separación completa por empresa (`tenant_id`).
- Usuarios solo pueden acceder a documentos, espacios y chats de su empresa.
- Las consultas deben respetar tanto el tenant como los espacios autorizados para el usuario.

---

# Espacios, grupos y permisos documentales

- Cada documento debe pertenecer a un espacio.
- Los espacios pueden representar áreas o carpetas principales, por ejemplo:
  - General;
  - Finanzas;
  - Legal;
  - Operaciones;
  - Proyectos.
- Los usuarios pueden agruparse según áreas o necesidades de acceso.
- Los permisos se asignan principalmente por espacio y grupo.
- Los subespacios heredan permisos del espacio padre, salvo que exista una excepción explícita.
- El chat puede consultar todos los espacios accesibles para el usuario, espacios seleccionados o documentos específicos.
- Los permisos por documento individual deben quedar preparados, pero no serán la forma principal de configuración durante el MVP.

---

# Gestión documental

- Subir documentos:
  - PDF;
  - DOCX;
  - TXT;
  - XLSX;
  - CSV.
- Biblioteca de documentos organizada por espacios y subespacios.
- Búsqueda de documentos.
- Filtrado por espacios accesibles.
- Eliminación de documentos.
- Subida masiva de carpetas preservando rutas relativas durante el onboarding.
- Propuesta automática de espacios a partir de carpetas principales detectadas.
- Estado de procesamiento:
  - subido;
  - procesando;
  - listo;
  - error;
  - eliminado.

## Alcance de planillas en el MVP

Las planillas deben tratarse como documentos tabulares estructurados, no como texto plano.

El MVP debe permitir:

- leer valores de celdas en archivos XLSX;
- recorrer hojas visibles;
- conservar nombre de hoja;
- conservar rango de celdas de cada fragmento;
- leer filas de archivos CSV;
- generar chunks tabulares por bloques de filas;
- citar hoja y rango de celdas cuando una respuesta use una planilla.

El MVP no busca reemplazar Excel ni una herramienta de BI.

---

# Procesamiento RAG

- Extracción de texto para PDF, DOCX y TXT.
- Extracción tabular estructurada para XLSX y CSV.
- Chunking textual y tabular.
- Embeddings.
- Almacenamiento en PostgreSQL + pgvector.
- Recuperación semántica.
- Respuestas basadas en documentos.

---

# Chat IA

- Crear nuevos chats.
- Historial de chats.
- Preguntas libres.
- Selección opcional de alcance:
  - todos los espacios accesibles;
  - espacios específicos;
  - documentos específicos.
- Respuestas con:
  - fuentes;
  - documento;
  - página, cuando aplique;
  - hoja y rango de celdas, cuando la fuente sea una planilla;
  - fragmento citado.

---

# Seguridad básica

- HTTPS.
- Rate limiting.
- Validación de permisos.
- Storage privado.
- Logs básicos.
- Sanitización inputs.
- Queries parametrizadas.

---

# Administración empresa

## Admin empresa

- Autorizar emails o invitar usuarios.
- Eliminar/desactivar usuarios.
- Eliminar documentos.
- Ver espacios y grupos configurados.
- Gestionar permisos simples por espacio y grupo.
- Ajustar excepciones de acceso en subespacios cuando corresponda.
- Ver uso básico:
  - requests;
  - storage;
  - usuarios.

---

# Administración plataforma

## Dueño software

- Crear empresas.
- Crear o autorizar administrador inicial.
- Ejecutar setup asistido por empresa.
- Importar usuarios manualmente o mediante CSV.
- Subir estructuras de carpetas masivamente.
- Confirmar espacios sugeridos y asignar permisos iniciales.
- Configurar proveedor IA por tenant.
- Ver:
  - requests;
  - storage;
  - uso mensual;
  - errores básicos.

---

# Infraestructura MVP

## Frontend
- Next.js

## Backend
- FastAPI

## Base de datos
- PostgreSQL + pgvector

## Auth + Storage
- Supabase

## Inferencia IA
- Proveedor configurable por tenant:
  - OpenAI API para plan estándar;
  - Runpod para plan privado o clientes con mayores requisitos de control.
- Un único backend con servicio de inferencia desacoplado.

## Hosting backend
- Railway / Render / Hetzner

---

# Qué NO entra en el MVP

## NO ERP
No construir:
- manejo completo propiedades;
- contabilidad;
- CRM;
- facturación;
- inventario;
- RRHH.

---

# NO agentes autónomos complejos

- No multi-agent systems.
- No workflows automáticos avanzados.
- No automatización completa de procesos.

---

# NO integraciones complejas

- No Outlook.
- No Teams.
- No Slack.
- No Drive sync automático.
- No SharePoint sync automático.
- No OneDrive sync automático.
- No sincronización en tiempo real.
- No actualización bidireccional con nubes externas.
- No herencia automática de permisos desde Microsoft Graph.
- No importación automática del directorio corporativo desde Microsoft 365 o Google Workspace.

La arquitectura debe dejar preparados campos para conectores futuros, pero durante el piloto los archivos nuevos relevantes deberán subirse manualmente a Veska.

---

# NO colaboración avanzada

- No edición colaborativa.
- No comentarios en documentos.
- No sistema interno de mensajería completo.

---

# NO analytics avanzados

- No dashboards empresariales complejos.
- No BI.
- No métricas IA avanzadas.
- No análisis visual de gráficos de Excel.
- No interpretación de tablas dinámicas.
- No ejecución de macros.
- No recálculo de fórmulas.
- No edición de planillas desde Veska.

---

# NO entrenamiento de modelos

- No fine-tuning propio.
- No modelos propietarios.
- No entrenamiento GPU.

---

# NO infraestructura propia

- No datacenter propio.
- No clusters propios.
- No Kubernetes complejo.
- No GPUs dedicadas inicialmente.

---

# Setup asistido durante el MVP

Durante la validación inicial, el onboarding debe ser asistido por el `platform_admin` para reducir carga operativa en el cliente.

Flujo esperado:

1. crear empresa;
2. configurar proveedor IA;
3. crear o autorizar admin inicial;
4. agregar usuarios manualmente o mediante CSV;
5. crear grupos;
6. subir carpetas y documentos masivamente preservando estructura;
7. detectar carpetas principales y proponer espacios;
8. asignar permisos por espacio;
9. ajustar excepciones puntuales en subespacios;
10. procesar documentos;
11. revisar errores;
12. activar empresa.

La importación automática de empleados mediante Graph API y la sincronización automática con nubes externas quedan preparadas para una fase posterior.

---

# Requisitos mínimos de calidad

## Respuestas IA

- Deben citar fuentes.
- Para documentos textuales, deben citar página cuando esté disponible.
- Para XLSX y CSV, deben citar hoja y rango de celdas cuando corresponda.
- Deben indicar cuando no encuentran información suficiente.
- No deben responder usando información de otra empresa.

---

# Rendimiento

Objetivo:
- respuestas entre 3–15 segundos.

---

# Costos

Objetivo:
- mantener costo infraestructura bajo durante validación.

---

# UX

La UX debe ser:
- simple;
- tipo ChatGPT;
- fácil para usuarios no técnicos.

---

# Métricas clave MVP

## Negocio
- cantidad clientes;
- MRR;
- retención;
- frecuencia uso.

## Producto
- cantidad documentos;
- requests por usuario;
- respuestas reportadas incorrectas;
- tiempo promedio respuesta.

## Infraestructura
- costo IA;
- uso storage;
- uso embeddings;
- latencia promedio.

---

# Criterios de éxito MVP

El MVP será exitoso si:

- al menos 1–3 empresas pagan;
- los usuarios vuelven recurrentemente;
- el costo infraestructura es sostenible;
- las respuestas son suficientemente útiles;
- el deployment puede repetirse fácilmente.
