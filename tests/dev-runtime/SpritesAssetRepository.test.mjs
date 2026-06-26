import assert from "node:assert/strict";

import { createAssetToolMockRepository } from "../../src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js";
import { MOCK_DB_KEYS } from "../../src/dev-runtime/persistence/mock-db-store.js";

export function run() {
  const repository = createAssetToolMockRepository({
    sessionUserKey: () => MOCK_DB_KEYS.users.user1,
  });

  const emptySnapshot = repository.getSpritesSnapshot();
  assert.equal(emptySnapshot.validation.status, "Ready");
  assert.equal(emptySnapshot.paletteOwnership.includes("Palette/Colors"), true);
  assert.deepEqual(emptySnapshot.sprites, []);

  const created = repository.createSpriteRecord({
    category: "Character",
    name: "Hero Sprite",
    paletteColorKey: "",
    status: "Ready",
    tagKeys: [],
  });
  assert.equal(created.created, true);
  assert.equal(created.asset.name, "Hero Sprite");
  assert.equal(created.asset.category, "Character");
  assert.equal(created.asset.createdBy, MOCK_DB_KEYS.users.user1);
  assert.equal(created.asset.updatedBy, MOCK_DB_KEYS.users.user1);
  assert.equal(created.asset.paletteColorKey, "");
  assert.equal(created.asset.usage, "sprite");
  assert.equal(created.asset.referenceSummary.destructiveDeleteAllowed, false);
  assert.equal(repository.getSpritesSnapshot().sprites.length, 1);

  const duplicate = repository.createSpriteRecord({
    category: "Character",
    name: "Hero Sprite",
    status: "Ready",
    tagKeys: [],
  });
  assert.equal(duplicate.created, false);
  assert.match(duplicate.message, /already exists/);

  const updated = repository.updateSpriteRecord(created.asset.id, {
    category: "Icon",
    name: "Hero Sprite Revised",
    paletteColorKey: "",
    status: "Ready",
    tagKeys: [],
  });
  assert.equal(updated.updated, true);
  assert.equal(updated.asset.name, "Hero Sprite Revised");
  assert.equal(updated.asset.category, "Icon");

  const blockedDelete = repository.deleteSpriteRecord(updated.asset.id);
  assert.equal(blockedDelete.deleted, false);
  assert.equal(blockedDelete.referenceSummary.destructiveDeleteAllowed, false);
  assert.match(blockedDelete.message, /Destructive sprite delete is disabled/);

  const archived = repository.archiveSpriteRecord(updated.asset.id);
  assert.equal(archived.archived, true);
  assert.equal(archived.asset.status, "Archived");

  const guestRepository = createAssetToolMockRepository({ sessionUserKey: () => "" });
  const guestCreate = guestRepository.createSpriteRecord({
    category: "Sprite",
    name: "Guest Sprite",
    status: "Ready",
    tagKeys: [],
  });
  assert.equal(guestCreate.created, false);
  assert.match(guestCreate.message, /Sign in required/);
}
