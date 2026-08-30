-- Veska MVP Stage 2, slice 1: core identity and tenant foundation.
-- Later Stage 2 migrations must add tenant limits, permissions, documents,
-- chunks, chats, Storage policies, and reviewed RLS policies.

create extension if not exists vector with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create table public.plans (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint plans_name_not_blank check (btrim(name) <> '')
);

create unique index plans_name_normalized_key
    on public.plans (lower(btrim(name)));

create table public.tenants (
    id uuid primary key default gen_random_uuid(),
    plan_id uuid not null references public.plans(id) on update cascade on delete restrict,
    name text not null,
    slug text not null,
    status text not null default 'trial',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint tenants_name_not_blank check (btrim(name) <> ''),
    constraint tenants_slug_not_blank check (btrim(slug) <> ''),
    constraint tenants_status_check check (
        status in ('active', 'inactive', 'trial', 'suspended', 'deleted')
    )
);

create unique index tenants_slug_normalized_key
    on public.tenants (lower(btrim(slug)));

create table public.users (
    id uuid primary key default gen_random_uuid(),
    auth_user_id uuid null references auth.users(id) on update cascade on delete set null,
    email text not null,
    name text null,
    avatar_url text null,
    auth_provider text null,
    status text not null default 'pending',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint users_email_not_blank check (btrim(email) <> ''),
    constraint users_status_check check (status in ('active', 'inactive', 'pending')),
    constraint users_auth_user_id_key unique (auth_user_id)
);

create unique index users_email_normalized_key
    on public.users (lower(btrim(email)));

create table public.platform_admins (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on update cascade on delete cascade,
    created_at timestamptz not null default now(),
    constraint platform_admins_user_id_key unique (user_id)
);

create table public.tenant_memberships (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on update cascade on delete cascade,
    user_id uuid not null references public.users(id) on update cascade on delete cascade,
    role text not null,
    status text not null default 'pending',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint tenant_memberships_role_check check (
        role in ('company_admin', 'company_user', 'read_only')
    ),
    constraint tenant_memberships_status_check check (
        status in ('active', 'inactive', 'pending')
    ),
    constraint tenant_memberships_tenant_id_user_id_key unique (tenant_id, user_id)
);

create index tenants_status_idx
    on public.tenants (status);

create index users_status_idx
    on public.users (status);

create index tenant_memberships_user_id_status_idx
    on public.tenant_memberships (user_id, status);

create index tenant_memberships_tenant_id_role_status_idx
    on public.tenant_memberships (tenant_id, role, status);

create trigger plans_set_updated_at
    before update on public.plans
    for each row
    execute function public.set_updated_at();

create trigger tenants_set_updated_at
    before update on public.tenants
    for each row
    execute function public.set_updated_at();

create trigger users_set_updated_at
    before update on public.users
    for each row
    execute function public.set_updated_at();

create trigger tenant_memberships_set_updated_at
    before update on public.tenant_memberships
    for each row
    execute function public.set_updated_at();

alter table public.plans enable row level security;
alter table public.tenants enable row level security;
alter table public.users enable row level security;
alter table public.platform_admins enable row level security;
alter table public.tenant_memberships enable row level security;
