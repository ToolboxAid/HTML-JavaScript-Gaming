import assert from "node:assert/strict";
import test from "node:test";
import {
  createTagsApiService,
  gameWorkspaceGameKeyForApi,
} from "../../../api/toolbox-api/alfa-tool-services.mjs";
import { SEED_DB_KEYS, makeSeedUlid } from "../../../api/seed/seed-db-keys.mjs";

function cloneRows(rows) {
  return rows.map((row) => ({ ...row }));
}

function createGameWorkspaceRepository() {
  return {
    getActiveGame() {
      return {
        id: "demo-game",
        name: "Demo Game",
        purpose: "Game",
        status: "Under Construction",
      };
    },
  };
}

class TagsServiceTestAdapter {
  constructor(options = {}) {
    this.calls = [];
    this.failTable = options.failTable || "";
    this.failAction = options.failAction || "requestTable";
    this.recordIndex = 0;
    this.tables = {
      game_workspace_games: [],
      project_tag_assignments: [],
      project_tags: [],
      users: [],
    };
  }

  createRecordKey() {
    this.recordIndex += 1;
    return makeSeedUlid(9800 + this.recordIndex);
  }

  async requestTable(tableName, options = {}) {
    this.calls.push(["requestTable", tableName, options.method || "GET"]);
    if (this.failAction === "requestTable" && tableName === this.failTable) {
      throw new Error(`relation "${tableName}" does not exist`);
    }
    if (!Object.hasOwn(this.tables, tableName)) {
      throw new Error(`relation "${tableName}" does not exist`);
    }
    if (options.method === "DELETE") {
      const key = String(options.query || "").match(/key=eq\.([^&]+)/)?.[1] || "";
      const decodedKey = decodeURIComponent(key);
      const deletedRows = this.tables[tableName].filter((row) => row.key === decodedKey);
      this.tables[tableName] = this.tables[tableName].filter((row) => row.key !== decodedKey);
      return cloneRows(deletedRows);
    }
    return cloneRows(this.tables[tableName]);
  }

  async upsertProductTable(tableName, rows) {
    this.calls.push(["upsertProductTable", tableName, rows.length]);
    if (this.failAction === "upsertProductTable" && tableName === this.failTable) {
      throw new Error(`permission denied for table "${tableName}"`);
    }
    this.#upsert(tableName, rows);
  }

  async upsertTable(tableName, rows) {
    this.calls.push(["upsertTable", tableName, rows.length]);
    this.#upsert(tableName, rows);
  }

  #upsert(tableName, rows) {
    if (!Object.hasOwn(this.tables, tableName)) {
      throw new Error(`relation "${tableName}" does not exist`);
    }
    rows.forEach((row) => {
      const index = this.tables[tableName].findIndex((candidate) => candidate.key === row.key);
      if (index >= 0) {
        this.tables[tableName][index] = { ...this.tables[tableName][index], ...row };
      } else {
        this.tables[tableName].push({ ...row });
      }
    });
  }
}

function createService(adapter) {
  return createTagsApiService({
    databaseAdapter: () => adapter,
    gameWorkspaceRepository: createGameWorkspaceRepository(),
    sessionUserKey: SEED_DB_KEYS.users.user1,
  });
}

test("Tags list reads and seeds through the API database adapter", async () => {
  const adapter = new TagsServiceTestAdapter();
  const service = createService(adapter);

  const tags = await service.listTags();

  assert.deepEqual(
    tags.map((tag) => tag.label).sort(),
    ["boss-fight", "fantasy", "kids", "medium", "pixel-art", "platformer"]
  );
  assert.equal(adapter.tables.project_tags.length, 6);
  assert.equal(adapter.tables.game_workspace_games[0].key, gameWorkspaceGameKeyForApi("demo-game"));
  assert.equal(adapter.tables.game_workspace_games[0].ownerKey, SEED_DB_KEYS.users.user1);
  assert.equal(adapter.tables.project_tag_assignments.length, 2);
  assert.equal(adapter.tables.project_tag_assignments.every((row) => row.projectKey === gameWorkspaceGameKeyForApi("demo-game")), true);
  assert.equal(adapter.tables.project_tags.every((row) => row.createdAt && row.updatedAt && row.createdBy && row.updatedBy), true);
  assert.equal(adapter.calls.some(([action, table]) => action === "requestTable" && table === "project_tags"), true);
  assert.equal(adapter.calls.some(([action, table]) => action === "upsertProductTable" && table === "project_tags"), true);
  assert.equal(adapter.calls.some(([action, table]) => action === "upsertProductTable" && table === "project_tag_assignments"), true);
  assert.equal(adapter.calls.some(([action, table]) => action === "upsertTable" && table === "users"), false);
});

test("Tags list reports an actionable setup error when readTables cannot read the schema", async () => {
  const adapter = new TagsServiceTestAdapter({ failTable: "project_tags" });
  const service = createService(adapter);

  await assert.rejects(
    () => service.listTags(),
    (error) => {
      assert.equal(error.name, "TagsApiSetupError");
      assert.equal(error.statusCode, 503);
      assert.match(error.message, /Tags API database setup is unavailable/);
      assert.match(error.message, /apply the account, Game Hub, and Tags database setup/);
      assert.doesNotMatch(error.message, /relation "project_tags"/);
      assert.match(error.operatorDiagnostic, /relation "project_tags" does not exist/);
      return true;
    }
  );
});

test("Tags list reports an actionable setup error when the API database adapter is missing", async () => {
  const service = createTagsApiService({
    gameWorkspaceRepository: createGameWorkspaceRepository(),
    sessionUserKey: SEED_DB_KEYS.users.user1,
  });

  await assert.rejects(
    () => service.listTags(),
    (error) => {
      assert.equal(error.name, "TagsApiSetupError");
      assert.equal(error.statusCode, 503);
      assert.match(error.message, /Tags API database setup is unavailable/);
      assert.doesNotMatch(error.message, /requires the configured API database adapter/);
      assert.match(error.operatorDiagnostic, /requires the configured API database adapter/);
      return true;
    }
  );
});
