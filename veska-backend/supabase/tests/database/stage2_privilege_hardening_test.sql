select no_plan();

create temporary table stage2_app_tables (
    table_name text primary key
);

insert into stage2_app_tables (table_name)
values
    ('public.plans'),
    ('public.tenants'),
    ('public.users'),
    ('public.platform_admins'),
    ('public.tenant_memberships'),
    ('public.tenant_limits'),
    ('public.tenant_ai_settings');

create temporary table stage2_frontend_roles (
    role_name text primary key
);

insert into stage2_frontend_roles (role_name)
values
    ('anon'),
    ('authenticated');

create temporary table stage2_data_api_roles (
    role_name text primary key
);

insert into stage2_data_api_roles (role_name)
values
    ('anon'),
    ('authenticated'),
    ('service_role');

create temporary table stage2_table_privileges (
    privilege_name text primary key
);

insert into stage2_table_privileges (privilege_name)
values
    ('SELECT'),
    ('INSERT'),
    ('UPDATE'),
    ('DELETE'),
    ('TRUNCATE'),
    ('REFERENCES'),
    ('TRIGGER'),
    ('MAINTAIN');

select ok(
    not has_table_privilege(role_name, table_name, privilege_name),
    format('%s has no %s on %s', role_name, privilege_name, table_name)
)
from stage2_frontend_roles
cross join stage2_app_tables
cross join stage2_table_privileges
order by role_name, table_name, privilege_name;

select ok(
    has_table_privilege('service_role', table_name, privilege_name),
    format('service_role has %s on %s', privilege_name, table_name)
)
from stage2_app_tables
cross join (
    values
        ('SELECT'),
        ('INSERT'),
        ('UPDATE'),
        ('DELETE')
) as required_service_privileges(privilege_name)
order by table_name, privilege_name;

select ok(
    not has_table_privilege('service_role', table_name, privilege_name),
    format('service_role has no %s on %s', privilege_name, table_name)
)
from stage2_app_tables
cross join (
    values
        ('TRUNCATE'),
        ('REFERENCES'),
        ('TRIGGER'),
        ('MAINTAIN')
) as forbidden_service_privileges(privilege_name)
order by table_name, privilege_name;

select is(
    (
        select count(*)::integer
        from pg_class
        where relnamespace = 'public'::regnamespace
            and relname in (
                'plans',
                'tenants',
                'users',
                'platform_admins',
                'tenant_memberships',
                'tenant_limits',
                'tenant_ai_settings'
            )
            and relrowsecurity
    ),
    7,
    'RLS remains enabled on all current Veska application tables'
);

select is(
    (
        select count(*)::integer
        from pg_policy
        where polrelid in (
            'public.plans'::regclass,
            'public.tenants'::regclass,
            'public.users'::regclass,
            'public.platform_admins'::regclass,
            'public.tenant_memberships'::regclass,
            'public.tenant_limits'::regclass,
            'public.tenant_ai_settings'::regclass
        )
    ),
    0,
    'no RLS policies have been added to current Veska application tables'
);

select is(
    (
        select count(*)::integer
        from pg_default_acl
        cross join lateral aclexplode(defaclacl) as acl
        where defaclrole = 'postgres'::regrole
            and defaclnamespace = 'public'::regnamespace
            and defaclobjtype = 'r'
            and acl.grantee in (
                'anon'::regrole,
                'authenticated'::regrole,
                'service_role'::regrole
            )
    ),
    0,
    'postgres default public table privileges grant no access to Data API roles'
);

select is(
    (
        select count(*)::integer
        from pg_default_acl
        cross join lateral aclexplode(defaclacl) as acl
        where defaclrole = 'postgres'::regrole
            and defaclnamespace = 'public'::regnamespace
            and defaclobjtype = 'S'
            and acl.grantee in (
                'anon'::regrole,
                'authenticated'::regrole,
                'service_role'::regrole
            )
    ),
    0,
    'postgres default public sequence privileges grant no access to Data API roles'
);

drop table if exists public.stage2_privilege_probe_table;
drop sequence if exists public.stage2_privilege_probe_sequence;

create table public.stage2_privilege_probe_table (
    id integer
);

create sequence public.stage2_privilege_probe_sequence;

select is(
    (
        select count(*)::integer
        from stage2_data_api_roles
        cross join stage2_table_privileges
        where has_table_privilege(
            role_name,
            'public.stage2_privilege_probe_table',
            privilege_name
        )
    ),
    0,
    'future public tables created by postgres grant no automatic Data API role privileges'
);

select is(
    (
        select count(*)::integer
        from stage2_data_api_roles
        cross join (
            values
                ('USAGE'),
                ('SELECT'),
                ('UPDATE')
        ) as sequence_privileges(privilege_name)
        where has_sequence_privilege(
            role_name,
            'public.stage2_privilege_probe_sequence',
            privilege_name
        )
    ),
    0,
    'future public sequences created by postgres grant no automatic Data API role privileges'
);

drop table public.stage2_privilege_probe_table;
drop sequence public.stage2_privilege_probe_sequence;

select is(
    (
        select count(*)::integer
        from pg_default_acl
        cross join lateral aclexplode(defaclacl) as acl
        where defaclrole = 'postgres'::regrole
            and defaclobjtype = 'f'
            and defaclnamespace in (0::oid, 'public'::regnamespace)
            and acl.privilege_type = 'EXECUTE'
            and acl.grantee in (
                0::oid,
                'anon'::regrole,
                'authenticated'::regrole,
                'service_role'::regrole
            )
    ),
    0,
    'postgres function default ACLs do not grant EXECUTE to PUBLIC or Data API roles'
);

drop function if exists public.stage2_privilege_probe();

select is(
    (
        select count(*)::integer
        from pg_proc
        cross join lateral aclexplode(coalesce(proacl, acldefault('f', proowner))) as acl
        where oid = 'public.set_updated_at()'::regprocedure
            and acl.privilege_type = 'EXECUTE'
            and acl.grantee = 0::oid
    ),
    0,
    'PUBLIC cannot execute public.set_updated_at()'
);
select ok(
    not has_function_privilege('anon', 'public.set_updated_at()', 'EXECUTE'),
    'anon cannot execute public.set_updated_at()'
);
select ok(
    not has_function_privilege('authenticated', 'public.set_updated_at()', 'EXECUTE'),
    'authenticated cannot execute public.set_updated_at()'
);
select ok(
    not has_function_privilege('service_role', 'public.set_updated_at()', 'EXECUTE'),
    'service_role cannot execute public.set_updated_at()'
);

create or replace function public.stage2_privilege_probe()
returns integer
language sql
as $$
    select 1;
$$;

select is(
    (
        select count(*)::integer
        from pg_proc
        cross join lateral aclexplode(coalesce(proacl, acldefault('f', proowner))) as acl
        where oid = 'public.stage2_privilege_probe()'::regprocedure
            and acl.privilege_type = 'EXECUTE'
            and acl.grantee = 0::oid
    ),
    0,
    'future public functions created by postgres are not executable by PUBLIC'
);
select ok(
    not has_function_privilege('anon', 'public.stage2_privilege_probe()', 'EXECUTE'),
    'future public functions created by postgres are not executable by anon'
);
select ok(
    not has_function_privilege('authenticated', 'public.stage2_privilege_probe()', 'EXECUTE'),
    'future public functions created by postgres are not executable by authenticated'
);
select ok(
    not has_function_privilege('service_role', 'public.stage2_privilege_probe()', 'EXECUTE'),
    'future public functions created by postgres are not executable by service_role'
);

drop function public.stage2_privilege_probe();

delete from public.tenant_ai_settings
where tenant_id in (
    select id
    from public.tenants
    where slug = 'stage2-privilege-tenant'
);

delete from public.tenant_limits
where tenant_id in (
    select id
    from public.tenants
    where slug = 'stage2-privilege-tenant'
);

delete from public.tenants
where slug = 'stage2-privilege-tenant';

delete from public.plans
where name = 'Stage 2 Privilege Plan';

insert into public.plans (
    name,
    max_users,
    max_documents,
    max_storage_gb,
    max_requests_month,
    max_file_size_mb
)
values (
    'Stage 2 Privilege Plan',
    10,
    500,
    10,
    2000,
    25
);

insert into public.tenants (plan_id, name, slug, status)
select id, 'Stage 2 Privilege Tenant', 'stage2-privilege-tenant', 'trial'
from public.plans
where name = 'Stage 2 Privilege Plan';

insert into public.tenant_limits (tenant_id, max_users)
select id, 5
from public.tenants
where slug = 'stage2-privilege-tenant';

create temporary table stage2_trigger_probe (
    before_update timestamptz not null
);

insert into stage2_trigger_probe (before_update)
select updated_at
from public.tenant_limits
where tenant_id = (
    select id
    from public.tenants
    where slug = 'stage2-privilege-tenant'
);

select pg_sleep(1.01);

set role service_role;

update public.tenant_limits
set max_users = 6
where tenant_id = (
    select id
    from public.tenants
    where slug = 'stage2-privilege-tenant'
);

reset role;

select cmp_ok(
    (
        select updated_at
        from public.tenant_limits
        where tenant_id = (
            select id
            from public.tenants
            where slug = 'stage2-privilege-tenant'
        )
    ),
    '>',
    (
        select before_update
        from stage2_trigger_probe
    ),
    'updated_at trigger still operates after EXECUTE is revoked from Data API roles'
);

delete from public.tenant_limits
where tenant_id in (
    select id
    from public.tenants
    where slug = 'stage2-privilege-tenant'
);

delete from public.tenants
where slug = 'stage2-privilege-tenant';

delete from public.plans
where name = 'Stage 2 Privilege Plan';

select * from finish();
