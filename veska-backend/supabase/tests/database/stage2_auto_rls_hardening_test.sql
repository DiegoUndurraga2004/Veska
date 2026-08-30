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

select has_function(
    'public',
    'rls_auto_enable',
    array[]::name[],
    'rls_auto_enable function exists'
);

select is(
    (
        select pg_get_function_result('public.rls_auto_enable()'::regprocedure)
    ),
    'event_trigger',
    'rls_auto_enable returns event_trigger'
);

select is(
    (
        select prosecdef
        from pg_proc
        where oid = 'public.rls_auto_enable()'::regprocedure
    ),
    true,
    'rls_auto_enable is SECURITY DEFINER'
);

select is(
    (
        select proconfig
        from pg_proc
        where oid = 'public.rls_auto_enable()'::regprocedure
    ),
    array['search_path=pg_catalog']::text[],
    'rls_auto_enable sets search_path to pg_catalog'
);

select is(
    (
        select rolname
        from pg_proc
        join pg_roles
            on pg_roles.oid = pg_proc.proowner
        where pg_proc.oid = 'public.rls_auto_enable()'::regprocedure
    ),
    'postgres',
    'postgres owns rls_auto_enable'
);

select is(
    (
        select count(*)::integer
        from pg_proc
        cross join lateral aclexplode(coalesce(proacl, acldefault('f', proowner))) as acl
        where oid = 'public.rls_auto_enable()'::regprocedure
            and acl.privilege_type = 'EXECUTE'
            and acl.grantee = 0::oid
    ),
    0,
    'PUBLIC cannot execute rls_auto_enable'
);

select ok(
    not has_function_privilege('anon', 'public.rls_auto_enable()', 'EXECUTE'),
    'anon cannot execute rls_auto_enable'
);
select ok(
    not has_function_privilege('authenticated', 'public.rls_auto_enable()', 'EXECUTE'),
    'authenticated cannot execute rls_auto_enable'
);
select ok(
    not has_function_privilege('service_role', 'public.rls_auto_enable()', 'EXECUTE'),
    'service_role cannot execute rls_auto_enable'
);
select ok(
    has_function_privilege('postgres', 'public.rls_auto_enable()', 'EXECUTE'),
    'postgres retains EXECUTE on rls_auto_enable'
);

select is(
    (
        select count(*)::integer
        from pg_event_trigger
        where evtname = 'ensure_rls'
            and evtenabled = 'O'
    ),
    1,
    'ensure_rls exists and is enabled'
);

select is(
    (
        select pg_event_trigger.evtfoid
        from pg_event_trigger
        where evtname = 'ensure_rls'
    ),
    'public.rls_auto_enable()'::regprocedure::oid,
    'ensure_rls points to public.rls_auto_enable()'
);

select is(
    (
        select evtevent
        from pg_event_trigger
        where evtname = 'ensure_rls'
    ),
    'ddl_command_end',
    'ensure_rls fires at ddl_command_end'
);

select is(
    (
        select evttags
        from pg_event_trigger
        where evtname = 'ensure_rls'
    ),
    array['CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO']::text[],
    'ensure_rls is scoped to table creation command tags'
);

drop table if exists public.stage2_auto_rls_probe;

create table public.stage2_auto_rls_probe (
    id integer primary key
);

select is(
    (
        select relrowsecurity
        from pg_class
        where oid = 'public.stage2_auto_rls_probe'::regclass
    ),
    true,
    'ensure_rls automatically enables RLS on a newly-created public table'
);

drop table public.stage2_auto_rls_probe;

create temporary table stage2_auto_rls_temp_probe (
    id integer primary key
);

select is(
    (
        select relrowsecurity
        from pg_class
        where oid = 'stage2_auto_rls_temp_probe'::regclass
    ),
    false,
    'ensure_rls does not affect temporary probe tables'
);

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
    'postgres default public table privileges still grant no access to Data API roles'
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
    'postgres default public sequence privileges still grant no access to Data API roles'
);

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
    'postgres function default ACLs still do not grant EXECUTE to PUBLIC or Data API roles'
);

select is(
    (
        select count(*)::integer
        from pg_default_acl
        where defaclrole = 'supabase_admin'::regrole
    ),
    (
        select count(*)::integer
        from pg_default_acl
        where defaclrole = 'supabase_admin'::regrole
            and defaclacl is not null
    ),
    'supabase_admin default privileges remain present and managed separately'
);

select * from finish();
