import assert from "node:assert/strict";
import { runPublishingPipeline, summarizePublishingPipeline } from "../../tools/shared/publishingPipeline.js";

export async function run() {
  const result = await runPublishingPipeline({
    ciValidationResult: {
      ciValidation: { status: "pass" }
    },
    multiTargetExportResult: {
      multiTargetExport: {
        status: "ready",
        targets: [
          { targetId: "archive", outputPath: "dist/archive" },
          { targetId: "web", outputPath: "dist/web" }
        ]
      }
    },
    cloudRuntimeResult: {
      cloudRuntime: {
        deployments: [
          { deployTargetId: "edge", publishPath: "cloud/edge" }
        ]
      }
    }
  });
  assert.equal(result.publishing.status, "ready");
  assert.equal(result.publishing.releaseTargets.length, 3);
  assert.equal(summarizePublishingPipeline(result), "Publishing pipeline ready with 3 release targets.");
}
