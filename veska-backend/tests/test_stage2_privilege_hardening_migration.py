from pathlib import Path
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]
MIGRATION_PATH = (
    ROOT / "supabase" / "migrations" / "20260817000300_stage2_privilege_hardening.sql"
)
DATABASE_TEST_PATH = (
    ROOT / "supabase" / "tests" / "database" / "stage2_privilege_hardening_test.sql"
)
HISTORICAL_MIGRATIONS = (
    ROOT / "supabase" / "migrations" / "20260817000100_stage2_core_identity.sql",
    ROOT / "supabase" / "migrations" / "20260817000200_stage2_tenant_configuration.sql",
)


def sql() -> str:
    return MIGRATION_PATH.read_text(encoding="utf-8").lower()


class Stage2PrivilegeHardeningMigrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.sql = sql()

    def test_migration_and_behavioral_test_exist(self) -> None:
        self.assertTrue(MIGRATION_PATH.exists())
        self.assertTrue(DATABASE_TEST_PATH.exists())
        for path in HISTORICAL_MIGRATIONS:
            self.assertTrue(path.exists())

    def test_hardens_exact_current_application_tables(self) -> None:
        expected_tables = {
            "plans",
            "tenants",
            "users",
            "platform_admins",
            "tenant_memberships",
            "tenant_limits",
            "tenant_ai_settings",
        }
        table_block_match = re.search(
            r"revoke\s+all\s+privileges\s+on\s+table\s+(.*?)\s+from\s+anon,\s+authenticated,\s+service_role",
            self.sql,
            flags=re.DOTALL,
        )
        self.assertIsNotNone(table_block_match)
        tables = set(re.findall(r"public\.([a-z_]+)", table_block_match.group(1)))
        self.assertEqual(tables, expected_tables)

    def test_frontend_roles_are_not_granted_table_privileges_back(self) -> None:
        grant_statements = re.findall(r"grant\s+(.*?)\s+on\s+table", self.sql, flags=re.DOTALL)
        self.assertEqual(len(grant_statements), 1)
        self.assertIn("to service_role", self.sql)
        self.assertNotRegex(self.sql, r"grant\s+.*\s+to\s+anon")
        self.assertNotRegex(self.sql, r"grant\s+.*\s+to\s+authenticated")

    def test_service_role_receives_only_backend_dml_on_existing_tables(self) -> None:
        self.assertRegex(
            self.sql,
            r"grant\s+select,\s+insert,\s+update,\s+delete\s+on\s+table",
        )
        service_grant = re.search(
            r"grant\s+(.*?)\s+on\s+table.*?to\s+service_role",
            self.sql,
            flags=re.DOTALL,
        )
        self.assertIsNotNone(service_grant)
        for forbidden in ("truncate", "references", "trigger", "maintain"):
            self.assertNotIn(forbidden, service_grant.group(1))

    def test_postgres_public_default_table_and_sequence_privileges_are_revoked(self) -> None:
        self.assertIn(
            "alter default privileges for role postgres in schema public\n"
            "    revoke all privileges on tables from anon, authenticated, service_role",
            self.sql,
        )
        self.assertIn(
            "revoke truncate, references, trigger, maintain on tables",
            self.sql,
        )
        self.assertIn(
            "alter default privileges for role postgres in schema public\n"
            "    revoke all privileges on sequences from anon, authenticated, service_role",
            self.sql,
        )
        self.assertIn("revoke usage, select, update on sequences", self.sql)

    def test_function_execute_is_hardened_for_existing_and_future_functions(self) -> None:
        self.assertIn(
            "revoke execute on function public.set_updated_at()\n"
            "from public, anon, authenticated, service_role",
            self.sql,
        )
        self.assertIn(
            "alter default privileges for role postgres\n"
            "    revoke execute on functions from public, anon, authenticated, service_role",
            self.sql,
        )
        self.assertIn(
            "alter default privileges for role postgres in schema public\n"
            "    revoke execute on functions from public, anon, authenticated, service_role",
            self.sql,
        )

    def test_does_not_touch_supabase_admin_or_create_policies(self) -> None:
        self.assertNotIn("supabase_admin", self.sql)
        self.assertNotIn("create policy", self.sql)
        self.assertNotIn("disable row level security", self.sql)


if __name__ == "__main__":
    unittest.main()
