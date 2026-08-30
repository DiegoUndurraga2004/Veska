-- Veska MVP Stage 2, slice 2: tenant configuration.
-- Adds plan default limits, tenant-specific limit overrides, and non-secret
-- tenant AI provider settings. RLS remains deny-by-default in this slice.

alter table public.plans
    add column max_users integer not null,
    add column max_documents integer not null,
    add column max_storage_gb integer not null,
    add column max_requests_month integer not null,
    add column max_file_size_mb integer not null,
    add constraint plans_max_users_positive check (max_users > 0),
    add constraint plans_max_documents_positive check (max_documents > 0),
    add constraint plans_max_storage_gb_positive check (max_storage_gb > 0),
    add constraint plans_max_requests_month_positive check (max_requests_month > 0),
    add constraint plans_max_file_size_mb_positive check (max_file_size_mb > 0);

create table public.tenant_limits (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on update cascade on delete cascade,
    max_users integer null,
    max_documents integer null,
    max_storage_gb integer null,
    max_requests_month integer null,
    max_file_size_mb integer null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint tenant_limits_tenant_id_key unique (tenant_id),
    constraint tenant_limits_max_users_positive check (max_users is null or max_users > 0),
    constraint tenant_limits_max_documents_positive check (max_documents is null or max_documents > 0),
    constraint tenant_limits_max_storage_gb_positive check (max_storage_gb is null or max_storage_gb > 0),
    constraint tenant_limits_max_requests_month_positive check (
        max_requests_month is null or max_requests_month > 0
    ),
    constraint tenant_limits_max_file_size_mb_positive check (
        max_file_size_mb is null or max_file_size_mb > 0
    )
);

create table public.tenant_ai_settings (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on update cascade on delete cascade,
    ai_provider text not null,
    model_name text null,
    enabled boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint tenant_ai_settings_tenant_id_key unique (tenant_id),
    constraint tenant_ai_settings_ai_provider_check check (ai_provider in ('openai', 'runpod')),
    constraint tenant_ai_settings_model_name_not_blank check (
        model_name is null or btrim(model_name) <> ''
    )
);

create trigger tenant_limits_set_updated_at
    before update on public.tenant_limits
    for each row
    execute function public.set_updated_at();

create trigger tenant_ai_settings_set_updated_at
    before update on public.tenant_ai_settings
    for each row
    execute function public.set_updated_at();

alter table public.tenant_limits enable row level security;
alter table public.tenant_ai_settings enable row level security;
