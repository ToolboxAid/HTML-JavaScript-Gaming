import assert from "node:assert/strict";
import { loadPackagedProjectRuntime } from "../../tools/shared/runtimeAssetLoader.js";
import {
  inspectVectorGeometryRuntimeAsset,
  prepareVectorGeometryRuntimeAsset,
  summarizeVectorGeometryRuntime,
  VECTOR_GEOMETRY_RUNTIME_POLICY
} from "../../tools/shared/vectorGeometryRuntime.js";
import { normalizeSvgToVectorAsset } from "../../tools/shared/vector/vectorAssetBridge.js";
import { VECTOR_ASSET_FORMAT } from "../../tools/shared/vector/vectorAssetContract.js";
import {
  computeBoundsFromPoints,
  createPoint,
  parseSvgPathData,
  rotatePoint,
  scalePoint,
  transformPoint,
  translatePoint
} from "../../tools/shared/vector/vectorGeometryMath.js";

function createContractAsset() {
  return {
    format: VECTOR_ASSET_FORMAT,
    version: 1,
    assetId: "vector.contract.sample",
    name: "Contract Sample",
    type: "vector",
    path: "games/vector-arcade-sample/assets/vectors/contract-sample.vector.json",
    paletteId: "palette.vector-native.primary",
    sourceTool: "vector-asset-studio",
    source: {
      kind: "svg",
      path: "games/vector-arcade-sample/assets/vectors/contract-sample.vector.json"
    },
    viewport: {
      x: -20,
      y: -20,
      width: 40,
      height: 40
    },
    origin: {
      name: "center",
      x: 0,
      y: 0
    },
    anchors: [
      {
        name: "nose",
        x: 0,
        y: -16
      }
    ],
    layers: [
      {
        id: "layer-01",
        name: "ship",
        shapes: [
          {
            id: "outline",
            type: "polygon",
            points: [
              { x: 0, y: -16 },
              { x: 12, y: 12 },
              { x: 0, y: 6 },
              { x: -12, y: 12 }
            ],
            stroke: {
              color: "#FFFFFFFF",
              width: 1,
              opacity: 1,
              join: "miter",
              cap: "butt"
            }
          },
          {
            id: "thruster",
            type: "line",
            x1: -4,
            y1: 10,
            x2: 4,
            y2: 10,
            stroke: {
              color: "#FFFFFFFF",
              width: 1,
              opacity: 1,
              join: "round",
              cap: "round"
            }
          }
        ]
      }
    ],
    metadata: {
      contractFixture: true
    }
  };
}

export async function run() {
  const translated = translatePoint({ x: 1, y: 2 }, { x: 3, y: -1 });
  assert.deepEqual(translated, { x: 4, y: 1 });

  const scaled = scalePoint({ x: 4, y: 2 }, { x: 2, y: 3 }, { x: 1, y: 1 });
  assert.deepEqual(scaled, { x: 7, y: 4 });

  const rotated = rotatePoint({ x: 10, y: 0 }, Math.PI / 2, { x: 0, y: 0 });
  assert.equal(rotated.x, 0);
  assert.equal(rotated.y, 10);

  const transformed = transformPoint(
    { x: 2, y: 1 },
    {
      scale: { x: 2, y: 2 },
      rotateRadians: Math.PI,
      translate: { x: 5, y: -3 },
      origin: { x: 0, y: 0 }
    }
  );
  assert.deepEqual(transformed, { x: 1, y: -5 });

  const path = parseSvgPathData("M 0 0 L 10 0 L 10 10 Z");
  assert.equal(path.closed, true);
  assert.equal(path.points.length, 3);
  assert.deepEqual(computeBoundsFromPoints(path.points), {
    minX: 0,
    minY: 0,
    maxX: 10,
    maxY: 10,
    width: 10,
    height: 10,
    center: createPoint(5, 5)
  });

  const contractAsset = createContractAsset();
  const inspection = inspectVectorGeometryRuntimeAsset(contractAsset);
  assert.equal(inspection.status, "ready");
  assert.equal(inspection.normalizedAsset.layers.length, 1);

  const runtimeAsset = prepareVectorGeometryRuntimeAsset(contractAsset, {
    transform: {
      translate: { x: 10, y: 5 },
      rotateRadians: 0,
      scale: { x: 1, y: 1 }
    }
  });
  assert.equal(runtimeAsset.runtimeKind, "vector-geometry");
  assert.equal(runtimeAsset.renderables.length, 2);
  assert.equal(runtimeAsset.collisionPrimitives.length, 2);
  assert.deepEqual(runtimeAsset.bounds.center, { x: 10, y: 3 });
  assert.deepEqual(runtimeAsset.runtimePolicy, VECTOR_GEOMETRY_RUNTIME_POLICY);
  assert.equal(runtimeAsset.reports.at(-1)?.code, "VECTOR_RUNTIME_POLICY");
  assert.equal(
    summarizeVectorGeometryRuntime(runtimeAsset),
    "Vector geometry runtime ready for vector.contract.sample with 2 renderable primitives."
  );

  const repeatedRuntimeAsset = prepareVectorGeometryRuntimeAsset(contractAsset, {
    transform: {
      translate: { x: 10, y: 5 },
      rotateRadians: 0,
      scale: { x: 1, y: 1 }
    }
  });
  assert.deepEqual(repeatedRuntimeAsset, runtimeAsset);

  const legacyAsset = normalizeSvgToVectorAsset({
    id: "vector.legacy.sample",
    name: "Legacy Sample",
    path: "games/vector-arcade-sample/assets/vectors/legacy-sample.vector.json",
    paletteId: "palette.vector-native.primary",
    svgText: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 20 20"><path d="M 0 -8 L 6 8 L -6 8 Z" /></svg>'
  });
  const legacyRuntime = prepareVectorGeometryRuntimeAsset(legacyAsset);
  assert.equal(legacyRuntime.contract.metadata.normalizedFromLegacy, true);
  assert.equal(legacyRuntime.renderables.length, 1);
  assert.equal(legacyRuntime.renderables[0].primitive, "path");

  const invalidInspection = inspectVectorGeometryRuntimeAsset({
    format: VECTOR_ASSET_FORMAT,
    version: 1,
    assetId: "vector.invalid",
    source: { kind: "svg", path: "games/vector-arcade-sample/assets/vectors/invalid.vector.json" },
    viewport: { x: 0, y: 0, width: 0, height: 0 },
    origin: { name: "center", x: 0, y: 0 },
    layers: []
  });
  assert.equal(invalidInspection.status, "invalid");
  assert.equal(invalidInspection.issues.length > 0, true);

  const runtimeResult = await loadPackagedProjectRuntime({
    packageManifest: {
      package: {
        version: 1,
        projectId: "vector-runtime-demo",
        createdFrom: {
          registryVersion: 1,
          graphVersion: 1
        },
        roots: [
          { id: "vector.contract.sample", type: "vector" }
        ],
        assets: [
          {
            id: "vector.contract.sample",
            type: "vector",
            path: "games/vector-arcade-sample/assets/vectors/contract-sample.vector.json",
            sourceTool: "vector-asset-studio"
          }
        ],
        dependencies: [],
        reports: []
      }
    },
    resolvePackagedAsset: () => createContractAsset()
  });
  assert.equal(runtimeResult.runtimeLoader.status, "ready");
  assert.equal(runtimeResult.bootstrap.assetTable["vector.contract.sample"].runtimeKind, "vector-geometry");
  assert.equal(runtimeResult.bootstrap.assetTable["vector.contract.sample"].renderables.length, 2);
}
