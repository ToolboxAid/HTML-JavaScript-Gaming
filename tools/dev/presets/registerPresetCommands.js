/*
Toolbox Aid
David Quesenberry
04/05/2026
registerPresetCommands.js
*/

import {
  requireAtLeastArgs,
  requireNoArgs
} from "../commandPacks/packUtils.js";

import { sanitizeText } from "/src/engine/debug/inspectors/shared/inspectorUtils.js";

function createCommandResult(status, title, lines, code, details = {}) {
  return {
    status: status === "failed" ? "failed" : "ready",
    title,
    lines: Array.isArray(lines) ? lines : [],
    code,
    details
  };
}

function formatPresetLine(descriptor) {
  const enabledCount = Array.isArray(descriptor?.panels?.enabled) ? descriptor.panels.enabled.length : 0;
  const disabledCount = Array.isArray(descriptor?.panels?.disabled) ? descriptor.panels.disabled.length : 0;
  return `${descriptor.presetId} enabled=${enabledCount} disabled=${disabledCount}`;
}

export function registerPresetCommands(options = {}) {
  const presetRegistry = options.presetRegistry || null;
  const presetApplier = options.presetApplier || null;

  return [
    {
      name: "preset.help",
      summary: "Show preset command usage.",
      usage: "preset.help",
      validate({ args, commandName }) {
        return requireNoArgs({ args, commandName });
      },
      handler() {
        return createCommandResult(
          "ready",
          "Preset Help",
          [
            "preset.help",
            "preset.list",
            "preset.current",
            "preset.apply <presetId>",
            "preset.reset"
          ],
          "PRESET_HELP"
        );
      }
    },
    {
      name: "preset.list",
      summary: "List registered debug presets.",
      usage: "preset.list",
      validate({ args, commandName }) {
        return requireNoArgs({ args, commandName });
      },
      handler() {
        const presets = presetRegistry && typeof presetRegistry.listPresets === "function"
          ? presetRegistry.listPresets()
          : [];

        if (presets.length === 0) {
          return createCommandResult(
            "failed",
            "Preset List",
            ["No presets are registered."],
            "PRESET_LIST_EMPTY"
          );
        }

        return createCommandResult(
          "ready",
          "Preset List",
          [
            `presetCount=${presets.length}`,
            ...presets.map((descriptor) => formatPresetLine(descriptor))
          ],
          "PRESET_LIST_READY",
          {
            presetCount: presets.length,
            presetIds: presets.map((descriptor) => descriptor.presetId)
          }
        );
      }
    },
    {
      name: "preset.current",
      summary: "Show the currently applied preset id.",
      usage: "preset.current",
      validate({ args, commandName }) {
        return requireNoArgs({ args, commandName });
      },
      handler() {
        const currentPresetId = presetApplier && typeof presetApplier.getCurrentPresetId === "function"
          ? sanitizeText(presetApplier.getCurrentPresetId())
          : "";

        return createCommandResult(
          "ready",
          "Preset Current",
          [
            `presetId=${currentPresetId || "none"}`
          ],
          "PRESET_CURRENT_READY",
          {
            presetId: currentPresetId
          }
        );
      }
    },
    {
      name: "preset.apply",
      summary: "Apply a named preset to overlay panel states.",
      usage: "preset.apply <presetId>",
      validate({ args, commandName }) {
        return requireAtLeastArgs(1, { args, commandName });
      },
      handler(context, args) {
        const presetId = sanitizeText(args?.[0]);
        if (!presetApplier || typeof presetApplier.applyPreset !== "function") {
          return createCommandResult(
            "failed",
            "Preset Apply",
            ["Preset applier is unavailable."],
            "MISSING_PRESET_APPLIER",
            {
              presetId
            }
          );
        }
        return presetApplier.applyPreset(presetId, context);
      }
    },
    {
      name: "preset.reset",
      summary: "Reset overlay panel states to baseline defaults.",
      usage: "preset.reset",
      validate({ args, commandName }) {
        return requireNoArgs({ args, commandName });
      },
      handler(context) {
        if (!presetApplier || typeof presetApplier.resetPreset !== "function") {
          return createCommandResult(
            "failed",
            "Preset Reset",
            ["Preset applier is unavailable."],
            "MISSING_PRESET_APPLIER"
          );
        }
        return presetApplier.resetPreset(context);
      }
    }
  ];
}
