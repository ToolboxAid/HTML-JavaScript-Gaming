import assert from "node:assert/strict";
import { buildGameTemplates, summarizeGameTemplates } from "../../../www/src/shared/toolbox/gameTemplates.js";

export async function run() {
  const result = buildGameTemplates({
    gameplayResult: {
      gameplay: {
        status: "ready",
        bindings: [
          { role: "entity-visual" },
          { role: "world-layout" },
          { role: "supporting-content" }
        ]
      }
    }
  });
  assert.equal(result.templates.status, "ready");
  assert.equal(result.templates.templates.length, 3);
  assert.equal(summarizeGameTemplates(result), "Game templates ready with 3 templates.");
}
