from pathlib import Path
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]
MIGRATION_PATH = (
    ROOT / "supabase" / "migrations" / "20260817000200_stage2_tenant_configuration.sql"
)
HISTORICAL_MIGRATION_PATH = (
    ROOT / "supabase" / "migrations" / "20260817000100_stage2_core_identity.sql"
)
DATABASE_TEST_PATH = (
    ROOT / "supabase" / "tests" / "database" / "stage2_tenant_configuration_test.sql"
)


def sql() -> str:
    return MIGRATION_PATH.read_text(encoding="utf-8").lower()


class Stage2TenantConfigurationMigrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.sql = sql()

    def test_migration_and_behavioral_test_exist(self) -> None:
        self.assertTrue(MIGRATION_PATH.exists())
        self.assertTrue(DATABASE_TEST_PATH.exists())
        self.assertTrue(HISTORICAL_MIGRATION_PATH.exists())

    def test_adds_only_approved_plan_limit_columns(self) -> None:
        approved_columns = (
            "max_users",
            "max_documents",
            "max_storage_gb",
            "max_requests_month",
            "max_file_size_mb",
        )
        for column in approved_columns:
            self.assertRegex(
                self.sql,
                rf"add\s+column\s+{column}\s+integer\s+not\s+null",
            )
            self.assertIn(f"plans_{column}_positive", self.sql)

        for out_of_scope in (
            "max_chats",
            "spreadsheet",
            "bulk_import",
        ):
            self.assertNotIn(out_of_scope, self.sql)

    def test_plan_limit_columns_have_no_numeric_defaults(self) -> None:
        alter_plans = self._alter_plans_definition()
        self.assertNotRegex(alter_plans, r"max_[a-z_]+\s+integer\s+not\s+null\s+default")

    def test_tenant_limits_schema_matches_slice_scope(self) -> None:
        table = self._table_definition("tenant_limits")
        self.assertRegex(table, r"id\s+uuid\s+primary\s+key\s+default\s+gen_random_uuid\(\)")
        self.assertRegex(
            table,
            r"tenant_id\s+uuid\s+not\s+null\s+references\s+public\.tenants\(id\)\s+"
            r"on\s+update\s+cascade\s+on\s+delete\s+cascade",
        )
        self.assertIn("constraint tenant_limits_tenant_id_key unique (tenant_id)", table)
        for column in (
            "max_users",
            "max_documents",
            "max_storage_gb",
            "max_requests_month",
            "max_file_size_mb",
        ):
            self.assertRegex(table, rf"{column}\s+integer\s+null")
            self.assertIn(f"{column} is null or {column} > 0", table)
        self.assertNotIn("effective", table)
        self.assertNotIn("-1", table)

    def test_tenant_ai_settings_schema_matches_slice_scope(self) -> None:
        table = self._table_definition("tenant_ai_settings")
        self.assertRegex(table, r"id\s+uuid\s+primary\s+key\s+default\s+gen_random_uuid\(\)")
        self.assertRegex(
            table,
            r"tenant_id\s+uuid\s+not\s+null\s+references\s+public\.tenants\(id\)\s+"
            r"on\s+update\s+cascade\s+on\s+delete\s+cascade",
        )
        self.assertIn(
            "constraint tenant_ai_settings_tenant_id_key unique (tenant_id)",
            table,
        )
        self.assertRegex(table, r"ai_provider\s+text\s+not\s+null")
        self.assertRegex(table, r"model_name\s+text\s+null")
        self.assertRegex(table, r"enabled\s+boolean\s+not\s+null\s+default\s+true")
        self.assertIn("ai_provider in ('openai', 'runpod')", table)
        for out_of_scope in (
            "endpoint_config",
            "privacy_tier",
            "max_tokens",
            "temperature",
            "api_key",
            "token",
            "credential",
            "secret",
            "embedding",
            "vector",
        ):
            self.assertNotIn(out_of_scope, table)

    def test_updated_at_uses_existing_trigger_function(self) -> None:
        self.assertNotIn("create or replace function public.set_updated_at", self.sql)
        self.assertIn("create trigger tenant_limits_set_updated_at", self.sql)
        self.assertIn("before update on public.tenant_limits", self.sql)
        self.assertIn("create trigger tenant_ai_settings_set_updated_at", self.sql)
        self.assertIn("before update on public.tenant_ai_settings", self.sql)
        self.assertEqual(
            self.sql.count("execute function public.set_updated_at()"),
            2,
        )

    def test_rls_enabled_without_policies(self) -> None:
        self.assertIn(
            "alter table public.tenant_limits enable row level security",
            self.sql,
        )
        self.assertIn(
            "alter table public.tenant_ai_settings enable row level security",
            self.sql,
        )
        self.assertNotIn("create policy", self.sql)

    def test_no_redundant_indexes_or_effective_limit_view(self) -> None:
        self.assertNotRegex(self.sql, r"create\s+index\s+.*tenant_limits.*tenant_id")
        self.assertNotRegex(self.sql, r"create\s+index\s+.*tenant_ai_settings.*tenant_id")
        self.assertNotRegex(self.sql, r"create\s+index\s+.*ai_provider")
        self.assertNotRegex(self.sql, r"create\s+(or\s+replace\s+)?view")
        self.assertNotRegex(self.sql, r"create\s+(or\s+replace\s+)?function\s+.*effective")

    def test_static_guardrail_does_not_modify_historical_migration(self) -> None:
        historical_sql = HISTORICAL_MIGRATION_PATH.read_text(encoding="utf-8").lower()
        self.assertNotIn("tenant_limits", historical_sql)
        self.assertNotIn("tenant_ai_settings", historical_sql)
        self.assertNotIn("max_requests_month", historical_sql)

    def _alter_plans_definition(self) -> str:
        pattern = r"alter\s+table\s+public\.plans\s+(.*?);"
        match = re.search(pattern, self.sql, flags=re.DOTALL)
        self.assertIsNotNone(match, "Missing public.plans alter statement")
        return match.group(1)

    def _table_definition(self, table: str) -> str:
        pattern = rf"create\s+table\s+public\.{table}\s*\((.*?)\n\);"
        match = re.search(pattern, self.sql, flags=re.DOTALL)
        self.assertIsNotNone(match, f"Missing public.{table} table definition")
        return match.group(1)


if __name__ == "__main__":
    unittest.main()
