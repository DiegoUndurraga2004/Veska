# Repository Guidelines

## What Veska Is

Veska is a private, multi-tenant document AI platform for companies. The backend is a FastAPI service responsible for authentication validation, tenant isolation, permissions, document processing, RAG retrieval, AI-provider selection, sources, logs, usage limits, and safe access to Supabase PostgreSQL, pgvector, and Storage.

## Source-of-Truth Documents

Read the relevant docs before non-trivial work:

- `docs/ROADMAP-MVP.md`: MVP sequence and current stage.
- `docs/API_CONTRACTS.md`: required API behavior, request/response shapes, statuses, and errors.
- `docs/Arquitectura_tecnica.md`: architecture and service boundaries.
- `docs/SECURITY_RULES.md`: mandatory security rules.
- `docs/MVP_Scope.md`: what is inside and outside the MVP.
- `docs/ENVIORMENTS_AND_URLS.md`: environments, URLs, CORS, and auth redirects. This is the current repo filename.
- `README.md`: local setup and branch/commit conventions.

## Current Stage

Frontend Stage 1 is complete. The next planned work is MVP Stage 2: Supabase and the data model. Do not implement Stage 2, create migrations, or configure Supabase unless the user explicitly asks for that task.

## Required Workflow

For non-trivial changes, follow: inspect -> plan -> review -> implement -> test -> review.

Inspect the existing code and docs first. Present a concise plan before editing. Wait for review when the change affects architecture, database schema, API contracts, auth, permissions, storage, AI behavior, or production configuration. Implement narrowly. Run applicable tests or explain why they cannot run. Review the final diff for API, tenant, permission, and security regressions.

## Project Structure

Application code lives in `app/`. Routes belong in `app/api/routes/`; Pydantic schemas in `app/schemas/`; domain logic in service modules such as `app/documents/service.py`, `app/chats/service.py`, `app/permissions/service.py`, and `app/rag/service.py`. Shared settings are in `app/config/settings.py`; security helpers are in `app/security/`; common responses and errors are in `app/core/`. Tests belong in `tests/`.

## Critical Architectural Invariants

All sensitive resources must be tenant-scoped. Never trust `tenant_id` from the frontend; derive tenant context from the authenticated user, active membership, and backend-side authorization. Backend authorization is mandatory on every sensitive operation. RLS is defense in depth, not the only authorization layer.

Veska application tables in `public` are backend-first. Do not grant `anon` or
`authenticated` direct table privileges unless a future architecture decision
explicitly approves Data API access. New application tables must explicitly
grant only the backend-required privileges to `service_role`; do not rely on RLS
alone. New public functions must not receive implicit frontend `EXECUTE`
access; grant function execution explicitly only when required.

Document access depends on both `tenant_id` and accessible spaces. RAG retrieval must filter by `tenant_id`, permitted `space_id`, and `document.status = ready`. Private documents and original files must never become publicly accessible. Use protected routes or signed URLs with prior permission checks.

Secrets must never reach the frontend. AI providers must receive only the authorized, relevant chunks needed for the user request, not full documents, unrelated tenant data, credentials, or internal system details. API behavior must remain consistent with `docs/API_CONTRACTS.md`.

## Multi-Tenant Rules

Tenant-owned database tables for memberships, groups, spaces, permissions, documents, chunks, embeddings, chats, messages, sources, logs, usage, limits, invitations, jobs, and AI settings must include or be joinable to `tenant_id`. Critical queries must filter by tenant and validate active tenant, active user, active membership, role, permissions, and resource ownership. `platform_admin` capabilities must be explicit and audited, not accidental bypasses.

Identity invariant: `users` are global Veska identities; `users.id` is a Veska-owned UUID; Supabase Auth is linked through nullable `users.auth_user_id`; tenant authorization comes from `tenant_memberships`; `platform_admin` is separate from tenant roles and is represented through `platform_admins`.

## Security Rules

Do not expose stack traces, SQL, keys, internal paths, or cross-tenant information in user-facing errors. Validate and sanitize all inputs. Use parameterized queries or structured database APIs only. Enforce CORS by environment; never use `CORS_ORIGINS=*` in production. Uploaded files are untrusted: allow only PDF, DOCX, TXT, XLSX, and CSV in the MVP; reject macros and unsupported spreadsheet formats; apply size, MIME, path traversal, zip bomb, and spreadsheet limits.

## Database Migration Rules

No migration system is currently present. When Stage 2 begins, introduce migrations only through the agreed Supabase workflow and keep them committed in a predictable migrations directory. Each migration must be small, ordered, reviewable, and tied to the data model described in the official docs. Include tenant scoping, foreign keys, indexes on common filters, timestamps, soft-delete/status fields where specified, and initial RLS policies. Never run production migrations from local assumptions; document rollback or forward-fix strategy for risky changes.

## API Contract Synchronization

Any change to endpoints, fields, validation rules, status codes, error codes, pagination, auth requirements, document states, roles, chat scopes, or source metadata must update `docs/API_CONTRACTS.md` in the same change. If implementation and contract disagree, treat the contract as the product agreement and either update code to match it or explicitly propose a contract change.

## Commands

- `python3 -m venv .venv`: create a virtual environment.
- `source .venv/bin/activate`: activate it on macOS/Linux.
- `python -m pip install -r requirements.txt`: install runtime dependencies.
- `cp .env.example .env`: create local configuration.
- `python -m uvicorn app.main:app --reload`: run the API on `http://localhost:8000`.
- `python -m pytest`: run tests once test dependencies are available. The current `requirements.txt` does not list pytest.

Use `http://localhost:8000/health` for health checks and `http://localhost:8000/docs` for FastAPI docs.

## Do Not Invent Outside MVP Scope

Do not add ERP, CRM, accounting, billing, inventory, HR, collaboration, messaging, BI dashboards, autonomous multi-agent workflows, fine-tuning, proprietary model training, Kubernetes, dedicated GPU infrastructure, automatic Drive/SharePoint/OneDrive sync, Microsoft Graph permission inheritance, corporate directory imports, spreadsheet editing, macro execution, formula recalculation, chart interpretation, or public document sharing unless the source docs and user request explicitly move that item into scope.

## Coding and Commit Style

Use standard Python style with 4-space indentation, `snake_case` modules/functions/fields, and `PascalCase` classes. Keep route handlers thin and place business logic in service modules. Follow commit prefixes from the README: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `style:`, and `test:`. Use `feature/*` and `fix/*` branches from `develop`.


All persistent database schema changes must be represented as committed migrations.
Do not make undocumented schema changes directly in the Supabase dashboard or through ad-hoc SQL.

Any change involving tenant-scoped data, spaces, permissions, documents, chats,
or RLS must include tests for both authorized access and cross-tenant /
unauthorized access.

Never connect agent tooling or Supabase MCP to the production project.
Agent-driven database work must use development or isolated database branches.
