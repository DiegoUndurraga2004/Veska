begin;

select plan(46);

select has_extension('vector', 'vector extension is installed');

select has_table('public', 'plans', 'plans table exists');
select has_table('public', 'tenants', 'tenants table exists');
select has_table('public', 'users', 'users table exists');
select has_table('public', 'platform_admins', 'platform_admins table exists');
select has_table('public', 'tenant_memberships', 'tenant_memberships table exists');

select hasnt_column('public', 'users', 'tenant_id', 'users has no tenant_id');
select col_is_null('public', 'users', 'auth_user_id', 'users.auth_user_id may be NULL');

select is(
    (
        select count(*)::integer
        from pg_constraint
        join pg_attribute source_column
            on source_column.attrelid = conrelid
            and source_column.attnum = any(conkey)
        join pg_attribute target_column
            on target_column.attrelid = confrelid
            and target_column.attnum = any(confkey)
        where conrelid = 'public.users'::regclass
            and contype = 'f'
            and source_column.attname = 'auth_user_id'
            and confrelid = 'auth.users'::regclass
            and target_column.attname = 'id'
    ),
    1,
    'users.auth_user_id references auth.users(id)'
);

select has_index(
    'public',
    'plans',
    'plans_name_normalized_key',
    'plans has normalized name uniqueness index'
);
select has_index(
    'public',
    'tenants',
    'tenants_slug_normalized_key',
    'tenants has normalized slug uniqueness index'
);
select has_index(
    'public',
    'users',
    'users_email_normalized_key',
    'users has normalized email uniqueness index'
);
select has_index(
    'public',
    'tenant_memberships',
    'tenant_memberships_user_id_status_idx',
    'membership user/status lookup index exists'
);
select has_index(
    'public',
    'tenant_memberships',
    'tenant_memberships_tenant_id_role_status_idx',
    'membership tenant/role/status lookup index exists'
);

select hasnt_index('public', 'plans', 'plans_name_key', 'plans has no raw name unique index');
select hasnt_index('public', 'tenants', 'tenants_slug_key', 'tenants has no raw slug unique index');
select hasnt_index('public', 'users', 'users_email_key', 'users has no raw email unique index');

select has_function('public', 'set_updated_at', array[]::name[], 'updated_at trigger function exists');
select has_trigger('public', 'plans', 'plans_set_updated_at', 'plans updated_at trigger exists');
select has_trigger('public', 'tenants', 'tenants_set_updated_at', 'tenants updated_at trigger exists');
select has_trigger('public', 'users', 'users_set_updated_at', 'users updated_at trigger exists');
select has_trigger(
    'public',
    'tenant_memberships',
    'tenant_memberships_set_updated_at',
    'tenant_memberships updated_at trigger exists'
);

select lives_ok(
    $$ insert into public.plans (
           name,
           max_users,
           max_documents,
           max_storage_gb,
           max_requests_month,
           max_file_size_mb
       )
       values ('Basic', 10, 500, 10, 2000, 25) $$,
    'plan insert succeeds'
);
select throws_ok(
    $$ insert into public.plans (
           name,
           max_users,
           max_documents,
           max_storage_gb,
           max_requests_month,
           max_file_size_mb
       )
       values (' basic ', 10, 500, 10, 2000, 25) $$,
    '23505',
    null,
    'normalized duplicate plan names are rejected'
);

select lives_ok(
    $$ insert into public.tenants (plan_id, name, slug, status)
       select id, 'Demo Company', 'Demo', 'trial' from public.plans where lower(btrim(name)) = 'basic' $$,
    'tenant insert succeeds'
);
select throws_ok(
    $$ insert into public.tenants (plan_id, name, slug, status)
       select id, 'Duplicate Demo', ' demo ', 'trial' from public.plans where lower(btrim(name)) = 'basic' $$,
    '23505',
    null,
    'normalized duplicate tenant slugs are rejected'
);

select lives_ok(
    $$ insert into public.users (email, status) values ('User@example.com', 'pending') $$,
    'pending user can exist without auth_user_id'
);
select throws_ok(
    $$ insert into public.users (email, status) values ('user@example.com', 'pending') $$,
    '23505',
    null,
    'case-equivalent duplicate email is rejected'
);
select throws_ok(
    $$ insert into public.users (email, status) values (' user@example.com ', 'pending') $$,
    '23505',
    null,
    'whitespace-equivalent duplicate email is rejected'
);

select lives_ok(
    $$ insert into public.tenant_memberships (tenant_id, user_id, role, status)
       select tenants.id, users.id, 'company_admin', 'active'
       from public.tenants
       cross join public.users
       where tenants.slug = 'Demo'
           and users.email = 'User@example.com' $$,
    'company_admin membership is accepted'
);
select throws_ok(
    $$ insert into public.tenant_memberships (tenant_id, user_id, role, status)
       select tenants.id, users.id, 'platform_admin', 'active'
       from public.tenants
       cross join public.users
       where tenants.slug = 'Demo'
           and users.email = 'User@example.com' $$,
    '23514',
    null,
    'platform_admin tenant membership role is rejected'
);
select lives_ok(
    $$ insert into public.users (email, status) values ('company-user@example.com', 'pending') $$,
    'second pending user insert succeeds'
);
select lives_ok(
    $$ insert into public.tenant_memberships (tenant_id, user_id, role, status)
       select tenants.id, users.id, 'company_user', 'pending'
       from public.tenants
       cross join public.users
       where tenants.slug = 'Demo'
           and users.email = 'company-user@example.com' $$,
    'company_user membership is accepted'
);
select lives_ok(
    $$ insert into public.users (email, status) values ('read-only@example.com', 'pending') $$,
    'third pending user insert succeeds'
);
select lives_ok(
    $$ insert into public.tenant_memberships (tenant_id, user_id, role, status)
       select tenants.id, users.id, 'read_only', 'pending'
       from public.tenants
       cross join public.users
       where tenants.slug = 'Demo'
           and users.email = 'read-only@example.com' $$,
    'read_only membership is accepted'
);
select throws_ok(
    $$ insert into public.tenant_memberships (tenant_id, user_id, role, status)
       select tenants.id, users.id, 'company_admin', 'active'
       from public.tenants
       cross join public.users
       where tenants.slug = 'Demo'
           and users.email = 'User@example.com' $$,
    '23505',
    null,
    'duplicate tenant memberships are rejected'
);

select lives_ok(
    $$ insert into public.platform_admins (user_id)
       select id from public.users where email = 'User@example.com' $$,
    'platform admin row is accepted'
);
select throws_ok(
    $$ insert into public.platform_admins (user_id)
       select id from public.users where email = 'User@example.com' $$,
    '23505',
    null,
    'duplicate platform admin rows are rejected'
);

select throws_ok(
    $$ insert into public.tenants (plan_id, name, slug, status)
       select id, 'Bad Tenant', 'bad-tenant', 'unknown' from public.plans where lower(btrim(name)) = 'basic' $$,
    '23514',
    null,
    'invalid tenant status is rejected'
);
select throws_ok(
    $$ insert into public.users (email, status) values ('bad-user@example.com', 'unknown') $$,
    '23514',
    null,
    'invalid user status is rejected'
);
select throws_ok(
    $$ insert into public.tenant_memberships (tenant_id, user_id, role, status)
       select tenants.id, users.id, 'company_user', 'unknown'
       from public.tenants
       cross join public.users
       where tenants.slug = 'Demo'
           and users.email = 'User@example.com' $$,
    '23514',
    null,
    'invalid membership status is rejected'
);

select is(
    (
        select count(*)::integer
        from pg_class
        where relnamespace = 'public'::regnamespace
            and relname in ('plans', 'tenants', 'users', 'platform_admins', 'tenant_memberships')
            and relrowsecurity
    ),
    5,
    'RLS is enabled on every first-slice table'
);

set local role anon;

select throws_ok(
    $$ select id from public.plans $$,
    '42501',
    null,
    'anon role cannot read plans with no grants or RLS policies'
);
select throws_ok(
    $$ insert into public.plans (name) values ('Anon Plan') $$,
    '42501',
    null,
    'anon role cannot insert plans with no RLS policies'
);
select throws_ok(
    $$ update public.plans set name = 'Anon Update' $$,
    '42501',
    null,
    'anon role cannot update plans with no RLS policies'
);
select throws_ok(
    $$ delete from public.plans $$,
    '42501',
    null,
    'anon role cannot delete plans with no RLS policies'
);

reset role;

select * from finish();

rollback;
