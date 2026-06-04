/*
Toolbox Aid
David Quesenberry
04/05/2026
sceneCommandPack.js
*/

import {
  delegateRuntimeCommand,
  requireNoArgs,
  safeSection,
  standardDetails,
  toLinePair
} from "./packUtils.js";

export function createSceneCommandPack() {
  return {
    packId: "scene",
    label: "Scene",
    description: "Scene lifecycle and scene status commands.",
    commands: [
      {
        name: "scene.info",
        summary: "Show active scene summary.",
        usage: "scene.info",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler(context) {
          const runtime = safeSection(context, "runtime");
          return {
            title: "Scene Info",
            lines: [
              toLinePair("sceneId", runtime.sceneId || "unknown"),
              toLinePair("status", runtime.status || "unknown"),
              toLinePair("fps", runtime.fps ?? "n/a"),
              toLinePair("frameTimeMs", runtime.frameTimeMs ?? "n/a")
            ],
            details: standardDetails({ runtime }),
            code: "SCENE_INFO"
          };
        }
      },
      {
        name: "scene.reload",
        summary: "Request active scene reload.",
        usage: "scene.reload",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler(context) {
          const delegated = delegateRuntimeCommand(context, "scene.reload");
          if (delegated) {
            return {
              status: delegated.status,
              title: "Scene Reload",
              lines: delegated.lines.length > 0 ? delegated.lines : ["scene.reload requested"],
              details: standardDetails({ delegated }),
              code: delegated.code || "SCENE_RELOAD"
            };
          }
          return {
            title: "Scene Reload",
            lines: ["scene.reload requested"],
            code: "SCENE_RELOAD"
          };
        }
      },
      {
        name: "scene.list",
        summary: "List known scene identifiers for current context.",
        usage: "scene.list",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler(context) {
          const runtime = safeSection(context, "runtime");
          const entries = [];
          if (runtime.sceneId) {
            entries.push(runtime.sceneId);
          }
          return {
            title: "Scene List",
            lines: entries.length > 0 ? entries.map((item) => `- ${item}`) : ["No scene identifiers available."],
            details: standardDetails({ runtime }),
            code: "SCENE_LIST"
          };
        }
      }
    ]
  };
}
