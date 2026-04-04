import assert from "node:assert/strict";
import { buildProjectAssetRemediation, getPrimaryRemediationAction, summarizeProjectAssetRemediation } from "../../tools/shared/projectAssetRemediation.js";

export async function run() {
  const registry = {
    version: 1,
    projectId: "demo-project",
    palettes: [
      { id: "palette.hero", name: "Hero Palette", colors: ["#112233FF"] }
    ],
    sprites: [],
    tilesets: [
      { id: "tileset.overworld", name: "Overworld", path: "assets/tilesets/overworld.json" }
    ],
    tilemaps: [],
    images: [],
    parallaxSources: [
      { id: "parallax.sky", name: "Sky Layer", path: "assets/parallax/sky.json", imageId: "image.sky" }
    ]
  };

  const validationResult = {
    validation: {
      status: "invalid",
      findings: [
        {
          code: "UNRESOLVED_TILESET_LINK",
          severity: "error",
          blocking: true,
          sourceType: "tilemap",
          sourceId: "tilemap.overworld",
          message: "Tileset asset reference tileset.missing is missing from the registry."
        },
        {
          code: "STALE_GRAPH_SNAPSHOT",
          severity: "warning",
          blocking: false,
          sourceType: "graph",
          sourceId: "demo-project",
          message: "Asset dependency graph snapshot does not match the deterministic graph rebuilt from the registry."
        }
      ]
    }
  };

  const remediation = buildProjectAssetRemediation({
    validationResult,
    registry
  });

  assert.equal(remediation.remediation.status, "available");
  assert.equal(remediation.remediation.actions.length, 6);
  assert.deepEqual(
    remediation.remediation.actions.map((action) => action.actionId),
    [
      "jump-to-problem",
      "inspect-finding",
      "relink-single-candidate",
      "jump-to-problem",
      "inspect-finding",
      "refresh-graph-snapshot"
    ]
  );
  assert.equal(
    summarizeProjectAssetRemediation(remediation),
    "6 remediation actions available, 2 confirmable fixes."
  );
  const primaryFix = getPrimaryRemediationAction(remediation, "confirmable-fix");
  assert.equal(primaryFix?.payload?.candidateId, "tileset.overworld");
  assert.equal(primaryFix?.payload?.fixKind, "relink-reference");

  const repeated = buildProjectAssetRemediation({
    validationResult,
    registry
  });
  assert.deepEqual(repeated, remediation);

  const empty = buildProjectAssetRemediation({
    validationResult: {
      validation: {
        status: "valid",
        findings: []
      }
    },
    registry
  });
  assert.equal(empty.remediation.status, "unavailable");
  assert.equal(summarizeProjectAssetRemediation(empty), "No remediation actions available.");
}
