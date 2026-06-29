import assert from "node:assert/strict";

import {
  sanitizeText,
  normalizeString,
  escapeHtml
} from "../../../www/src/shared/string/strings.js";
import {
  normalizeId,
  createStableId,
  isValidId
} from "../../../www/src/shared/id/ids.js";
import {
  isFiniteNumber,
  asPositiveNumber,
  toFiniteNumber
} from "../../../www/src/shared/number/numbers.js";

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
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
