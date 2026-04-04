import assert from "node:assert/strict";
import { buildEditorExperienceLayer, summarizeEditorExperienceLayer } from "../../tools/shared/editorExperienceLayer.js";

export async function run() {
  const result = buildEditorExperienceLayer({
    assetDependencyGraph: {
      nodes: {
        "palette.hero": { id: "palette.hero", type: "palette" },
        "sprite.hero": { id: "sprite.hero", type: "sprite" }
      },
      edges: [
        { source: "sprite.hero", target: "palette.hero", type: "usesPalette" }
      ]
    },
    validationResult: {
      validation: {
        status: "invalid",
        findings: [
          { code: "UNRESOLVED_PALETTE_LINK", severity: "error", blocking: true, sourceType: "sprite", sourceId: "sprite.hero" }
        ]
      }
    },
    remediationResult: {
      remediation: {
        status: "available",
        actions: [
          { actionType: "navigate", label: "Jump to palette problem", sourceId: "sprite.hero" }
        ]
      }
    },
    packageResult: {
      packageStatus: "ready",
      manifest: {
        package: {
          projectId: "demo-project",
          roots: [{ id: "sprite.hero" }],
          assets: [{ id: "palette.hero" }, { id: "sprite.hero" }],
          dependencies: [{ from: "sprite.hero", to: "palette.hero", type: "usesPalette" }]
        }
      }
    }
  });

  assert.equal(result.experience.status, "ready");
  assert.equal(summarizeEditorExperienceLayer(result), "Experience snapshot: 2 assets, 1 dependencies, 1 findings, 1 remediation actions.");
  assert.match(result.experience.reportText, /\[Validation\]/);
  assert.match(result.experience.reportText, /UNRESOLVED_PALETTE_LINK/);
  assert.match(result.experience.reportText, /\[Packaging\]/);
}
