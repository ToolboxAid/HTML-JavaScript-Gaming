/*
Toolbox Aid
David Quesenberry
04/05/2026
renderCommandPack.js
*/

import {
  requireNoArgs,
  safeArray,
  safeSection,
  standardDetails,
  toLinePair
} from "./packUtils.js";

export function createRenderCommandPack() {
  return {
    packId: "render",
    label: "Render",
    description: "Render stats, layers, and pipeline state commands.",
    commands: [
      {
        name: "render.stats",
        summary: "Show render timing and stage summary.",
        usage: "render.stats",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler(context) {
          const render = safeSection(context, "render");
          const stages = safeArray(render.stages);
          return {
            title: "Render Stats",
            lines: [
              toLinePair("stageCount", stages.length),
              toLinePair("debugSurfaceTail", safeArray(render.debugSurfaceTail).join(" -> ") || "n/a")
            ],
            details: standardDetails({ render }),
            code: "RENDER_STATS"
          };
        }
      },
      {
        name: "render.layers",
        summary: "List resolved render stage layers.",
        usage: "render.layers",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler(context) {
          const render = safeSection(context, "render");
          const stages = safeArray(render.stages);
          return {
            title: "Render Layers",
            lines: stages.length > 0
              ? stages.map((stage, index) => `${index + 1}. ${stage}`)
              : ["No render stages available."],
            details: standardDetails({ stages }),
            code: "RENDER_LAYERS"
          };
        }
      },
      {
        name: "render.pipeline",
        summary: "Show deterministic render pipeline ordering.",
        usage: "render.pipeline",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler(context) {
          const render = safeSection(context, "render");
          const stages = safeArray(render.stages);
          return {
            title: "Render Pipeline",
            lines: stages.length > 0
              ? [`order: ${stages.join(" -> ")}`]
              : ["Render pipeline unavailable."],
            details: standardDetails({ stages }),
            code: "RENDER_PIPELINE"
          };
        }
      }
    ]
  };
}
