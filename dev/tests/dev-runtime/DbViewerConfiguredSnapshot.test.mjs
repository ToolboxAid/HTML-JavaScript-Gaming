import test from "node:test";
import assert from "node:assert/strict";
import { SupabasePostgresProviderAdapter } from "../../../api/auth/provider-contract-stubs.mjs";

test("DB Viewer configured snapshot keeps schema-known tables visible when one configured table is missing", async () => {
  const calls = [];
  const database = new SupabasePostgresProviderAdapter({
    env: {
      GAMEFOUNDRY_DATABASE_URL: "postgres://user:pass@127.0.0.1:5432/gamefoundry",
      GAMEFOUNDRY_DATABASE_SSL: "disable",
    },
    postgresClient: {
      async requestTable(tableName) {
        calls.push(tableName);
        if (tableName === "membership_limits") {
          throw new Error('relation "membership_limits" does not exist');
        }
        return [{ key: `${tableName}-row` }];
      },
    },
  });

  const snapshot = await database.getDbViewerSnapshot();
  assert.deepEqual(snapshot.tables.membership_limits, []);
  assert.equal(snapshot.tables.users[0].key, "users-row");
  assert.equal(snapshot.tableDiagnostics.length, 1);
  assert.equal(snapshot.tableDiagnostics[0].tableName, "membership_limits");
  assert.match(snapshot.tableDiagnostics[0].message, /membership_limits could not be read/);
  assert.equal(snapshot.diagnostics.tableReadFailures, snapshot.tableDiagnostics);
  assert.equal(calls.includes("asset_library_items"), true);
});
