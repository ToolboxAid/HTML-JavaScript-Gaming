/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2EquipmentSystem.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_EQUIPMENT_ERRORS,
  resolveEngineV2Equipment,
} from "../../../www/src/engine/runtime/engineV2EquipmentSystem.js";
import { createEngineV2PossessionRuntimeFixture } from "./EngineV2PossessionRuntimeFixture.mjs";

export function run() {
  const fixture = createEngineV2PossessionRuntimeFixture();
  const result = resolveEngineV2Equipment({
    equipmentDefinitions: fixture.equipmentDefinitions,
    equipmentStates: fixture.equipmentStates,
    itemDefinitions: fixture.itemDefinitions,
    equipmentActions: fixture.equipmentActions,
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.equipmentStates[0].equipped.map((entry) => entry.slotId), ["weapon", "accessory"]);
  assert.deepEqual(result.equipmentEvents.map((event) => event.actionType), ["equip", "equip"]);

  const invalidResult = resolveEngineV2Equipment({
    equipmentDefinitions: fixture.equipmentDefinitions,
    equipmentStates: fixture.equipmentStates,
    itemDefinitions: fixture.itemDefinitions,
    equipmentActions: [{ actionId: "equip.invalid", actionType: "equip", equipmentId: "equipment.hero", slotId: "weapon", itemId: "item.potion" }],
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [ENGINE_V2_EQUIPMENT_ERRORS.ITEM_NOT_ALLOWED]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
