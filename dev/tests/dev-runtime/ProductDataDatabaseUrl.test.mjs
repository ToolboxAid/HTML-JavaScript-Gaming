import test from "node:test";
import assert from "node:assert/strict";
import { SupabasePostgresProviderAdapter } from "../../../api/auth/provider-contract-stubs.mjs";

test("platform_settings product data uses the configured database connection client", async () => {
  const calls = [];
  const database = new SupabasePostgresProviderAdapter({
    env: {
      GAMEFOUNDRY_DATABASE_URL: "postgresql://product-data:test@127.0.0.1:5432/gamefoundry_dev",
      GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "service-role-must-not-own-product-data",
      GAMEFOUNDRY_SUPABASE_URL: "https://auth-only.example.invalid",
    },
    postgresClient: {
      async requestTable(tableName, options) {
        calls.push({
          body: options.body,
          method: options.method,
          query: options.query,
          tableName,
        });
        if (options.method === "POST") {
          return options.body;
        }
        return [
          {
            key: "01JPRODUCTDATA000000000000",
            settingKey: "platform.banner.message",
            settingValue: "Database URL owns product data.",
          },
        ];
      },
    },
  });

  const written = await database.upsertPlatformSettings([
    {
      key: "01JPRODUCTDATA000000000000",
      settingKey: "platform.banner.message",
      settingValue: "Database URL owns product data.",
    },
  ]);
  const rows = await database.getPlatformSettings();

  assert.equal(written[0].settingValue, "Database URL owns product data.");
  assert.equal(rows[0].settingKey, "platform.banner.message");
  assert.deepEqual(calls.map((call) => ({
    method: call.method,
    query: call.query,
    tableName: call.tableName,
  })), [
    {
      method: "POST",
      query: "on_conflict=key",
      tableName: "platform_settings",
    },
    {
      method: "GET",
      query: "select=*",
      tableName: "platform_settings",
    },
  ]);
});
