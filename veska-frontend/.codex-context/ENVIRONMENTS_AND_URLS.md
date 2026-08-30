# Veska Environments and URLs

## 1. Objetivo

Este documento define la arquitectura oficial de dominios, rutas públicas, rutas privadas y ambientes del MVP de Veska.

Su propósito es mantener una referencia única para:

- configurar DNS;
- desplegar frontend y backend;
- configurar variables de entorno;
- restringir CORS;
- configurar Supabase Auth;
- definir redirects de autenticación;
- evitar inconsistencias entre desarrollo y producción;
- preparar la incorporación futura de un ambiente de staging.

Este documento debe actualizarse cuando cambie una URL pública, una ruta de autenticación o la estrategia de ambientes.

---

# 2. Decisión de arquitectura

Veska utilizará una separación clara entre:

1. sitio web público;
2. workspace privado;
3. backend;
4. ambiente local de desarrollo.

La arquitectura oficial será:

```txt
veska.cl       → landing page pública
app.veska.cl   → workspace privado
api.veska.cl   → backend FastAPI
```

La landing page y el workspace no deben mezclarse en una misma URL base.

---

# 3. Web pública

## 3.1 Dominio principal

La landing page pública de Veska estará disponible en:

```txt
https://veska.cl
```

## 3.2 Responsabilidad

La landing page debe utilizarse para:

- explicar qué es Veska;
- comunicar la propuesta de valor;
- mostrar información comercial;
- incluir un acceso al login;
- permitir contacto comercial;
- presentar información pública de la empresa.

La landing page no debe contener:

- lógica sensible;
- documentos privados;
- paneles internos;
- información de tenants;
- API keys;
- credenciales;
- acceso directo a storage privado.

## 3.3 Redirección desde `www`

La variante con `www` debe redirigir permanentemente al dominio principal:

```txt
https://www.veska.cl → https://veska.cl
```

La redirección debe:

- utilizar código HTTP `301`;
- preservar rutas;
- preservar query strings;
- mantener HTTPS.

Ejemplos esperados:

```txt
https://www.veska.cl
→ https://veska.cl

https://www.veska.cl/contacto
→ https://veska.cl/contacto

https://www.veska.cl/?ref=demo
→ https://veska.cl/?ref=demo
```

---

# 4. Workspace privado

## 4.1 Dominio principal de la aplicación

El workspace privado de Veska estará disponible en:

```txt
https://app.veska.cl
```

## 4.2 Responsabilidad

El workspace debe permitir:

- iniciar sesión mediante OAuth Microsoft o Google;
- cerrar sesión;
- aceptar invitaciones;
- recuperar contraseña;
- acceder al dashboard;
- ver chats;
- crear chats;
- consultar documentos;
- subir documentos;
- revisar fuentes;
- administrar usuarios según rol;
- acceder al panel interno de plataforma según rol.

El workspace debe ser la única interfaz web autorizada para operar con datos privados de empresas cliente.

---

# 5. Rutas del workspace

## 5.1 Rutas públicas de autenticación

Estas rutas pertenecen al workspace, pero deben ser accesibles sin una sesión activa.

| Función                              | Ruta                                     |
| ------------------------------------ | ---------------------------------------- |
| Login                                | `https://app.veska.cl/login`             |
| Solicitar recuperación de contraseña | `https://app.veska.cl/forgot-password`   |
| Definir nueva contraseña             | `https://app.veska.cl/reset-password`    |
| Aceptar invitación                   | `https://app.veska.cl/accept-invitation` |
| Callback de autenticación OAuth      | `https://app.veska.cl/auth/callback`     |

## 5.2 Diferencia entre recuperación y cambio de contraseña

Las rutas deben cumplir funciones distintas:

```txt
/forgot-password
```

Permite que el usuario solicite el envío de un correo de recuperación.

```txt
/reset-password
```

Permite que el usuario establezca una nueva contraseña después de abrir el enlace recibido por correo.

## 5.3 Rutas privadas principales

Las siguientes rutas requerirán sesión activa cuando sean implementadas:

| Función                      | Ruta                                           |
| ---------------------------- | ---------------------------------------------- |
| Dashboard                    | `https://app.veska.cl/dashboard`               |
| Lista de chats               | `https://app.veska.cl/chats`                   |
| Chat individual              | `https://app.veska.cl/chats/{chat_id}`         |
| Biblioteca documental        | `https://app.veska.cl/documents`               |
| Documento individual         | `https://app.veska.cl/documents/{document_id}` |
| Subida de documentos         | `https://app.veska.cl/upload`                  |
| Perfil de usuario            | `https://app.veska.cl/profile`                 |
| Administración de empresa    | `https://app.veska.cl/admin`                   |
| Administración de plataforma | `https://app.veska.cl/platform`                |
| Acceso no autorizado         | `https://app.veska.cl/unauthorized`            |

Las rutas privadas deben validar sesión, tenant activo, estado del usuario y permisos aplicables.

---

# 6. Backend

## 6.1 Dominio principal

El backend FastAPI estará disponible en:

```txt
https://api.veska.cl
```

## 6.2 Responsabilidad

El backend debe centralizar:

- autenticación;
- validación de sesiones;
- identificación del tenant;
- autorización;
- permisos;
- validación de inputs;
- validación de archivos;
- acceso a storage privado;
- generación de URLs firmadas;
- procesamiento documental;
- chunking;
- embeddings;
- recuperación semántica;
- construcción de prompts;
- comunicación con proveedores IA configurados;
- historial de chats;
- fuentes;
- logs;
- métricas;
- límites de uso;
- manejo seguro de errores.

El frontend nunca debe comunicarse directamente con OpenAI, Runpod u otros proveedores IA.

El frontend tampoco debe utilizar credenciales elevadas de Supabase.

## 6.3 Endpoints públicos mínimos

Los endpoints públicos deben mantenerse al mínimo necesario.

Ejemplo:

```txt
GET https://api.veska.cl/health
```

## 6.4 Endpoints privados

Todos los endpoints que operen con usuarios, documentos, chats, métricas o administración deben exigir autenticación y validaciones de permisos en backend.

---

# 7. Desarrollo local

## 7.1 Frontend local

El frontend Next.js estará disponible en:

```txt
http://localhost:3000
```

## 7.2 Backend local

El backend FastAPI estará disponible en:

```txt
http://localhost:8000
```

## 7.3 Health check local

```txt
http://localhost:8000/health
```

## 7.4 Documentación automática local de FastAPI

```txt
http://localhost:8000/docs
```

## 7.5 Regla de datos

Nunca utilizar documentos reales de clientes en desarrollo local.

Los datos utilizados en development deben ser:

- ficticios;
- anonimizados;
- creados específicamente para testing;
- documentación interna no sensible de Veska.

---

# 8. Ambientes

## 8.1 Development

### Estado

Activo desde el inicio del MVP.

### Objetivo

Permitir:

- desarrollo local;
- pruebas;
- cambios frecuentes;
- testing funcional;
- uso de datos ficticios;
- validación previa a producción.

### URLs

```txt
Frontend:
http://localhost:3000

Backend:
http://localhost:8000
```

### Reglas

- No utilizar credenciales de producción.
- No utilizar documentos reales de clientes.
- No subir secretos al repositorio.
- Utilizar variables de entorno locales.
- Permitir cambios frecuentes sin afectar clientes.

---

## 8.2 Production

### Estado

Activo cuando el MVP se despliegue para clientes reales.

### Objetivo

Operar la versión estable utilizada por usuarios reales.

### URLs

```txt
Landing page:
https://veska.cl

Workspace:
https://app.veska.cl

Backend:
https://api.veska.cl
```

### Reglas

- Utilizar credenciales exclusivas de producción.
- Habilitar HTTPS.
- Restringir CORS.
- Utilizar storage privado.
- Registrar logs.
- Monitorear errores.
- Monitorear costos.
- Evitar deploys directos desde ramas inestables.
- Utilizar únicamente código fusionado a `main`.

---

## 8.3 Staging

### Estado

Reservado para una etapa futura.

No debe crearse todavía si no existe una necesidad operacional real.

### Objetivo futuro

Permitir pruebas integradas antes de desplegar a producción cuando el equipo crezca o existan múltiples tareas en paralelo.

### Nombres recomendados si se activa

```txt
Frontend staging:
https://staging-app.veska.cl

Backend staging:
https://staging-api.veska.cl
```

### Regla

Staging debe utilizar:

- credenciales independientes;
- base de datos independiente;
- storage independiente;
- datos ficticios o anonimizados;
- configuración separada de production.

---

# 9. Matriz resumida de URLs

| Ambiente       | Componente                | URL                                       |
| -------------- | ------------------------- | ----------------------------------------- |
| Production     | Landing page              | `https://veska.cl`                        |
| Production     | Redirección pública       | `https://www.veska.cl → https://veska.cl` |
| Production     | Workspace                 | `https://app.veska.cl`                    |
| Production     | Login                     | `https://app.veska.cl/login`              |
| Production     | Solicitud de recuperación | `https://app.veska.cl/forgot-password`    |
| Production     | Cambio de contraseña      | `https://app.veska.cl/reset-password`     |
| Production     | Aceptación de invitación  | `https://app.veska.cl/accept-invitation`  |
| Production     | Callback de autenticación | `https://app.veska.cl/auth/callback`      |
| Production     | Backend                   | `https://api.veska.cl`                    |
| Development    | Frontend                  | `http://localhost:3000`                   |
| Development    | Backend                   | `http://localhost:8000`                   |
| Future staging | Frontend                  | `https://staging-app.veska.cl`            |
| Future staging | Backend                   | `https://staging-api.veska.cl`            |

---

# 10. Configuración de CORS

## 10.1 Development

El backend local debe permitir solicitudes desde:

```txt
http://localhost:3000
```

Ejemplo de variable de entorno:

```env
CORS_ORIGINS=http://localhost:3000
```

## 10.2 Production

El backend desplegado debe permitir solicitudes desde:

```txt
https://app.veska.cl
```

Ejemplo:

```env
CORS_ORIGINS=https://app.veska.cl
```

## 10.3 Regla de seguridad

No utilizar:

```env
CORS_ORIGINS=*
```

en producción.

La landing page pública:

```txt
https://veska.cl
```

no debe acceder por defecto a endpoints privados del backend.

Si en el futuro la landing requiere un formulario de contacto conectado al backend, debe utilizarse un endpoint público específico, limitado y protegido contra abuso.

---

# 11. Configuración de Supabase Auth

## 11.0 Proveedores OAuth del MVP

Supabase Auth debe habilitar:

```txt
Microsoft
Google
```

OAuth será el mecanismo principal de acceso.

El callback debe volver al workspace:

```txt
https://app.veska.cl/auth/callback
```

y en desarrollo:

```txt
http://localhost:3000/auth/callback
```

El login OAuth solo confirma identidad. Después del callback, Veska debe validar membresía activa y tenant activo mediante backend.

Las credenciales OAuth de cada proveedor deben configurarse en Supabase o en el proveedor de autenticación correspondiente. No deben exponerse en el frontend.

---

## 11.1 Site URL de producción

Cuando se configure Supabase Auth para production, utilizar:

```txt
https://app.veska.cl
```

como Site URL principal del workspace.

## 11.2 Redirect URLs de producción

Registrar expresamente las rutas necesarias:

```txt
https://app.veska.cl/auth/callback
https://app.veska.cl/accept-invitation
https://app.veska.cl/reset-password
```

## 11.3 Redirect URLs de desarrollo

Registrar también las rutas equivalentes para desarrollo local:

```txt
http://localhost:3000/auth/callback
http://localhost:3000/accept-invitation
http://localhost:3000/reset-password
```

## 11.4 Wildcards

Los wildcards pueden utilizarse durante desarrollo local o previews si resultan necesarios.

Ejemplo:

```txt
http://localhost:3000/**
```

En producción deben preferirse rutas exactas.

## 11.5 Regla de consistencia

Cuando el código utilice un parámetro `redirectTo`, su valor debe coincidir con una URL permitida en la configuración de Supabase Auth.

---

# 12. Variables de entorno del frontend

El archivo:

```txt
veska-frontend/.env.example
```

debe documentar variables públicas como:

```env
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_AUTH_CALLBACK_URL=http://localhost:3000/auth/callback
```

## 12.1 Valores esperados en production

```env
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_SITE_URL=https://app.veska.cl
NEXT_PUBLIC_API_URL=https://api.veska.cl
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_AUTH_CALLBACK_URL=https://app.veska.cl/auth/callback
```

## 12.2 Regla de seguridad

El frontend nunca debe contener:

```txt
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
RUNPOD_API_KEY
DATABASE_URL
JWT_SECRET
```

---

# 13. Variables de entorno del backend

El archivo:

```txt
veska-backend/.env.example
```

debe documentar variables como:

```env
ENVIRONMENT=development

BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
PUBLIC_WEBSITE_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

DATABASE_URL=

OPENAI_API_KEY=
RUNPOD_API_KEY=
RUNPOD_ENDPOINT_ID=

DEFAULT_AI_PROVIDER=openai
DEFAULT_OPENAI_MODEL=
DEFAULT_RUNPOD_MODEL=

JWT_SECRET=change-me-in-production

MAX_FILE_SIZE_MB=25
MAX_QUESTION_LENGTH=4000
MAX_CHUNKS_PER_QUERY=8

MAX_BULK_IMPORT_FILES=5000
MAX_BULK_IMPORT_TOTAL_SIZE_MB=2048
MAX_BULK_IMPORT_DEPTH=12
MAX_ZIP_UNCOMPRESSED_SIZE_MB=4096
MAX_RELATIVE_PATH_LENGTH=500
```

## 13.1 Valores esperados en production

```env
ENVIRONMENT=production

BACKEND_URL=https://api.veska.cl
FRONTEND_URL=https://app.veska.cl
PUBLIC_WEBSITE_URL=https://veska.cl
CORS_ORIGINS=https://app.veska.cl
```

Los secretos reales deben configurarse directamente en el proveedor de hosting y nunca subirse al repositorio.

---

# 14. DNS y redirects

## 14.1 Registros necesarios

La configuración exacta dependerá de los proveedores elegidos durante el deploy.

Como mínimo, se requerirán registros para:

```txt
@       → landing page
www     → redirección hacia dominio raíz
app     → workspace
api     → backend
```

## 14.2 Redirección pública

La redirección oficial será:

```txt
https://www.veska.cl → https://veska.cl
```

Debe configurarse mediante Cloudflare Redirect Rules o una herramienta equivalente.

## 14.3 Regla de Cloudflare

Si se utiliza Cloudflare Redirect Rules, los registros DNS involucrados deben estar proxied a través de Cloudflare.

## 14.4 HTTPS

Todos los dominios de producción deben utilizar HTTPS:

```txt
https://veska.cl
https://www.veska.cl
https://app.veska.cl
https://api.veska.cl
```

---

# 15. Flujo Git y deploy

## 15.1 Development

Los cambios se integran inicialmente en:

```txt
develop
```

## 15.2 Production

Solo el código estable fusionado a:

```txt
main
```

debe desplegarse a producción.

## 15.3 Flujo recomendado

```txt
feature/* → develop → main
```

## 15.4 Regla

No desplegar ramas `feature/*` directamente a producción.

---

# 16. Decisiones pendientes para la etapa de deploy

Las siguientes decisiones deben tomarse cuando se implemente el deploy:

- proveedor de hosting para landing page;
- proveedor de hosting para workspace;
- proveedor de hosting para backend;
- registros DNS exactos;
- configuración final de SSL;
- reglas exactas de Cloudflare;
- estrategia de deploy automático;
- variables de entorno finales;
- configuración production de Supabase Auth;
- credenciales OAuth Microsoft y Google;
- configuración del proveedor IA por tenant;
- configuración de emails de recuperación e invitación;
- necesidad futura de previews o staging.

---

# 17. Reglas de mantenimiento

Actualizar este archivo cuando ocurra alguno de estos cambios:

- incorporación de una nueva URL pública;
- modificación de una ruta de autenticación;
- cambio de dominio;
- cambio de ambiente;
- activación de staging;
- cambio de hosting;
- modificación de CORS;
- cambio en redirects;
- cambio de proveedor OAuth;
- cambio de variables o secretos de proveedor IA;
- incorporación de previews;
- cambio en variables de entorno requeridas.

Antes de desplegar producción, verificar que las URLs documentadas coincidan con:

1. DNS;
2. variables de entorno;
3. configuración CORS;
4. configuración de Supabase Auth;
5. rutas implementadas en frontend;
6. configuración del proveedor de hosting.
