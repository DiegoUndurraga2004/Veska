## 1. UUID único por usuario
Cada usuario debe tener un identificador único e impredecible, idealmente un UUID.  
Esto evita depender de IDs incrementales tipo `1, 2, 3`, que podrían permitir adivinar usuarios o recursos ajenos.

## 2. Aislamiento por empresa mediante `tenant_id`
Todo dato debe estar asociado a una empresa/cliente mediante `tenant_id`.  
Esto aplica a usuarios, documentos, espacios, grupos, chats, chunks, embeddings, permisos, configuración IA y logs.

El filtro por `tenant_id` es obligatorio, pero no suficiente: las consultas documentales también deben validar espacios autorizados para el usuario.

## 3. Verificación de permisos en cada request
No basta con ocultar botones en el frontend.  
El backend debe verificar siempre si el usuario puede acceder al documento, espacio, subespacio, chat o empresa solicitada.

Para documentos, debe validar como mínimo:

- tenant activo;
- usuario activo;
- membresía activa;
- espacio permitido;
- herencia u override aplicable;
- estado del documento;
- permiso para la acción solicitada.

## 4. OAuth empresarial y recuperación de contraseña
OAuth con Microsoft y Google será el mecanismo principal de acceso.

La autenticación externa confirma identidad, pero Veska debe verificar después que el email tenga una membresía activa dentro de un tenant activo.

Si se habilita login local como fallback, los links de reset password deben expirar después de cierto tiempo, por ejemplo 15–60 minutos, e invalidarse después de ser usados una vez.

## 5. Sanitización y validación de inputs
Todo input del usuario debe validarse y limpiarse.  
Esto ayuda a prevenir SQL Injection, XSS, comandos maliciosos, archivos inválidos y datos corruptos.

## 6. Uso de consultas parametrizadas
Nunca construir queries SQL concatenando strings del usuario.  
Usar siempre ORM o queries parametrizadas para prevenir SQL Injection.

## 7. API protegida por autenticación
Toda ruta sensible de la API debe exigir sesión/token válido.  
No debe existir acceso público a documentos, chats, usuarios ni métricas internas.

## 8. Restricción de CORS
La API debería aceptar requests solo desde dominios autorizados.  
Esto no reemplaza la autenticación, pero reduce abuso desde sitios externos.

## 9. Rate limiting
Limitar la cantidad de requests por usuario, empresa e IP.  
Sirve para prevenir abuso, costos inesperados de IA, scraping o ataques de fuerza bruta.

## 10. Manejo seguro de errores
Los errores no deben mostrar stack traces, queries, keys o información interna.  
El usuario debe ver una pantalla o mensaje simple, mientras el detalle técnico queda en logs privados.

## 11. Logs y monitoreo básico
Registrar eventos importantes: login OAuth, login local si existe, errores, subida de documentos, importaciones masivas, eliminación de archivos, creación de espacios, cambios de permisos, cambios de grupos, cambios de proveedor IA y uso de IA.  
Esto permite detectar fallos, abuso o incidentes.

## 12. Índices en queries principales
Agregar índices en columnas usadas frecuentemente: `tenant_id`, `user_id`, `document_id`, `space_id`, `group_id`, `parent_space_id`, `created_at`.  
Esto mejora rendimiento y reduce riesgo de caídas por consultas lentas.

## 13. Backups automáticos
La base de datos y archivos deben tener backups periódicos.  
Idealmente diarios al inicio, con pruebas ocasionales de restauración.

## 14. Estrategia de rollback
Cada deploy debe poder revertirse si algo sale mal.  
Al inicio puede ser simple: mantener versión anterior estable y restaurar desde Git/backup.

## 15. Deploy seguro / Blue-Green básico
Más adelante, usar estrategia blue-green o staging antes de producción.  
Esto permite probar una nueva versión antes de enviarla a clientes reales.

## 16. Variables de entorno y secretos
API keys, passwords y tokens nunca deben quedar escritos en el código.  
Deben vivir en variables de entorno o un sistema de secrets.

## 17. Separación entre desarrollo y producción
Usar bases, buckets y credenciales distintas para desarrollo y producción.  
Nunca probar con documentos reales de clientes en ambientes inseguros.

## 18. Validación de archivos subidos
Limitar extensiones permitidas, tamaño máximo y tipo MIME.  
Para el MVP aceptar únicamente PDF, DOCX, TXT, XLSX y CSV.  
Rechazar inicialmente XLS, XLSM, ODS y cualquier extensión no aprobada.  
Validar además que el archivo no esté vacío, que su nombre sea seguro y que respete los límites del plan.

Para XLSX y CSV aplicar límites adicionales configurables:
- cantidad máxima de hojas;
- cantidad máxima de filas;
- cantidad máxima de columnas;
- cantidad máxima de celdas no vacías;
- tamaño descomprimido máximo cuando corresponda;
- tiempo máximo de parsing.

Para importaciones masivas de carpetas o ZIP aplicar límites adicionales configurables:
- cantidad máxima de archivos;
- tamaño total máximo;
- tamaño descomprimido máximo;
- profundidad máxima de carpetas;
- longitud máxima de ruta;
- timeout;
- bloqueo de path traversal;
- rechazo de zip bombs.

## 19. Escaneo básico de archivos
Idealmente analizar archivos subidos para detectar malware o contenido peligroso.  
Especialmente importante si los clientes pueden subir documentos libremente.  
Los XLSX son contenedores comprimidos, por lo que también deben revisarse límites de descompresión para reducir riesgo de archivos anómalos o zip bombs.  
Veska no debe ejecutar macros, scripts, conexiones externas ni contenido embebido activo.

## 20. Control de acceso a archivos originales
Los PDF, DOCX, TXT, XLSX y CSV guardados en storage no deben ser públicos.  
El acceso debe hacerse mediante URLs firmadas o rutas protegidas con expiración y validación previa de permisos.

## 21. Cifrado en tránsito
Toda comunicación debe usar HTTPS.  
Esto incluye frontend, backend, storage, base de datos y servicios externos.

## 22. Cifrado en reposo
Los documentos y bases de datos deberían estar cifrados en el proveedor de infraestructura.  
Esto es especialmente importante para documentos empresariales sensibles.

## 23. Auditoría de acciones críticas
Guardar registro de acciones importantes: eliminar documentos, invitar usuarios, cambiar roles, cancelar suscripción o exportar datos.

## 24. Principio de mínimo privilegio
Cada usuario, servicio y API key debe tener solo los permisos necesarios.  
Evitar usar llaves “admin” para operaciones normales.

Los tokens OAuth deben solicitar únicamente scopes necesarios para autenticación durante el MVP. El login OAuth no debe solicitar acceso a correo, SharePoint, OneDrive, Google Drive ni directorios corporativos.

## 25. Protección contra prompt injection
Como el sistema usa RAG, los documentos podrían contener instrucciones maliciosas.  
El modelo debe tener reglas claras: los documentos son fuente de información, no instrucciones del sistema.

## 26. No enviar información innecesaria al modelo
El backend debe mandar al proveedor IA solo los chunks relevantes y permitidos para ese usuario.  
Nunca enviar documentos completos, chunks de espacios no autorizados o datos de otros clientes sin necesidad.

Antes de construir el prompt, el backend debe filtrar por:

```txt
tenant_id
+
space_id permitido
+
document.status = ready
```

## 27. Límites de uso por empresa
Definir límites de requests, storage y documentos procesados por plan.  
Esto evita costos inesperados y abuso.

## 28. Eliminación segura de datos
Si una empresa cancela, debe existir un proceso claro para eliminar o exportar sus datos.  
Esto incluye documentos, chunks, embeddings e historial.

## 29. Monitoreo de costos
Registrar uso de IA por empresa y proveedor para estimar costos y márgenes.  
Importante si se usa OpenAI API, Runpod/serverless u otro proveedor por consumo.

Guardar como mínimo:

- tenant;
- proveedor;
- modelo;
- tokens de entrada;
- tokens de salida;
- costo estimado;
- latencia;
- request_id.

## 30. Testing de seguridad básico
Antes de vender a clientes reales, probar casos como:
- usuario accediendo a documentos de otra empresa;
- link directo a archivo privado;
- subida de archivo inválido;
- subida de XLSM o formato no permitido;
- XLSX corrupto;
- XLSX con demasiadas hojas, filas o celdas;
- CSV excesivamente grande;
- archivo comprimido anómalo;
- exceso de requests;
- prompts intentando revelar datos internos.

## 31. Tratamiento seguro de planillas
Las planillas deben procesarse como datos no confiables.  
Veska no debe ejecutar macros, fórmulas, scripts ni conexiones externas incluidas en archivos.  
El MVP puede leer valores almacenados y conservar fórmulas como metadata opcional, pero no debe recalcular el workbook.  
Si más adelante se exportan datos hacia CSV o XLSX, se deberá escapar contenido que pueda provocar CSV Injection o Formula Injection al abrirse en una planilla.

## 32. Permisos heredables por espacios
Los documentos deben pertenecer a espacios.  
Los permisos se asignan principalmente por grupo o usuario a nivel de espacio.

Las subcarpetas o subespacios heredan permisos del padre salvo override explícito.

La autorización debe aplicarse a:

- listado de biblioteca;
- búsquedas;
- consultas RAG;
- apertura de documento;
- URLs firmadas;
- descarga;
- eliminación;
- auditoría.

## 33. Proveedores IA configurables por tenant
El backend puede seleccionar OpenAI API o Runpod según la configuración del tenant.

No se deben mantener backends separados.

Las API keys y secretos deben vivir únicamente en backend o secret manager.

El frontend nunca debe recibir:

- `OPENAI_API_KEY`;
- `RUNPOD_API_KEY`;
- configuración sensible de endpoints;
- secretos de proveedor.

## 34. Preparación segura para conectores futuros
El MVP puede dejar preparados campos para SharePoint, OneDrive o Google Drive, pero no debe implementar sincronización automática todavía.

No se deben guardar credenciales externas en texto plano.

Cuando se implementen conectores futuros, deberán contemplar:

- OAuth con scopes mínimos;
- revocación;
- rotación;
- sincronización periódica;
- auditoría;
- revalidación de permisos;
- manejo de bajas de usuarios;
- eliminación segura de tokens.
