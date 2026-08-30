# Supabase Migrations

This directory contains Veska database migrations for Supabase.

## Local Workflow

Local development migrations may be reset and rebuilt while they have not been
applied to any shared environment:

```bash
supabase start
supabase db reset
npx supabase@2.114.0 test db --local supabase/tests/database
```

The database tests are pgTAP tests and are the behavioral verification for
migrations. Python tests in `tests/` are static guardrails only.

## Privilege Model

Veska public application tables are backend-first. `anon` and `authenticated`
must not receive direct table privileges unless a future migration documents an
approved Data API use case. RLS is defense in depth, not a substitute for
GRANT/REVOKE hardening.

New application tables should explicitly grant only the privileges the backend
needs to `service_role`. New public functions should not inherit frontend
`EXECUTE`; grant execution explicitly only when required.

New public application tables must explicitly enable RLS in the same migration
that creates them. The `ensure_rls` event trigger and `public.rls_auto_enable()`
function are infrastructure-only defense in depth for missed table creation
paths; they are not a substitute for explicit RLS statements in migrations and
must not be exposed as application RPCs.

Review every `SECURITY DEFINER` function before merging. The review must cover
the function owner, `search_path`, direct `EXECUTE` grants, caller-controlled
object names, and whether the function is reachable from frontend/Data API
roles.

## Shared And Production Rules

Once a migration has been applied to a shared development, staging, or
production environment, do not edit that historical migration file.

Corrections must be delivered through a new forward-fix migration.

Production database changes require review before execution and must include a
rollback or forward-fix plan appropriate to the risk of the change.

Never run production migrations from local assumptions.
