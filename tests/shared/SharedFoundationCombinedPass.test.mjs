/*
Toolbox Aid
David Quesenberry
04/14/2026
SharedFoundationCombinedPass.test.mjs
*/
import assert from "node:assert/strict";
import {
  ensureArray,
  asArray,
  asStringArray,
  sanitizeText,
  escapeHtml,
  normalizeId,
  createId,
  createStableId,
  isValidId,
} from "../../src/shared/utils/index.js";
import { escapeHtml as legacyEscapeHtml } from "../../src/shared/string/stringUtil.js";
import {
  asPositiveInteger,
  roundNumber,
  vectorFromAngle,
  safeNormalize,
} from "../../src/shared/math/index.js";
import { normalizeRecord, normalizeArray, normalizeRecordArray } from "../../src/shared/data/index.js";
import { safeJsonParse, safeJsonStringify, cloneJsonData } from "../../src/shared/io/index.js";
import { isRecord, isFunction, isNonEmptyString, isBoolean } from "../../src/shared/types/index.js";
import {
  SHARED_PROMOTION_CONTRACT_ID,
  SHARED_PROMOTION_CONTRACT_VERSION,
  SHARED_PROMOTION_MODES,
  isSharedPromotionMode,
  normalizePromotionStateInput,
  createNormalizedPromotionSnapshot,
  isStateContainer,
  isPromotionStateSnapshot,
  getSimulationState,
  getReplayState,
  getEditorState,
} from "../../src/shared/state/index.js";

export function run() {
  assert.deepEqual(ensureArray(null), []);
  assert.deepEqual(asArray("x"), []);
  assert.deepEqual(asStringArray([" A ", "a", "B", ""]), ["A", "a", "B"]);

  assert.equal(sanitizeText("  hi "), "hi");
  assert.equal(escapeHtml("<a>&\"'</a>"), "&lt;a&gt;&amp;&quot;&#39;&lt;/a&gt;");
  assert.equal(legacyEscapeHtml("<b>"), "&lt;b&gt;");

  assert.equal(normalizeId("  Score Board  "), "score-board");
  assert.equal(createStableId(["Game", "HUD Layer"]), "game.hud-layer");
  assert.equal(createId("Asset", () => 0.123456789), "asset-4fzzzxjy");
  assert.equal(isValidId("id-1"), true);
  assert.equal(isValidId(""), false);

  assert.equal(asPositiveInteger("3.4", 1), 3);
  assert.equal(roundNumber(1 / 3), 0.333333);
  assert.deepEqual(vectorFromAngle(0, 2), { x: 2, y: 0 });
  assert.deepEqual(safeNormalize(0, 0), { x: 0, y: 0, length: 0 });

  assert.deepEqual(normalizeRecord(null, { ok: true }), { ok: true });
  assert.deepEqual(normalizeArray("bad"), []);
  assert.deepEqual(normalizeRecordArray([{ id: 1 }, null]), [{ id: 1 }, {}]);

  assert.deepEqual(safeJsonParse('{"ok":true}', {}), { ok: true });
  assert.equal(safeJsonParse("{", null), null);
  assert.equal(safeJsonStringify({ ok: true }), '{"ok":true}');
  assert.deepEqual(cloneJsonData({ nested: { value: 1 } }), { nested: { value: 1 } });

  assert.equal(isRecord({}), true);
  assert.equal(isRecord([]), false);
  assert.equal(isFunction(() => {}), true);
  assert.equal(isNonEmptyString("x"), true);
  assert.equal(isBoolean(false), true);

  assert.equal(SHARED_PROMOTION_CONTRACT_ID, "toolbox.shared.state.promotion");
  assert.equal(SHARED_PROMOTION_CONTRACT_VERSION, "1.0.0");
  assert.equal(isSharedPromotionMode(SHARED_PROMOTION_MODES.PASSIVE), true);

  const normalized = normalizePromotionStateInput({
    promoted: true,
    stableFrames: 8,
    stabilityWindowFrames: 12,
    lastReason: "stable",
    lastEvaluation: { mode: "authoritative" },
  });
  assert.equal(normalized.promoted, true);
  assert.equal(normalized.mode, "authoritative");

  const snapshot = createNormalizedPromotionSnapshot({
    promoted: true,
    stableFrames: 10,
    stabilityWindowFrames: 20,
    lastReason: "ready",
    lastEvaluation: {},
  });
  assert.equal(isPromotionStateSnapshot(snapshot), true);

  const source = {
    getState() {
      return {
        simulationState: { tick: 2 },
        replay: { frames: 10 },
        editorState: { panel: "inspector" },
      };
    },
  };
  assert.equal(isStateContainer(source), true);
  assert.deepEqual(getSimulationState(source), { tick: 2 });
  assert.deepEqual(getReplayState(source), { frames: 10 });
  assert.deepEqual(getEditorState(source), { panel: "inspector" });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
