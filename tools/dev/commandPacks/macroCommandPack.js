/*
Toolbox Aid
David Quesenberry
04/05/2026
macroCommandPack.js
*/

import { DebugMacroExecutor } from "../advanced/debugMacroExecutor.js";
import { DebugMacroRegistry } from "../advanced/debugMacroRegistry.js";
import { registerStandardDebugMacros } from "../advanced/registerStandardDebugMacros.js";
import {
  requireAtLeastArgs,
  requireNoArgs
} from "./packUtils.js";
import { createResult } from "./commandPackResultUtils.js";

import { sanitizeText } from "../../../src/engine/debug/inspectors/shared/inspectorUtils.js";

const macroRegistry = new DebugMacroRegistry();
registerStandardDebugMacros(macroRegistry, "standard");

const macroExecutor = new DebugMacroExecutor({
  macroRegistry
});

export function createMacroCommandPack() {
  return {
    packId: "macro",
    label: "Macro",
    description: "Operator macro commands composed from approved public commands.",
    commands: [
      {
        name: "macro.list",
        summary: "List registered macros.",
        usage: "macro.list",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler() {
          const macros = macroRegistry.listMacros();
          if (macros.length === 0) {
            return createResult(
              "failed",
              "Macro List",
              ["No macros are registered."],
              "MACRO_LIST_EMPTY"
            );
          }

          return createResult(
            "ready",
            "Macro List",
            [
              `macroCount=${macros.length}`,
              ...macros.map((macro) => `${macro.macroId} stepCount=${macro.steps.length}`)
            ],
            "MACRO_LIST_READY",
            {
              macroCount: macros.length,
              macroIds: macros.map((macro) => macro.macroId)
            }
          );
        }
      },
      {
        name: "macro.show",
        summary: "Show details for a registered macro.",
        usage: "macro.show <macroId>",
        validate({ args, commandName }) {
          return requireAtLeastArgs(1, { args, commandName });
        },
        handler(_context, args) {
          const macroId = sanitizeText(args?.[0]);
          const macro = macroRegistry.getMacro(macroId);
          if (!macro) {
            return createResult(
              "failed",
              "Macro Show",
              [`Macro ${macroId || "n/a"} was not found.`],
              "MACRO_NOT_FOUND",
              {
                macroId
              }
            );
          }

          const stepLines = macro.steps.map((step, index) => `${index + 1}. ${step}`);
          return createResult(
            "ready",
            "Macro Show",
            [
              `macroId=${macro.macroId}`,
              `title=${macro.title}`,
              `stepCount=${macro.steps.length}`,
              ...stepLines
            ],
            "MACRO_SHOW_READY",
            {
              macroId: macro.macroId,
              steps: macro.steps.slice()
            }
          );
        }
      },
      {
        name: "macro.run",
        summary: "Run a macro through approved public command execution.",
        usage: "macro.run <macroId>",
        validate({ args, commandName }) {
          return requireAtLeastArgs(1, { args, commandName });
        },
        handler(context, args) {
          const macroId = sanitizeText(args?.[0]);
          const execution = macroExecutor.executeMacro(macroId, {
            executeConsoleCommand: context?.executeConsoleCommand,
            listRegisteredCommands: context?.listRegisteredCommands,
            baseContext: context
          });
          return execution;
        }
      }
    ]
  };
}

