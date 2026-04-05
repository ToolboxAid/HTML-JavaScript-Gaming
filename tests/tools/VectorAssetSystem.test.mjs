import assert from "node:assert/strict";
import { validateProjectAssetState } from "../../tools/shared/projectAssetValidation.js";
import { buildProjectPackage } from "../../tools/shared/projectPackaging.js";
import { loadPackagedProjectRuntime } from "../../tools/shared/runtimeAssetLoader.js";
import { buildVectorAssetSystem, createVectorAssetSystemFixture } from "../../tools/shared/vectorAssetSystem.js";
import { normalizeSvgToVectorAsset, summarizeVectorAssetDefinition } from "../../tools/shared/vector/vectorAssetBridge.js";
import { VECTOR_ASSET_FORMAT } from "../../tools/shared/vector/vectorAssetContract.js";

export async function run() {
  const normalized = normalizeSvgToVectorAsset({
    id: "vector.test.ship",
    name: "Test Ship",
    path: "games/Asteroids/platform/assets/vectors/test-ship.vector.json",
    paletteId: "palette.hero",
    svgText: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 20 20"><path d="M 0 -8 L 6 8 L 0 4 L -6 8 Z" /></svg>'
  });
  assert.equal(normalized.type, "vector");
  assert.equal(normalized.format, VECTOR_ASSET_FORMAT);
  assert.equal(normalized.assetId, "vector.test.ship");
  assert.equal(normalized.source.kind, "svg");
  assert.equal(normalized.viewport.width, 20);
  assert.equal(normalized.layers.length, 1);
  assert.equal(normalized.geometry.paths.length, 1);
  assert.equal(summarizeVectorAssetDefinition(normalized), "Vector asset vector.test.ship ready with 1 path.");

  const fixture = createVectorAssetSystemFixture();
  const validation = validateProjectAssetState({
    registry: fixture.registry,
    vectorDocument: fixture.vectorDocument
  });
  assert.equal(validation.validation.status, "valid");
  assert.equal(validation.assetDependencyGraph.nodes["vector.asteroids.ship"].type, "vector");
  assert.deepEqual(
    validation.assetDependencyGraph.edges.filter((edge) => edge.source === "vector.asteroids.ship"),
    [{ id: "usesPalette:vector.asteroids.ship->palette.asteroids-hud", source: "vector.asteroids.ship", target: "palette.asteroids-hud", type: "usesPalette" }]
  );

  const packageResult = buildProjectPackage({
    registry: fixture.registry,
    validationResult: validation,
    vectorDocument: fixture.vectorDocument
  });
  assert.equal(packageResult.packageStatus, "ready");
  assert.deepEqual(
    packageResult.manifest.package.assets.map((asset) => asset.id),
    ["palette.asteroids-hud", "vector.asteroids.ship"]
  );

  const runtimeResult = await loadPackagedProjectRuntime({
    packageManifest: packageResult.manifest,
    resolvePackagedAsset: (asset) => fixture.runtimeAssets[asset.id] || null
  });
  assert.equal(runtimeResult.runtimeLoader.status, "ready");
  assert.equal(runtimeResult.bootstrap.assetTable["vector.asteroids.ship"].type, "vector");
  assert.equal(runtimeResult.bootstrap.assetTable["vector.asteroids.ship"].runtimeKind, "vector-geometry");
  assert.equal(runtimeResult.bootstrap.assetTable["vector.asteroids.ship"].renderables.length, 2);

  const invalidValidation = validateProjectAssetState({
    registry: {
      ...fixture.registry,
      vectors: [
        {
          id: "vector.broken",
          name: "Broken",
          path: "games/Asteroids/platform/assets/vectors/broken.vector.json",
          paletteId: "palette.asteroids-hud",
          source: { kind: "json", path: "" },
          format: VECTOR_ASSET_FORMAT,
          version: 1,
          assetId: "vector.broken",
          viewport: { x: 0, y: 0, width: 0, height: 0 },
          origin: { name: "center", x: 0, y: 0 },
          layers: [
            {
              id: "layer-01",
              shapes: [
                {
                  id: "layer-01.shape-001",
                  type: "path",
                  d: ""
                }
              ]
            }
          ],
          style: { stroke: false, fill: false },
          sourceTool: "vector-asset-studio"
        }
      ]
    },
    vectorDocument: {
      assetRefs: {
        vectorId: "vector.broken",
        paletteId: "palette.asteroids-hud"
      }
    }
  });
  assert.equal(invalidValidation.validation.status, "invalid");
  assert.deepEqual(
    invalidValidation.validation.findings.map((finding) => finding.code),
    ["INVALID_VECTOR_GEOMETRY", "INVALID_VECTOR_SOURCE", "INVALID_VECTOR_STYLE"]
  );

  const first = await buildVectorAssetSystem();
  const second = await buildVectorAssetSystem();
  assert.equal(first.vectorAssetSystem.status, "ready");
  assert.deepEqual(first, second);
  assert.match(first.vectorAssetSystem.reportText, /VECTOR_ASSET_SYSTEM_READY/);
}
