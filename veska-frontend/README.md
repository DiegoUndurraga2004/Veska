# Veska Frontend

Frontend web del MVP de Veska, una plataforma privada de inteligencia artificial documental para empresas.

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS

## Requisitos

- Node.js 20.9 o superior
- npm

## Instalación local

Clonar el repositorio:

```bash
git clone URL_DEL_REPOSITORIO
cd veska-frontend
```

Instalar dependencias:

```bash
npm install
```

Crear el archivo de variables de entorno local:

```bash
cp .env.example .env.local
```

Levantar el servidor de desarrollo:

```bash
npm run dev
```

Abrir en el navegador:

```txt
http://localhost:3000
```

## Comandos principales

Levantar el servidor de desarrollo:

```bash
npm run dev
```

Crear un build de producción:

```bash
npm run build
```

Iniciar el build de producción localmente:

```bash
npm run start
```

Ejecutar linting:

```bash
npm run lint
```

## Ambientes

- `development`: pruebas y desarrollo local.
- `production`: versión estable utilizada por clientes.
- `staging`: reservado para una etapa futura.

Nunca utilizar documentos reales de clientes en `development`.

## Flujo Git

- `main`: versión estable.
- `develop`: integración de cambios en desarrollo.
- `feature/*`: funcionalidades específicas.
- `fix/*`: correcciones específicas.

## Convención de commits

- `feat:` nueva funcionalidad.
- `fix:` corrección de error.
- `chore:` configuración o mantenimiento.
- `docs:` documentación.
- `refactor:` mejora interna sin cambiar comportamiento.
- `style:` ajustes visuales o de formato.
- `test:` incorporación o modificación de pruebas.

## Seguridad

Nunca subir archivos `.env`, credenciales privadas ni secretos al repositorio.

Las variables públicas requeridas deben documentarse en `.env.example`.

Las claves privadas, como la `SUPABASE_SERVICE_ROLE_KEY`, nunca deben llegar al frontend.
