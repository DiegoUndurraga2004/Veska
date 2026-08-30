select plan(87);

delete from public.tenant_ai_settings
where tenant_id in (
    select id
    from public.tenants
    where slug in ('slice-2-tenant-a', 'slice-2-tenant-b')
);

delete from public.tenant_limits
where tenant_id in (
    select id
    from public.tenants
    where slug in ('slice-2-tenant-a', 'slice-2-tenant-b')
);

delete from public.tenants
where slug in ('slice-2-tenant-a', 'slice-2-tenant-b');

delete from public.plans
where name in (
    'Slice 2 Basic',
    'Slice 2 Zero Users',
    'Slice 2 Negative Documents',
    'Slice 2 Null Users'
);

select has_column('public', 'plans', 'max_users', 'plans.max_users exists');
select has_column('public', 'plans', 'max_documents', 'plans.max_documents exists');
select has_column('public', 'plans', 'max_storage_gb', 'plans.max_storage_gb exists');
select has_column('public', 'plans', 'max_requests_month', 'plans.max_requests_month exists');
select has_column('public', 'plans', 'max_file_size_mb', 'plans.max_file_size_mb exists');

select col_type_is('public', 'plans', 'max_users', 'integer', 'plans.max_users is integer');
select col_type_is('public', 'plans', 'max_documents', 'integer', 'plans.max_documents is integer');
select col_type_is('public', 'plans', 'max_storage_gb', 'integer', 'plans.max_storage_gb is integer');
select col_type_is('public', 'plans', 'max_requests_month', 'integer', 'plans.max_requests_month is integer');
select col_type_is('public', 'plans', 'max_file_size_mb', 'integer', 'plans.max_file_size_mb is integer');

select col_not_null('public', 'plans', 'max_users', 'plans.max_users is not null');
select col_not_null('public', 'plans', 'max_documents', 'plans.max_documents is not null');
select col_not_null('public', 'plans', 'max_storage_gb', 'plans.max_storage_gb is not null');
select col_not_null('public', 'plans', 'max_requests_month', 'plans.max_requests_month is not null');
select col_not_null('public', 'plans', 'max_file_size_mb', 'plans.max_file_size_mb is not null');

select has_table('public', 'tenant_limits', 'tenant_limits table exists');
select has_table('public', 'tenant_ai_settings', 'tenant_ai_settings table exists');

select has_column('public', 'tenant_limits', 'id', 'tenant_limits.id exists');
select has_column('public', 'tenant_limits', 'tenant_id', 'tenant_limits.tenant_id exists');
select has_column('public', 'tenant_limits', 'max_users', 'tenant_limits.max_users exists');
select has_column('public', 'tenant_limits', 'max_documents', 'tenant_limits.max_documents exists');
select has_column('public', 'tenant_limits', 'max_storage_gb', 'tenant_limits.max_storage_gb exists');
select has_column('public', 'tenant_limits', 'max_requests_month', 'tenant_limits.max_requests_month exists');
select has_column('public', 'tenant_limits', 'max_file_size_mb', 'tenant_limits.max_file_size_mb exists');
select has_column('public', 'tenant_limits', 'created_at', 'tenant_limits.created_at exists');
select has_column('public', 'tenant_limits', 'updated_at', 'tenant_limits.updated_at exists');

select has_column('public', 'tenant_ai_settings', 'id', 'tenant_ai_settings.id exists');
select has_column('public', 'tenant_ai_settings', 'tenant_id', 'tenant_ai_settings.tenant_id exists');
select has_column('public', 'tenant_ai_settings', 'ai_provider', 'tenant_ai_settings.ai_provider exists');
select has_column('public', 'tenant_ai_settings', 'model_name', 'tenant_ai_settings.model_name exists');
select has_column('public', 'tenant_ai_settings', 'enabled', 'tenant_ai_settings.enabled exists');
select has_column('public', 'tenant_ai_settings', 'created_at', 'tenant_ai_settings.created_at exists');
select has_column('public', 'tenant_ai_settings', 'updated_at', 'tenant_ai_settings.updated_at exists');

select col_is_pk('public', 'tenant_limits', 'id', 'tenant_limits.id is primary key');
select col_is_pk('public', 'tenant_ai_settings', 'id', 'tenant_ai_settings.id is primary key');
select col_not_null('public', 'tenant_limits', 'tenant_id', 'tenant_limits.tenant_id is not null');
select col_not_null('public', 'tenant_ai_settings', 'tenant_id', 'tenant_ai_settings.tenant_id is not null');
select col_not_null('public', 'tenant_ai_settings', 'ai_provider', 'tenant_ai_settings.ai_provider is not null');
select col_is_null('public', 'tenant_ai_settings', 'model_name', 'tenant_ai_settings.model_name may be null');
select col_not_null('public', 'tenant_ai_settings', 'enabled', 'tenant_ai_settings.enabled is not null');
select col_has_default('public', 'tenant_ai_settings', 'enabled', 'tenant_ai_settings.enabled has default');

select is(
    (
        select count(*)::integer
        from pg_constraint
        where conrelid = 'public.tenant_limits'::regclass
            and contype = 'f'
            and confrelid = 'public.tenants'::regclass
            and confupdtype = 'c'
            and confdeltype = 'c'
    ),
    1,
    'tenant_limits.tenant_id has cascade FK to tenants'
);

select is(
    (
        select count(*)::integer
        from pg_constraint
        where conrelid = 'public.tenant_ai_settings'::regclass
            and contype = 'f'
            and confrelid = 'public.tenants'::regclass
            and confupdtype = 'c'
            and confdeltype = 'c'
    ),
    1,
    'tenant_ai_settings.tenant_id has cascade FK to tenants'
);

select is(
    (
        select count(*)::integer
        from pg_constraint
        where conrelid = 'public.tenant_limits'::regclass
            and contype = 'u'
            and conname = 'tenant_limits_tenant_id_key'
    ),
    1,
    'tenant_limits tenant_id is unique'
);
select is(
    (
        select count(*)::integer
        from pg_constraint
        where conrelid = 'public.tenant_ai_settings'::regclass
            and contype = 'u'
            and conname = 'tenant_ai_settings_tenant_id_key'
    ),
    1,
    'tenant_ai_settings tenant_id is unique'
);

select is(
    (
        select count(*)::integer
        from pg_constraint
        where conrelid = 'public.plans'::regclass
            and contype = 'c'
            and conname in (
                'plans_max_users_positive',
                'plans_max_documents_positive',
                'plans_max_storage_gb_positive',
                'plans_max_requests_month_positive',
                'plans_max_file_size_mb_positive'
            )
    ),
    5,
    'plans positive limit check constraints exist'
);

select is(
    (
        select count(*)::integer
        from pg_constraint
        where conrelid = 'public.tenant_limits'::regclass
            and contype = 'c'
            and conname in (
                'tenant_limits_max_users_positive',
                'tenant_limits_max_documents_positive',
                'tenant_limits_max_storage_gb_positive',
                'tenant_limits_max_requests_month_positive',
                'tenant_limits_max_file_size_mb_positive'
            )
    ),
    5,
    'tenant_limits nullable positive check constraints exist'
);

select is(
    (
        select count(*)::integer
        from pg_constraint
        where conrelid = 'public.tenant_ai_settings'::regclass
            and contype = 'c'
            and conname in (
                'tenant_ai_settings_ai_provider_check',
                'tenant_ai_settings_model_name_not_blank'
            )
    ),
    2,
    'tenant_ai_settings check constraints exist'
);

select is(
    (
        select count(*)::integer
        from pg_class
        where relnamespace = 'public'::regnamespace
            and relname in ('tenant_limits', 'tenant_ai_settings')
            and relrowsecurity
    ),
    2,
    'RLS is enabled on both tenant configuration tables'
);

select has_trigger(
    'public',
    'tenant_limits',
    'tenant_limits_set_updated_at',
    'tenant_limits updated_at trigger exists'
);
select has_trigger(
    'public',
    'tenant_ai_settings',
    'tenant_ai_settings_set_updated_at',
    'tenant_ai_settings updated_at trigger exists'
);

select lives_ok(
    $$ insert into public.plans (
        name,
        max_users,
        max_documents,
        max_storage_gb,
        max_requests_month,
        max_file_size_mb
    ) values (
        'Slice 2 Basic',
        10,
        500,
        10,
        2000,
        25
    ) $$,
    'positive plan limits are accepted'
);

select throws_ok(
    $$ insert into public.plans (
        name,
        max_users,
        max_documents,
        max_storage_gb,
        max_requests_month,
        max_file_size_mb
    ) values (
        'Slice 2 Zero Users',
        0,
        500,
        10,
        2000,
        25
    ) $$,
    '23514',
    null,
    'zero plan limit is rejected'
);

select throws_ok(
    $$ insert into public.plans (
        name,
        max_users,
        max_documents,
        max_storage_gb,
        max_requests_month,
        max_file_size_mb
    ) values (
        'Slice 2 Negative Documents',
        10,
        -1,
        10,
        2000,
        25
    ) $$,
    '23514',
    null,
    'negative plan limit is rejected'
);

select throws_ok(
    $$ insert into public.plans (
        name,
        max_documents,
        max_storage_gb,
        max_requests_month,
        max_file_size_mb
    ) values (
        'Slice 2 Null Users',
        500,
        10,
        2000,
        25
    ) $$,
    '23502',
    null,
    'null plan default is rejected'
);

select lives_ok(
    $$ insert into public.tenants (plan_id, name, slug, status)
       select id, 'Slice 2 Tenant A', 'slice-2-tenant-a', 'trial'
       from public.plans
       where name = 'Slice 2 Basic' $$,
    'tenant A insert succeeds'
);

select lives_ok(
    $$ insert into public.tenants (plan_id, name, slug, status)
       select id, 'Slice 2 Tenant B', 'slice-2-tenant-b', 'trial'
       from public.plans
       where name = 'Slice 2 Basic' $$,
    'tenant B insert succeeds'
);

select lives_ok(
    $$ insert into public.tenant_limits (tenant_id, max_users)
       select id, null
       from public.tenants
       where slug = 'slice-2-tenant-a' $$,
    'null tenant limit override is accepted'
);

select lives_ok(
    $$ update public.tenant_limits
       set max_users = 7
       where tenant_id = (
           select id from public.tenants where slug = 'slice-2-tenant-a'
       ) $$,
    'positive tenant limit override is accepted'
);

select throws_ok(
    $$ update public.tenant_limits
       set max_documents = 0
       where tenant_id = (
           select id from public.tenants where slug = 'slice-2-tenant-a'
       ) $$,
    '23514',
    null,
    'zero tenant limit override is rejected'
);

select throws_ok(
    $$ update public.tenant_limits
       set max_storage_gb = -1
       where tenant_id = (
           select id from public.tenants where slug = 'slice-2-tenant-a'
       ) $$,
    '23514',
    null,
    'negative tenant limit override is rejected'
);

select throws_ok(
    $$ insert into public.tenant_limits (tenant_id, max_users)
       select id, 8
       from public.tenants
       where slug = 'slice-2-tenant-a' $$,
    '23505',
    null,
    'duplicate tenant_limits row is rejected'
);

select is(
    (
        select coalesce(tenant_limits.max_users, plans.max_users)
        from public.tenants
        join public.plans on plans.id = tenants.plan_id
        left join public.tenant_limits on tenant_limits.tenant_id = tenants.id
        where tenants.slug = 'slice-2-tenant-a'
    ),
    7,
    'effective limit uses tenant override when non-null'
);

select is(
    (
        select coalesce(tenant_limits.max_documents, plans.max_documents)
        from public.tenants
        join public.plans on plans.id = tenants.plan_id
        left join public.tenant_limits on tenant_limits.tenant_id = tenants.id
        where tenants.slug = 'slice-2-tenant-a'
    ),
    500,
    'effective limit falls back to plan default when override is null'
);

select lives_ok(
    $$ insert into public.tenant_ai_settings (tenant_id, ai_provider, model_name)
       select id, 'openai', null
       from public.tenants
       where slug = 'slice-2-tenant-a' $$,
    'openai AI setting with null model_name is accepted'
);

select lives_ok(
    $$ insert into public.tenant_ai_settings (tenant_id, ai_provider, model_name)
       select id, 'runpod', 'llama-candidate'
       from public.tenants
       where slug = 'slice-2-tenant-b' $$,
    'runpod AI setting is accepted'
);

select throws_ok(
    $$ insert into public.tenant_ai_settings (tenant_id, ai_provider)
       select id, 'anthropic'
       from public.tenants
       where slug = 'slice-2-tenant-b' $$,
    '23514',
    null,
    'unsupported AI provider is rejected'
);

select throws_ok(
    $$ update public.tenant_ai_settings
       set model_name = ' '
       where tenant_id = (
           select id from public.tenants where slug = 'slice-2-tenant-b'
       ) $$,
    '23514',
    null,
    'blank non-null model_name is rejected'
);

select throws_ok(
    $$ insert into public.tenant_ai_settings (tenant_id, ai_provider)
       select id, 'openai'
       from public.tenants
       where slug = 'slice-2-tenant-a' $$,
    '23505',
    null,
    'duplicate tenant_ai_settings row is rejected'
);

create temporary table slice2_timestamp_probe (
    table_name text primary key,
    before_update timestamptz not null
);

insert into slice2_timestamp_probe (table_name, before_update)
select 'tenant_limits', updated_at
from public.tenant_limits
where tenant_id = (
    select id from public.tenants where slug = 'slice-2-tenant-a'
);

select pg_sleep(1.01);

update public.tenant_limits
set max_file_size_mb = 30
where tenant_id = (
    select id from public.tenants where slug = 'slice-2-tenant-a'
);

select cmp_ok(
    (
        select tenant_limits.updated_at
        from public.tenant_limits
        where tenant_id = (
            select id from public.tenants where slug = 'slice-2-tenant-a'
        )
    ),
    '>',
    (
        select before_update
        from slice2_timestamp_probe
        where table_name = 'tenant_limits'
    ),
    'tenant_limits updated_at advances on update'
);

insert into slice2_timestamp_probe (table_name, before_update)
select 'tenant_ai_settings', updated_at
from public.tenant_ai_settings
where tenant_id = (
    select id from public.tenants where slug = 'slice-2-tenant-a'
);

select pg_sleep(1.01);

update public.tenant_ai_settings
set enabled = false
where tenant_id = (
    select id from public.tenants where slug = 'slice-2-tenant-a'
);

select cmp_ok(
    (
        select tenant_ai_settings.updated_at
        from public.tenant_ai_settings
        where tenant_id = (
            select id from public.tenants where slug = 'slice-2-tenant-a'
        )
    ),
    '>',
    (
        select before_update
        from slice2_timestamp_probe
        where table_name = 'tenant_ai_settings'
    ),
    'tenant_ai_settings updated_at advances on update'
);

set role anon;

select throws_ok(
    $$ select id from public.tenant_limits $$,
    '42501',
    null,
    'anon cannot select tenant_limits'
);
select throws_ok(
    $$ insert into public.tenant_limits (tenant_id)
       values ('00000000-0000-0000-0000-000000000000') $$,
    '42501',
    null,
    'anon cannot insert tenant_limits'
);
select throws_ok(
    $$ update public.tenant_limits set max_users = 1 $$,
    '42501',
    null,
    'anon cannot update tenant_limits'
);
select throws_ok(
    $$ delete from public.tenant_limits $$,
    '42501',
    null,
    'anon cannot delete tenant_limits'
);
select throws_ok(
    $$ select id from public.tenant_ai_settings $$,
    '42501',
    null,
    'anon cannot select tenant_ai_settings'
);
select throws_ok(
    $$ insert into public.tenant_ai_settings (tenant_id, ai_provider)
       values ('00000000-0000-0000-0000-000000000000', 'openai') $$,
    '42501',
    null,
    'anon cannot insert tenant_ai_settings'
);
select throws_ok(
    $$ update public.tenant_ai_settings set enabled = false $$,
    '42501',
    null,
    'anon cannot update tenant_ai_settings'
);
select throws_ok(
    $$ delete from public.tenant_ai_settings $$,
    '42501',
    null,
    'anon cannot delete tenant_ai_settings'
);

reset role;

set role authenticated;

select throws_ok(
    $$ select id from public.tenant_limits $$,
    '42501',
    null,
    'authenticated cannot select tenant_limits without policy'
);
select throws_ok(
    $$ insert into public.tenant_limits (tenant_id)
       values ('00000000-0000-0000-0000-000000000000') $$,
    '42501',
    null,
    'authenticated cannot insert tenant_limits without policy'
);
select throws_ok(
    $$ update public.tenant_limits set max_users = 1 $$,
    '42501',
    null,
    'authenticated cannot update tenant_limits without policy'
);
select throws_ok(
    $$ delete from public.tenant_limits $$,
    '42501',
    null,
    'authenticated cannot delete tenant_limits without policy'
);
select throws_ok(
    $$ select id from public.tenant_ai_settings $$,
    '42501',
    null,
    'authenticated cannot select tenant_ai_settings without policy'
);
select throws_ok(
    $$ insert into public.tenant_ai_settings (tenant_id, ai_provider)
       values ('00000000-0000-0000-0000-000000000000', 'openai') $$,
    '42501',
    null,
    'authenticated cannot insert tenant_ai_settings without policy'
);
select throws_ok(
    $$ update public.tenant_ai_settings set enabled = false $$,
    '42501',
    null,
    'authenticated cannot update tenant_ai_settings without policy'
);
select throws_ok(
    $$ delete from public.tenant_ai_settings $$,
    '42501',
    null,
    'authenticated cannot delete tenant_ai_settings without policy'
);

reset role;

delete from public.tenant_ai_settings
where tenant_id in (
    select id
    from public.tenants
    where slug in ('slice-2-tenant-a', 'slice-2-tenant-b')
);

delete from public.tenant_limits
where tenant_id in (
    select id
    from public.tenants
    where slug in ('slice-2-tenant-a', 'slice-2-tenant-b')
);

delete from public.tenants
where slug in ('slice-2-tenant-a', 'slice-2-tenant-b');

delete from public.plans
where name in (
    'Slice 2 Basic',
    'Slice 2 Zero Users',
    'Slice 2 Negative Documents',
    'Slice 2 Null Users'
);

select * from finish();
