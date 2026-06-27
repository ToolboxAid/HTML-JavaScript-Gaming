/*
Toolbox Aid
David Quesenberry
04/05/2026
toggleCommandPack.js
*/

import {
  requireNoArgs
} from "./packUtils.js";
import { createResult } from "./commandPackResultUtils.js";

function executePresetToggle(context, presetId) {
  if (typeof context?.executeConsoleCommand !== "function") {
    return createResult(
      "failed",
      "Toggle Preset",
      ["Command execution context is unavailable."],
      "MISSING_COMMAND_CONTEXT",
      {
        presetId
      }
    );
  }

  const execution = context.executeConsoleCommand(`preset.apply ${presetId}`, context);
  if (execution?.status !== "ready") {
    return createResult(
      "failed",
      "Toggle Preset",
      [
        `presetId=${presetId}`,
        `status=failed`,
        `code=${execution?.code || "PRESET_APPLY_FAILED"}`
      ],
      "TOGGLE_PRESET_FAILED",
      {
        presetId,
        execution
      }
    );
  }

  return createResult(
    "ready",
    "Toggle Preset",
    [
      `presetId=${presetId}`,
      `status=ready`
    ],
    "TOGGLE_PRESET_READY",
    {
      presetId,
      execution
    }
  );
}

export function createToggleCommandPack() {
  return {
    packId: "toggle",
    label: "Toggle",
    description: "Quick toggle commands for overlay visibility and preset shortcuts.",
    commands: [
      {
        name: "toggle.overlay",
        summary: "Toggle overlay visibility.",
        usage: "toggle.overlay",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler(context) {
          const runtime = context?.consoleRuntime;
          if (!runtime || typeof runtime.getState !== "function") {
            return createResult(
              "failed",
              "Toggle Overlay",
              ["Console runtime is unavailable."],
              "MISSING_COMMAND_CONTEXT"
            );
          }

          const state = runtime.getState();
          if (state.overlayVisible) {
            runtime.hideOverlay();
          } else {
            runtime.showOverlay();
          }

          const next = runtime.getState();
          return createResult(
            "ready",
            "Toggle Overlay",
            [
              `overlayVisible=${Boolean(next.overlayVisible)}`
            ],
            "TOGGLE_OVERLAY_READY",
            {
              overlayVisible: Boolean(next.overlayVisible)
            }
          );
        }
      },
      {
        name: "toggle.minimal",
        summary: "Apply the minimal preset quickly.",
        usage: "toggle.minimal",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler(context) {
          return executePresetToggle(context, "preset.minimal");
        }
      },
      {
        name: "toggle.systems",
        summary: "Apply the systems preset quickly.",
        usage: "toggle.systems",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler(context) {
          return executePresetToggle(context, "preset.systems");
        }
      },
      {
        name: "toggle.rendering",
        summary: "Apply the rendering preset quickly.",
        usage: "toggle.rendering",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler(context) {
          return executePresetToggle(context, "preset.rendering");
        }
      }
    ]
  };
}
