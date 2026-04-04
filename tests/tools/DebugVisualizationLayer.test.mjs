import assert from "node:assert/strict";
import { buildDebugVisualizationLayer, summarizeDebugVisualizationLayer } from "../../tools/shared/debugVisualizationLayer.js";

export async function run() {
  const result = buildDebugVisualizationLayer({
    assetDependencyGraph: {
      nodes: { "sprite.hero": {}, "palette.hero": {} },
      edges: [{ source: "sprite.hero", target: "palette.hero", type: "usesPalette" }]
    },
    validationResult: {
      validation: { status: "invalid", findings: [{ code: "UNRESOLVED_PALETTE_LINK", blocking: true, sourceId: "sprite.hero" }] }
    },
    remediationResult: {
      remediation: { status: "available", actions: [{ actionType: "navigate", label: "Jump", sourceId: "sprite.hero" }] }
    },
    packageResult: {
      packageStatus: "ready",
      manifest: { package: { roots: [{ id: "sprite.hero" }], assets: [{ id: "sprite.hero" }], dependencies: [], reports: [{ code: "PACKAGE_READY" }] } }
    },
    runtimeResult: {
      runtimeLoader: { status: "failed", loadedAssets: [], failedAt: "sprite.hero", reports: [{ code: "MISSING_PACKAGED_ASSET", message: "Missing." }] }
    }
  });
  assert.equal(result.debugVisualization.status, "ready");
  assert.equal(summarizeDebugVisualizationLayer(result), "Debug view: 2 nodes, 1 edges, 1 findings.");
  assert.match(result.debugVisualization.reportText, /\[Runtime Trace\]/);
}
