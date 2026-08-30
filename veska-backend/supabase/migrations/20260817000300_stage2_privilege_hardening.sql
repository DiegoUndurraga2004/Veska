-- Veska MVP Stage 2 security hardening: backend-first table privileges.
-- RLS remains enabled as defense in depth, but frontend Data API roles should
-- not receive direct access to Veska application tables by default.

revoke all privileges on table
    public.plans,
    public.tenants,
    public.users,
    public.platform_admins,
    public.tenant_memberships,
    public.tenant_limits,
    public.tenant_ai_settings
from anon, authenticated, service_role;

grant select, insert, update, delete on table
    public.plans,
    public.tenants,
    public.users,
    public.platform_admins,
    public.tenant_memberships,
    public.tenant_limits,
    public.tenant_ai_settings
to service_role;

alter default privileges for role postgres in schema public
    revoke all privileges on tables from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
    revoke truncate, references, trigger, maintain on tables
    from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
    revoke all privileges on sequences from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
    revoke usage, select, update on sequences
    from anon, authenticated, service_role;

revoke execute on function public.set_updated_at()
from public, anon, authenticated, service_role;

-- PostgreSQL grants EXECUTE on new functions to PUBLIC by global default.
-- Revoke globally for postgres-owned future functions, then clear any
-- public-schema specific default EXECUTE grants as well.
alter default privileges for role postgres
    revoke execute on functions from public, anon, authenticated, service_role;

alter default privileges for role postgres in schema public
    revoke execute on functions from public, anon, authenticated, service_role;
