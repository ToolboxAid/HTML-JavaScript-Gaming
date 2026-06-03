/*
Toolbox Aid
David Quesenberry
04/05/2026
hotReloadCommandPack.js
*/

import {
  delegateRuntimeCommand,
  requireNoArgs,
  safeSection,
  standardDetails
} from "./packUtils.js";

function toDelegatedOutput(title, delegated, fallbackCode) {
  if (!delegated) {
    return {
      title,
      lines: ["Runtime delegation unavailable."],
      code: "MISSING_COMMAND_CONTEXT"
    };
  }
  return {
    status: delegated.status,
    title,
    lines: delegated.lines.length > 0 ? delegated.lines : [title],
    details: standardDetails({ delegated }),
    code: delegated.code || fallbackCode
  };
}

export function createHotReloadCommandPack() {
  return {
    packId: "hotreload",
    label: "Hot Reload",
    description: "Hot reload controls and status commands.",
    commands: [
      {
        name: "hotreload.enable",
        summary: "Enable hot reload mode.",
        usage: "hotreload.enable",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler(context) {
          return toDelegatedOutput(
            "Hot Reload Enable",
            delegateRuntimeCommand(context, "hotreload.enable"),
            "HOTRELOAD_ENABLE"
          );
        }
      },
      {
        name: "hotreload.disable",
        summary: "Disable hot reload mode.",
        usage: "hotreload.disable",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler(context) {
          return toDelegatedOutput(
            "Hot Reload Disable",
            delegateRuntimeCommand(context, "hotreload.disable"),
            "HOTRELOAD_DISABLE"
          );
        }
      },
      {
        name: "hotreload.status",
        summary: "Show hot reload status snapshot.",
        usage: "hotreload.status",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler(context) {
          const hotReload = safeSection(context, "hotReload");
          const lines = Object.keys(hotReload)
            .sort((left, right) => left.localeCompare(right))
            .map((key) => `${key}: ${String(hotReload[key])}`);
          return {
            title: "Hot Reload Status",
            lines: lines.length > 0 ? lines : ["No hot reload status available."],
            details: standardDetails({ hotReload }),
            code: "HOTRELOAD_STATUS"
          };
        }
      }
    ]
  };
}
