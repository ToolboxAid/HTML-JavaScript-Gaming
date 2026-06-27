/*
Toolbox Aid
David Quesenberry
04/05/2026
debugCommandPack.js
*/

import {
  requireNoArgs,
  safeSection,
  standardDetails,
  toLinePair
} from "./packUtils.js";

export function createDebugCommandPack() {
  return {
    packId: "debug",
    label: "Debug",
    description: "Debug surface controls and state commands.",
    commands: [
      {
        name: "debug.toggle",
        summary: "Toggle debug overlay visibility.",
        usage: "debug.toggle",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler(context) {
          const runtime = context?.consoleRuntime;
          if (!runtime || typeof runtime.getState !== "function") {
            return {
              status: "failed",
              title: "Debug Toggle",
              lines: ["Console runtime is unavailable."],
              code: "MISSING_COMMAND_CONTEXT"
            };
          }

          const state = runtime.getState();
          if (state.overlayVisible) {
            runtime.hideOverlay();
          } else {
            runtime.showOverlay();
          }
          const next = runtime.getState();
          return {
            title: "Debug Toggle",
            lines: [toLinePair("overlayVisible", Boolean(next.overlayVisible))],
            details: standardDetails({ state: next }),
            code: "DEBUG_TOGGLE"
          };
        }
      },
      {
        name: "debug.reset",
        summary: "Reset interactive console UI buffers.",
        usage: "debug.reset",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler(context) {
          if (typeof context?.resetConsoleUiState === "function") {
            context.resetConsoleUiState();
          }
          return {
            title: "Debug Reset",
            lines: ["Console UI buffers reset."],
            code: "DEBUG_RESET"
          };
        }
      },
      {
        name: "debug.state",
        summary: "Show debug runtime surface state.",
        usage: "debug.state",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler(context) {
          const runtime = context?.consoleRuntime;
          const state = runtime && typeof runtime.getState === "function"
            ? runtime.getState()
            : {};
          const overlay = safeSection(context, "render");
          return {
            title: "Debug State",
            lines: [
              toLinePair("consoleVisible", Boolean(state.consoleVisible)),
              toLinePair("overlayVisible", Boolean(state.overlayVisible)),
              toLinePair("reloadGeneration", state.reloadGeneration ?? 0),
              toLinePair("renderStages", Array.isArray(overlay.stages) ? overlay.stages.length : 0)
            ],
            details: standardDetails({ state }),
            code: "DEBUG_STATE"
          };
        }
      }
    ]
  };
}
