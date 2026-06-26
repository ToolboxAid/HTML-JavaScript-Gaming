import assert from "node:assert/strict";
import test from "node:test";

import {
  createSpritesPostgresService,
  handleSpritesApiContract,
} from "../../src/dev-runtime/sprites/sprites-postgres-service.mjs";
import { SEED_DB_KEYS } from "../../src/dev-runtime/seed/seed-db-keys.mjs";
import { createPostgresClientStub } from "../helpers/postgresClientStub.mjs";

function createHarness() {
  const postgresClient = createPostgresClientStub();
  const service = createSpritesPostgresService({ postgresClient });
  return { postgresClient, service };
}

test("Sprites service creates API-owned Postgres sprite records with audit fields", async () => {
  const { postgresClient, service } = createHarness();

  const sprite = await service.createSprite({
    category: "characters",
    height: 32,
    mimeType: "image/png",
    name: "Hero Idle",
    paletteColorKeys: ["palette-color-hero-blue"],
    sizeBytes: 2048,
    source: "upload",
    status: "draft",
    storagePath: "/local/projects/demo/sprites/hero-idle.png",
    tagKeys: ["tag-hero"],
    width: 32,
  }, SEED_DB_KEYS.users.user1);

  assert.match(sprite.key, /^[0-9A-HJKMNP-TV-Z]{26}$/);
  assert.equal(sprite.name, "Hero Idle");
  assert.equal(sprite.status, "draft");
  assert.equal(sprite.createdBy, SEED_DB_KEYS.users.user1);
  assert.equal(sprite.updatedBy, SEED_DB_KEYS.users.user1);
  assert.deepEqual(sprite.paletteColorKeys, ["palette-color-hero-blue"]);
  assert.equal(Object.prototype.hasOwnProperty.call(sprite, "hex"), false);
  assert.equal(postgresClient.calls.some((call) => call.method === "QUERY" && call.sql.includes("CREATE TABLE IF NOT EXISTS sprite_records")), true);
  service.close();
});

test("Sprites service owns keys and rejects missing status, duplicate names, and color definitions", async () => {
  const { service } = createHarness();

  const keyedInput = await service.createSprite({
    key: "browser-key",
    name: "Server Owned Key",
    status: "draft",
  }, SEED_DB_KEYS.users.user1);
  assert.notEqual(keyedInput.key, "browser-key");

  await service.createSprite({
    name: "Hero Idle",
    status: "ready",
  }, SEED_DB_KEYS.users.user1);

  await assert.rejects(
    () => service.createSprite({
      name: "Hero Idle",
      status: "ready",
    }, SEED_DB_KEYS.users.user1),
    /already exists/,
  );

  await assert.rejects(
    () => service.createSprite({
      colors: ["#ffffff"],
      name: "Color Owning Sprite",
      status: "draft",
    }, SEED_DB_KEYS.users.user1),
    /Palette\/Colors keys only/,
  );

  await assert.rejects(
    () => service.createSprite({
      name: "Guest Write",
      status: "draft",
    }, ""),
    /Sign in is required/,
  );
  service.close();
});

test("Sprites service archives and blocks destructive delete when referenced", async () => {
  const { postgresClient, service } = createHarness();

  const sprite = await service.createSprite({
    name: "Door Glow",
    status: "ready",
  }, SEED_DB_KEYS.users.user1);

  await postgresClient.requestTable("sprite_usage_references", {
    body: {
      createdAt: "2026-06-26T00:00:00.000Z",
      createdBy: SEED_DB_KEYS.users.user1,
      key: "reference-1",
      label: "Demo Object",
      sourceKey: "object-demo",
      sourceType: "object",
      spriteKey: sprite.key,
      updatedAt: "2026-06-26T00:00:00.000Z",
      updatedBy: SEED_DB_KEYS.users.user1,
    },
    method: "POST",
  });

  const archived = await service.archiveSprite(sprite.key, SEED_DB_KEYS.users.user1);
  assert.equal(archived.archived, true);
  assert.equal(archived.status, "archived");
  assert.equal(archived.usageCount, 1);

  await assert.rejects(
    () => service.deleteSprite(sprite.key, SEED_DB_KEYS.users.user1),
    /Archive it instead/,
  );
  service.close();
});

test("Sprites API contract exposes list, read, create, update, archive, and safe delete", async () => {
  const { service } = createHarness();
  const actorKey = SEED_DB_KEYS.users.user1;

  const created = await handleSpritesApiContract({
    actorKey,
    body: { name: "Chest", status: "draft" },
    method: "POST",
    parts: ["records"],
    service,
  });
  assert.equal(created.sprite.name, "Chest");

  const updated = await handleSpritesApiContract({
    actorKey,
    body: { status: "ready" },
    method: "POST",
    parts: ["records", created.sprite.key],
    service,
  });
  assert.equal(updated.sprite.status, "ready");

  const list = await handleSpritesApiContract({
    method: "GET",
    parts: ["records"],
    service,
  });
  assert.equal(list.sprites.length, 1);
  assert.equal(list.persistence.engine, "Postgres");

  const archived = await handleSpritesApiContract({
    actorKey,
    method: "POST",
    parts: ["records", created.sprite.key, "archive"],
    service,
  });
  assert.equal(archived.sprite.archived, true);

  const deleted = await handleSpritesApiContract({
    actorKey,
    method: "POST",
    parts: ["records", created.sprite.key, "delete"],
    service,
  });
  assert.equal(deleted.sprite.key, created.sprite.key);
  assert.deepEqual((await service.listSprites()), []);
  service.close();
});
