import assert from "node:assert/strict";
import { buildCollaborationSystem, summarizeCollaborationSystem } from "../../tools/shared/collaborationSystem.js";

export async function run() {
  const result = buildCollaborationSystem({
    currentSchemaVersion: 1,
    baseSnapshot: {
      version: 1,
      assetRefs: { spriteId: "sprite.hero", paletteId: "palette.hero" }
    },
    incomingSnapshot: {
      version: 1,
      assetRefs: { spriteId: "sprite.hero", paletteId: "palette.alt" }
    }
  });
  assert.equal(result.collaboration.status, "conflict");
  assert.equal(result.collaboration.conflicts.length, 1);
  assert.equal(summarizeCollaborationSystem(result), "Collaboration system conflict with 1 conflicts.");
}
