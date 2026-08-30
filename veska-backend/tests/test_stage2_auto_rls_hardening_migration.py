from pathlib import Path
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]
MIGRATION_PATH = (
    ROOT / "supabase" / "migrations" / "20260817000400_stage2_auto_rls_hardening.sql"
)
DATABASE_TEST_PATH = (
    ROOT / "supabase" / "tests" / "database" / "stage2_auto_rls_hardening_test.sql"
)
HISTORICAL_MIGRATIONS = (
    ROOT / "supabase" / "migrations" / "20260817000100_stage2_core_identity.sql",
    ROOT / "supabase" / "migrations" / "20260817000200_stage2_tenant_configuration.sql",
    ROOT / "supabase" / "migrations" / "20260817000300_stage2_privilege_hardening.sql",
)


def sql() -> str:
    return MIGRATION_PATH.read_text(encoding="utf-8").lower()


class Stage2AutoRlsHardeningMigrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.sql = sql()

    def test_migration_and_behavioral_test_exist(self) -> None:
        self.assertTrue(MIGRATION_PATH.exists())
        self.assertTrue(DATABASE_TEST_PATH.exists())
        for path in HISTORICAL_MIGRATIONS:
            self.assertTrue(path.exists())

    def test_defines_security_definer_event_trigger_function(self) -> None:
        self.assertRegex(
            self.sql,
            r"create\s+or\s+replace\s+function\s+public\.rls_auto_enable\(\)",
        )
        self.assertRegex(self.sql, r"returns\s+event_trigger")
        self.assertRegex(self.sql, r"language\s+plpgsql")
        self.assertRegex(self.sql, r"security\s+definer")
        self.assertRegex(self.sql, r"set\s+search_path\s*=\s*pg_catalog")

    def test_function_uses_event_trigger_metadata_only(self) -> None:
        self.assertIn("pg_event_trigger_ddl_commands()", self.sql)
        self.assertIn("cmd.object_identity", self.sql)
        self.assertNotRegex(self.sql, r"create\s+or\s+replace\s+function[^(]*\([^)]*[a-z_]+\s+text")
        self.assertNotRegex(self.sql, r"create\s+or\s+replace\s+function[^(]*\([^)]*[a-z_]+\s+name")

    def test_function_scope_is_limited_to_new_public_tables(self) -> None:
        self.assertIn("command_tag in ('create table', 'create table as', 'select into')", self.sql)
        self.assertIn("object_type in ('table', 'partitioned table')", self.sql)
        self.assertIn("cmd.schema_name = 'public'", self.sql)
        self.assertIn("enable row level security", self.sql)
        self.assertNotIn("disable row level security", self.sql)
        self.assertNotIn("create policy", self.sql)

    def test_event_trigger_is_reproducibly_managed(self) -> None:
        self.assertIn("drop event trigger if exists ensure_rls", self.sql)
        self.assertRegex(
            self.sql,
            r"create\s+event\s+trigger\s+ensure_rls\s+on\s+ddl_command_end",
        )
        self.assertIn("when tag in ('create table', 'create table as', 'select into')", self.sql)
        self.assertIn("execute function public.rls_auto_enable()", self.sql)

    def test_function_execute_is_revoked_from_data_api_roles(self) -> None:
        self.assertIn(
            "revoke execute on function public.rls_auto_enable()\n"
            "from public, anon, authenticated, service_role",
            self.sql,
        )
        self.assertNotRegex(self.sql, r"grant\s+execute\s+on\s+function\s+public\.rls_auto_enable")

    def test_does_not_touch_historical_or_supabase_admin_defaults(self) -> None:
        self.assertNotIn("supabase_admin", self.sql)
        for path in HISTORICAL_MIGRATIONS:
            self.assertTrue(path.exists())


if __name__ == "__main__":
    unittest.main()
