/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2UiRuntime.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_UI_ERRORS,
  resolveEngineV2GameUi,
} from "../../../www/src/engine/runtime/engineV2UiRuntime.js";
import { createEngineV2FeatureCompleteFixture } from "./EngineV2FeatureCompleteFixture.mjs";

export function run() {
  const fixture = createEngineV2FeatureCompleteFixture().ui;
  const result = resolveEngineV2GameUi(fixture);

  assert.equal(result.valid, true);
  assert.deepEqual(result.uiCommands.map((command) => command.widgetType), [
    "healthBar",
    "score",
    "inventory",
    "dialogue",
    "questTracker",
    "timer",
    "status",
    "pauseMenu",
  ]);
  assert.equal(result.uiCommands.find((command) => command.widgetType === "score").value, 12);
  assert.equal(result.uiCommands.find((command) => command.widgetType === "pauseMenu").value, false);

  const missingSourceResult = resolveEngineV2GameUi({
    uiDefinitions: [{ widgetId: "ui.bad", widgetType: "score", label: "Missing", source: { scoreKey: "missing" } }],
    runtimeState: fixture.runtimeState,
  });

  assert.equal(missingSourceResult.valid, false);
  assert.deepEqual(missingSourceResult.errors.map((error) => error.code), [ENGINE_V2_UI_ERRORS.SOURCE_MISSING]);

  const invalidWidgetResult = resolveEngineV2GameUi({
    uiDefinitions: [{ widgetId: "ui.bad", widgetType: "toolboxPanel", label: "Bad", source: { scoreKey: "coins" } }],
    runtimeState: fixture.runtimeState,
  });

  assert.equal(invalidWidgetResult.valid, false);
  assert.deepEqual(invalidWidgetResult.errors.map((error) => error.code), [ENGINE_V2_UI_ERRORS.DEFINITION_INVALID]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
