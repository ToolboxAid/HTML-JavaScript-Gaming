import assert from "node:assert/strict";
import test from "node:test";
import {
  OBJECTS_TOOL_TABLES,
  createObjectsApiService,
  gameWorkspaceGameKeyForApi,
} from "../../../api/toolbox-api/alfa-tool-services.mjs";
import { SEED_DB_KEYS, makeSeedUlid } from "../../../api/seed/seed-db-keys.mjs";

function cloneRows(rows) {
  return rows.map((row) => ({ ...row }));
}

function createGameWorkspaceRepository() {
  let activeGame = {
    id: "demo-game",
    name: "Demo Game",
    purpose: "Game",
    status: "Under Construction",
  };
  return {
    getActiveGame() {
      return activeGame;
    },
    openGame(gameId) {
      activeGame = {
        id: gameId,
        name: gameId === "gravity-demo" ? "Gravity Demo" : "Demo Game",
        purpose: "Game",
        status: "Under Construction",
      };
      return activeGame;
    },
  };
}

class ObjectsServiceTestAdapter {
  constructor() {
    this.calls = [];
    this.recordIndex = 0;
    this.tables = {
      game_workspace_games: [],
      object_definition_records: [],
      users: [],
    };
  }

  createRecordKey() {
    this.recordIndex += 1;
    return makeSeedUlid(9900 + this.recordIndex);
  }

  async requestTable(tableName, options = {}) {
    this.calls.push(["requestTable", tableName, options.method || "GET", options.query || ""]);
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
    const gameId = String(options.query || "").match(/gameId=eq\.([^&]+)/)?.[1] || "";
    if (gameId) {
      const decodedGameId = decodeURIComponent(gameId);
      return cloneRows(this.tables[tableName].filter((row) => row.gameId === decodedGameId));
    }
    return cloneRows(this.tables[tableName]);
  }

  async upsertProductTable(tableName, rows) {
    this.calls.push(["upsertProductTable", tableName, rows.length]);
    this.#upsert(tableName, rows);
    return cloneRows(rows);
  }

  async upsertTable(tableName, rows) {
    this.calls.push(["upsertTable", tableName, rows.length]);
    this.#upsert(tableName, rows);
    return cloneRows(rows);
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

function createService(adapter, gameWorkspaceRepository = createGameWorkspaceRepository()) {
  return createObjectsApiService({
    databaseAdapter: () => adapter,
    gameWorkspaceRepository,
    sessionUserKey: SEED_DB_KEYS.users.user1,
  });
}

test("Objects API service lists and replaces objects through the database adapter", async () => {
  const adapter = new ObjectsServiceTestAdapter();
  const service = createService(adapter);
  const gameKey = gameWorkspaceGameKeyForApi("demo-game");

  const saved = await service.replaceObjects([
    {
      behavior: "Moves with player input.",
      details: {
        active: true,
        audioReference: "audio/hero-hop.wav",
        defaultValues: "speed=8",
        description: "Player-controlled hero used for review.",
        messageReference: "msg-hero-hop",
        spriteReference: "sprite-hero",
        tags: ["hero", "playable"],
        visible: true,
      },
      interaction: "Can collect keys.",
      name: "Persistent Hero",
      render: { assetKey: "sprite-hero", type: "Sprite" },
      role: "Hero",
      state: "Active",
      traits: ["playerControlled", "movable"],
    },
  ]);

  assert.equal(saved.saved, true);
  assert.equal(saved.objects.length, 1);
  assert.equal(adapter.tables.object_definition_records.length, 1);
  assert.equal(adapter.tables.object_definition_records[0].gameId, gameKey);
  assert.equal(adapter.tables.object_definition_records[0].key.length, 26);
  assert.equal(adapter.tables.object_definition_records[0].createdBy, SEED_DB_KEYS.users.user1);
  assert.equal(adapter.tables.object_definition_records[0].updatedBy, SEED_DB_KEYS.users.user1);
  assert.deepEqual(adapter.tables.object_definition_records[0].capabilities, ["playerControlled", "movable"]);
  assert.deepEqual(adapter.tables.object_definition_records[0].interaction.details, {
    active: true,
    audioReference: "audio/hero-hop.wav",
    defaultValues: "speed=8",
    description: "Player-controlled hero used for review.",
    messageReference: "msg-hero-hop",
    spriteReference: "sprite-hero",
    tags: ["hero", "playable"],
    visible: true,
  });
  assert.equal(adapter.tables.game_workspace_games[0].key, gameKey);
  assert.deepEqual(await service.listObjects(), [
    {
      behavior: "Moves with player input.",
      details: {
        active: true,
        audioReference: "audio/hero-hop.wav",
        defaultValues: "speed=8",
        description: "Player-controlled hero used for review.",
        messageReference: "msg-hero-hop",
        spriteReference: "sprite-hero",
        tags: ["hero", "playable"],
        visible: true,
      },
      id: "persistent-hero",
      interaction: "Can collect keys.",
      name: "Persistent Hero",
      render: { assetKey: "sprite-hero", previewPath: "", type: "Sprite" },
      role: "Hero",
      state: "Active",
      traits: ["playerControlled", "movable"],
      type: "Dynamic",
    },
  ]);
  assert.deepEqual(OBJECTS_TOOL_TABLES, ["object_definition_records"]);
  assert.equal(adapter.calls.some(([action, table]) => action === "requestTable" && table === "object_definition_records"), true);
  assert.equal(adapter.calls.some(([action, table]) => action === "upsertProductTable" && table === "object_definition_records"), true);
});

test("Objects API service replaces only the active game object rows", async () => {
  const adapter = new ObjectsServiceTestAdapter();
  const gameWorkspaceRepository = createGameWorkspaceRepository();
  const service = createService(adapter, gameWorkspaceRepository);
  const demoKey = gameWorkspaceGameKeyForApi("demo-game");
  const gravityKey = gameWorkspaceGameKeyForApi("gravity-demo");

  await service.replaceObjects([{ name: "Demo Hero", role: "Hero", state: "Active" }], "demo-game");
  await service.replaceObjects([{ name: "Gravity Hero", role: "Hero", state: "Active" }], "gravity-demo");
  await service.replaceObjects([{ name: "Demo Wall", role: "Wall", state: "Active" }], "demo-game");

  assert.deepEqual(
    adapter.tables.object_definition_records
      .filter((row) => row.gameId === demoKey)
      .map((row) => row.name),
    ["Demo Wall"],
  );
  assert.deepEqual(
    adapter.tables.object_definition_records
      .filter((row) => row.gameId === gravityKey)
      .map((row) => row.name),
    ["Gravity Hero"],
  );
});

test("Objects API service reports controlled setup errors", async () => {
  const service = createObjectsApiService({
    gameWorkspaceRepository: createGameWorkspaceRepository(),
    sessionUserKey: SEED_DB_KEYS.users.user1,
  });

  await assert.rejects(
    () => service.listObjects(),
    (error) => {
      assert.equal(error.name, "ObjectsApiSetupError");
      assert.equal(error.statusCode, 503);
      assert.match(error.message, /Objects API database setup is unavailable/);
      assert.doesNotMatch(error.message, /requires the configured API database adapter/);
      assert.match(error.operatorDiagnostic, /requires the configured API database adapter/);
      return true;
    },
  );
});
