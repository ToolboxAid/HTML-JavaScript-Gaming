import assert from "node:assert/strict";
import { buildProjectVersioning, summarizeProjectVersioning } from "../../tools/shared/projectVersioning.js";

export async function run() {
  const compatible = buildProjectVersioning({
    currentSchemaVersion: 1,
    projectDocument: {
      schema: "toolbox.tilemap/1",
      version: 1
    },
    packageManifest: {
      package: {
        version: 1
      }
    }
  });
  assert.equal(compatible.versioning.status, "compatible");
  assert.equal(summarizeProjectVersioning(compatible), "Project versioning compatible at schema v1.");

  const upgradeNeeded = buildProjectVersioning({
    currentSchemaVersion: 2,
    projectDocument: {
      schema: "toolbox.parallax/1",
      version: 1
    },
    packageManifest: {
      package: {
        version: 1
      }
    },
    previousVersionSnapshot: {
      projectVersion: 1,
      packageVersion: 1
    }
  });
  assert.equal(upgradeNeeded.versioning.status, "migration-needed");
  assert.equal(upgradeNeeded.versioning.migrationSteps.length, 2);
  assert.equal(upgradeNeeded.versioning.reports[0].code, "PROJECT_VERSION_OUTDATED");
}
