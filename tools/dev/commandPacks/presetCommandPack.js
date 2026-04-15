/*
Toolbox Aid
David Quesenberry
04/05/2026
presetCommandPack.js
*/

import { DebugPresetApplier } from "../presets/debugPresetApplier.js";
import { DebugPresetRegistry } from "../presets/debugPresetRegistry.js";
import { registerAdvancedInspectorDebugPresets } from "../../../src/engine/debug/inspectors/index.js";
import { registerPresetCommands } from "../presets/registerPresetCommands.js";
import { registerStandardDebugPresets } from "../presets/registerStandardDebugPresets.js";
import { registerStandard3dDebugPresets } from "../../../src/engine/debug/standard/threeD/index.js";

export function createPresetCommandPack() {
  const presetRegistry = new DebugPresetRegistry();
  registerStandardDebugPresets(presetRegistry, "standard");
  registerStandard3dDebugPresets(presetRegistry, "standard.3d");
  registerAdvancedInspectorDebugPresets(presetRegistry, "advanced.inspectors");

  const presetApplier = new DebugPresetApplier({
    presetRegistry
  });

  return {
    packId: "preset",
    label: "Preset",
    description: "Shared preset commands for debug overlay panel visibility profiles.",
    commands: registerPresetCommands({
      presetRegistry,
      presetApplier
    })
  };
}

