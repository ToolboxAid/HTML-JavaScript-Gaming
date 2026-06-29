/*
Toolbox Aid
David Quesenberry
06/02/2026
RuleDefinitionReader.test.mjs
*/
import assert from "node:assert/strict";
import {
  RULE_DEFINITION_READER_ERRORS,
  RUNTIME_RULE_TYPE_LIST,
  RUNTIME_RULE_TYPES,
  isRuntimeRuleType,
  readManifestRuleDefinitions,
} from "../../../www/src/engine/runtime/ruleDefinitionReader.js";

export function createRuleDefinitionManifest() {
  return {
    rules: {
      "movement.player": { ruleType: RUNTIME_RULE_TYPES.MOVEMENT, targets: ["object.dynamic.player"], parameters: { speed: 240 } },
      "bounce.ball": { ruleType: RUNTIME_RULE_TYPES.BOUNCE, targets: ["object.dynamic.ball"], parameters: { axis: "x" } },
      "gravity.fall": { ruleType: RUNTIME_RULE_TYPES.GRAVITY, targets: ["object.dynamic.player"], parameters: { y: 980 } },
      "health.enemy": { ruleType: RUNTIME_RULE_TYPES.HEALTH, targets: ["object.killable.enemy"], parameters: { maxHealth: 3 } },
      "damage.bullet": { ruleType: RUNTIME_RULE_TYPES.DAMAGE, targets: ["object.projectile.bullet"], parameters: { amount: 1 } },
      "collision.wall": { ruleType: RUNTIME_RULE_TYPES.COLLISION, targets: ["object.static.wall"], parameters: { response: "block" } },
      "spawn.enemy": { ruleType: RUNTIME_RULE_TYPES.SPAWN, targets: ["object.killable.enemy"], parameters: { interval: 1 } },
      "despawn.bullet": { ruleType: RUNTIME_RULE_TYPES.DESPAWN, targets: ["object.projectile.bullet"], parameters: { lifetime: 1.5 } },
      "scoring.coin": { ruleType: RUNTIME_RULE_TYPES.SCORING, targets: ["object.collectible.coin"], parameters: { points: 10 } },
      "cooldown.fire": { ruleType: RUNTIME_RULE_TYPES.COOLDOWN, targets: ["object.dynamic.player"], parameters: { seconds: 0.25 } },
    },
  };
}

export function run() {
  assert.deepEqual(RUNTIME_RULE_TYPE_LIST, [
    "movement",
    "bounce",
    "gravity",
    "health",
    "damage",
    "collision",
    "spawn",
    "despawn",
    "scoring",
    "cooldown",
  ]);
  assert.equal(isRuntimeRuleType("movement"), true);
  assert.equal(isRuntimeRuleType("script"), false);

  const validation = readManifestRuleDefinitions(createRuleDefinitionManifest());
  assert.equal(validation.valid, true);
  assert.equal(validation.errors.length, 0);
  assert.equal(validation.ruleDefinitions.length, 10);
  assert.deepEqual(
    validation.ruleDefinitions.map((definition) => definition.ruleType),
    RUNTIME_RULE_TYPE_LIST
  );
  assert.equal(validation.ruleDefinitions[0].ruleId, "movement.player");
  assert.deepEqual(validation.ruleDefinitions[0].targets, ["object.dynamic.player"]);
  assert.equal(Object.hasOwn(validation.ruleDefinitions[0], "executed"), false);

  assert.equal(readManifestRuleDefinitions({}).valid, true);
  assert.deepEqual(readManifestRuleDefinitions({}).ruleDefinitions, []);
  assertErrorCodes(
    readManifestRuleDefinitions({ rules: [] }),
    [],
    "empty rule array is valid"
  );
  assertErrorCodes(
    readManifestRuleDefinitions({ rules: "bad" }),
    [RULE_DEFINITION_READER_ERRORS.RULES_INVALID],
    "invalid rules root is rejected"
  );
  assertErrorCodes(
    readManifestRuleDefinitions({ rules: [{ ruleType: "movement" }] }),
    [RULE_DEFINITION_READER_ERRORS.RULE_ID_REQUIRED],
    "missing ruleId is rejected"
  );
  assertErrorCodes(
    readManifestRuleDefinitions({ rules: { "rule.bad": { ruleType: "script" } } }),
    [RULE_DEFINITION_READER_ERRORS.RULE_TYPE_INVALID],
    "invalid ruleType is rejected"
  );
  assertErrorCodes(
    readManifestRuleDefinitions({ rules: { "rule.bad": { ruleType: "movement", targets: [""] } } }),
    [RULE_DEFINITION_READER_ERRORS.TARGETS_INVALID],
    "invalid rule targets are rejected"
  );
}

function assertErrorCodes(validation, expectedCodes, name) {
  assert.equal(validation.valid, expectedCodes.length === 0, name);
  assert.deepEqual(validation.errors.map((error) => error.code), expectedCodes, name);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
