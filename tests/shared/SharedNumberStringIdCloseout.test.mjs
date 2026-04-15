import assert from "node:assert/strict";

import {
  sanitizeText,
  normalizeString,
  escapeHtml
} from "../../src/shared/string/index.js";
import {
  normalizeId,
  createStableId,
  isValidId
} from "../../src/shared/id/index.js";
import {
  isFiniteNumber,
  asPositiveNumber,
  toFiniteNumber
} from "../../src/shared/number/index.js";
import { trimSafe as legacyTrimSafe } from "../../src/shared/utils/stringUtils.js";
import { normalizeId as legacyNormalizeId } from "../../src/shared/utils/idUtils.js";
import { isFiniteNumber as legacyIsFiniteNumber } from "../../src/shared/utils/numberUtils.js";

export function run() {
  assert.equal(sanitizeText("  hello  "), "hello");
  assert.equal(normalizeString("  world "), "world");
  assert.equal(escapeHtml("<tag>"), "&lt;tag&gt;");

  assert.equal(normalizeId("  HUD Layer "), "hud-layer");
  assert.equal(createStableId(["HUD", "Layer"]), "hud.layer");
  assert.equal(isValidId("asset-1"), true);

  assert.equal(toFiniteNumber("12.5", 0), 12.5);
  assert.equal(isFiniteNumber(3.14), true);
  assert.equal(asPositiveNumber(-2, 5), 5);

  // Compatibility wrappers remain valid while canonical homes move to src/shared/{string,id,number}.
  assert.equal(legacyTrimSafe(" x "), "x");
  assert.equal(legacyNormalizeId("  HUD Layer "), "hud-layer");
  assert.equal(legacyIsFiniteNumber(10), true);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
