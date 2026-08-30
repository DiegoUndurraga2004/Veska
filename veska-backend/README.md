# Veska Backend

Backend del MVP de Veska, una plataforma privada de inteligencia artificial documental para empresas.

La API centraliza validaciones, permisos, procesamiento documental, comunicación con Supabase y futura inferencia mediante Runpod.

## Stack

- Python
- FastAPI
- Pydantic
- Uvicorn

## Requisitos

- Python 3
- pip

## Instalación local

Clonar el repositorio:

```bash
git clone URL_DEL_REPOSITORIO
cd veska-backend
```

Crear el entorno virtual:

```bash
python3 -m venv .venv
```

Activar el entorno virtual en macOS o Linux:

```bash
source .venv/bin/activate
```

Instalar dependencias:

```bash
python -m pip install -r requirements.txt
```

Crear el archivo de variables de entorno local:

```bash
cp .env.example .env
```

Levantar el servidor de desarrollo:

```bash
python -m uvicorn app.main:app --reload
```

La opción `--reload` debe utilizarse solamente durante desarrollo local.

## Verificación local

Health check:

```txt
http://localhost:8000/health
```

Documentación automática de FastAPI:

```txt
http://localhost:8000/docs
```

## Documentación técnica

Los contratos iniciales entre frontend y backend están documentados en:

```txt
docs/API_CONTRACTS.md
```

Este archivo debe actualizarse cuando se agregue, elimine o modifique un endpoint.

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
- `style:` cambios de formato sin alterar comportamiento.
- `test:` incorporación o modificación de pruebas.

## Seguridad

Nunca subir archivos `.env`, credenciales privadas, secretos ni la carpeta `.venv/`.

Las variables requeridas deben documentarse en `.env.example`.

La API debe validar autenticación, tenant y permisos antes de ejecutar acciones sensibles.
