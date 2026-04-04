import assert from "node:assert/strict";
import { buildCloudRuntime, summarizeCloudRuntime } from "../../tools/shared/cloudRuntime.js";

export async function run() {
  const result = buildCloudRuntime({
    packageManifest: {
      package: {
        projectId: "cloud-demo",
        assets: [{ id: "sprite.hero", type: "sprite" }]
      }
    },
    multiTargetExportResult: {
      multiTargetExport: {
        targets: [{ targetId: "web", outputPath: "dist/web" }]
      }
    }
  });
  assert.equal(result.cloudRuntime.status, "ready");
  assert.equal(result.cloudRuntime.deployments.length, 2);
  assert.equal(summarizeCloudRuntime(result), "Cloud runtime ready with 2 deployment targets.");
}
