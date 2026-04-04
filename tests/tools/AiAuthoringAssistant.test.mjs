import assert from "node:assert/strict";
import { buildAiAuthoringAssistant, summarizeAiAuthoringAssistant } from "../../tools/shared/aiAuthoringAssistant.js";

export async function run() {
  const result = buildAiAuthoringAssistant({
    validationResult: {
      assetDependencyGraph: { nodes: { "sprite.hero": {}, "palette.hero": {} }, edges: [] },
      validation: {
        status: "invalid",
        findings: [
          { code: "UNRESOLVED_PALETTE_LINK", blocking: true, sourceId: "sprite.hero", sourceType: "sprite", message: "Palette missing." }
        ]
      }
    },
    remediationResult: {
      remediation: {
        status: "available",
        actions: [
          { actionType: "navigate", label: "Jump to palette problem", message: "Review the palette link.", sourceId: "sprite.hero" },
          { actionType: "confirmable-fix", actionId: "relink-single-candidate", label: "Relink palette", message: "Relink palette to palette.hero.", sourceId: "sprite.hero" }
        ]
      }
    }
  });
  assert.equal(result.aiAuthoring.status, "ready");
  assert.equal(result.aiAuthoring.suggestions.length >= 3, true);
  assert.equal(summarizeAiAuthoringAssistant(result), `AI authoring assistant prepared ${result.aiAuthoring.suggestions.length} auditable suggestions.`);
}
