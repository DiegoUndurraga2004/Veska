from pathlib import Path
import re
import unittest


MIGRATION_PATH = (
    Path(__file__).resolve().parents[1]
    / "supabase"
    / "migrations"
    / "20260817000100_stage2_core_identity.sql"
)
DATABASE_TEST_PATH = (
    Path(__file__).resolve().parents[1]
    / "supabase"
    / "tests"
    / "database"
    / "stage2_core_identity_test.sql"
)


def sql() -> str:
    return MIGRATION_PATH.read_text(encoding="utf-8").lower()


class Stage2CoreIdentityMigrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.sql = sql()

    def test_migration_exists_and_enables_vector(self) -> None:
        self.assertTrue(MIGRATION_PATH.exists())
        self.assertIn("create extension if not exists vector", self.sql)

    def test_behavioral_pgtap_test_exists(self) -> None:
        self.assertTrue(DATABASE_TEST_PATH.exists())

    def test_only_first_slice_public_tables_are_created(self) -> None:
        created_tables = set(
            re.findall(r"create\s+table\s+public\.([a-z_]+)\s*\(", self.sql)
        )
        self.assertEqual(
            created_tables,
            {
                "plans",
                "tenants",
                "users",
                "platform_admins",
                "tenant_memberships",
            },
        )

    def test_rls_enabled_for_every_first_slice_table(self) -> None:
        for table in (
            "plans",
            "tenants",
            "users",
            "platform_admins",
            "tenant_memberships",
        ):
            self.assertIn(
                f"alter table public.{table} enable row level security",
                self.sql,
            )

    def test_users_use_veska_uuid_and_nullable_auth_user_link(self) -> None:
        users_table = self._table_definition("users")
        self.assertRegex(users_table, r"id\s+uuid\s+primary\s+key")
        self.assertRegex(users_table, r"auth_user_id\s+uuid\s+null\s+references\s+auth\.users\(id\)")
        self.assertIn("users_auth_user_id_key unique (auth_user_id)", users_table)
        self.assertNotIn("tenant_id", users_table)

    def test_email_uniqueness_is_normalized_only(self) -> None:
        self.assertIn(
            "create unique index users_email_normalized_key\n"
            "    on public.users (lower(btrim(email)))",
            self.sql,
        )
        self.assertNotRegex(self.sql, r"unique\s*\(\s*email\s*\)")
        self.assertNotIn("users_email_key", self.sql)

    def test_plan_name_and_tenant_slug_uniqueness_are_normalized_only(self) -> None:
        self.assertIn(
            "create unique index plans_name_normalized_key\n"
            "    on public.plans (lower(btrim(name)))",
            self.sql,
        )
        self.assertIn(
            "create unique index tenants_slug_normalized_key\n"
            "    on public.tenants (lower(btrim(slug)))",
            self.sql,
        )
        self.assertNotRegex(self._table_definition("plans"), r"unique\s*\(\s*name\s*\)")
        self.assertNotRegex(self._table_definition("tenants"), r"unique\s*\(\s*slug\s*\)")
        self.assertNotIn("plans_name_key", self.sql)
        self.assertNotIn("tenants_slug_key", self.sql)

    def test_updated_at_trigger_function_and_triggers_exist(self) -> None:
        self.assertIn("create or replace function public.set_updated_at()", self.sql)
        for trigger in (
            "plans_set_updated_at",
            "tenants_set_updated_at",
            "users_set_updated_at",
            "tenant_memberships_set_updated_at",
        ):
            self.assertIn(f"create trigger {trigger}", self.sql)

    def test_platform_admin_is_explicit_not_membership_role(self) -> None:
        self.assertIn("create table public.platform_admins", self.sql)
        self.assertRegex(
            self._table_definition("platform_admins"),
            r"user_id\s+uuid\s+not\s+null\s+references\s+public\.users\(id\)",
        )
        membership = self._table_definition("tenant_memberships")
        self.assertIn("role in ('company_admin', 'company_user', 'read_only')", membership)
        self.assertNotIn("platform_admin", membership)

    def test_known_status_checks_are_present(self) -> None:
        self.assertIn(
            "status in ('active', 'inactive', 'trial', 'suspended', 'deleted')",
            self._table_definition("tenants"),
        )
        self.assertIn(
            "status in ('active', 'inactive', 'pending')",
            self._table_definition("users"),
        )
        self.assertIn(
            "status in ('active', 'inactive', 'pending')",
            self._table_definition("tenant_memberships"),
        )

    def test_required_non_redundant_indexes_are_present(self) -> None:
        for index_name in (
            "tenants_status_idx",
            "users_status_idx",
            "tenant_memberships_user_id_status_idx",
            "tenant_memberships_tenant_id_role_status_idx",
        ):
            self.assertIn(f"create index {index_name}", self.sql)

    def test_redundant_lookup_indexes_are_not_created(self) -> None:
        redundant = (
            "create index tenants_slug_idx",
            "create index tenants_slug_normalized_idx",
            "create index plans_name_idx",
            "create index plans_name_normalized_idx",
            "create index users_email_idx",
            "create index platform_admins_user_id_idx",
            "create index tenant_memberships_tenant_id_user_id_status_idx",
        )
        for snippet in redundant:
            self.assertNotIn(snippet, self.sql)

    def test_no_rls_policies_are_created_in_this_slice(self) -> None:
        self.assertNotIn("create policy", self.sql)

    def _table_definition(self, table: str) -> str:
        pattern = rf"create\s+table\s+public\.{table}\s*\((.*?)\n\);"
        match = re.search(pattern, self.sql, flags=re.DOTALL)
        self.assertIsNotNone(match, f"Missing public.{table} table definition")
        return match.group(1)


if __name__ == "__main__":
    unittest.main()
