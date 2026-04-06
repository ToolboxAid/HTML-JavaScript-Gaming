/*
Toolbox Aid
David Quesenberry
04/05/2026
RenderPipelineContractAll4Tools.test.mjs
*/
import assert from "node:assert/strict";
import {
  ASSET_DOCUMENT_TYPE,
  COMPOSITION_DOCUMENT_TYPE,
  RENDER_CONTRACT_VERSION,
  getRenderContractVersionMetadata,
  getRenderPipelineStageOrder,
  runRenderContractRuntimePath,
  summarizeRenderContractRuntimePath
} from "../../tools/shared/renderPipelineContract.js";

function createAsset(id, type, path) {
  return {
    id,
    type,
    path,
    source: "relative",
    preload: true,
    role: "render",
    metadata: {}
  };
}

function createLayer(kind, id, zIndex, assetId, itemOrder = [0]) {
  return {
    id,
    name: id,
    kind,
    visible: true,
    opacity: 1,
    zIndex,
    runtimeInclusion: "gameplay",
    metadata: {},
    items: itemOrder.map((order, index) => ({
      id: `${id}.item.${index + 1}`,
      type: "image-plane",
      assetId,
      visible: true,
      order,
      transform: {
        x: index,
        y: index,
        scaleX: 1,
        scaleY: 1,
        rotation: 0
      },
      metadata: {}
    }))
  };
}

function createAssetDocument(tool, docId, layer) {
  return {
    documentType: ASSET_DOCUMENT_TYPE,
    contractVersion: RENDER_CONTRACT_VERSION,
    producer: {
      tool,
      toolVersion: "1.0.0"
    },
    document: {
      id: docId,
      name: docId,
      coordinateSpace: "2d",
      units: "pixels"
    },
    metadata: {},
    payload: {
      assets: [createAsset(`${docId}.asset`, layer.kind === "sprite" ? "spritesheet" : "image", `assets/${docId}.png`)],
      layers: [
        {
          ...layer,
          items: layer.items.map((item) => ({
            ...item,
            assetId: `${docId}.asset`
          }))
        }
      ],
      entities: []
    }
  };
}

export async function run() {
  const metadata = getRenderContractVersionMetadata();
  assert.equal(metadata.contractId, "toolbox.render.contract");
  assert.equal(metadata.currentVersion, "1.0.0");
  assert.equal(metadata.supportedVersions.includes("1.0.0"), true);

  const stageOrder = getRenderPipelineStageOrder();
  assert.deepEqual(stageOrder, ["load", "validate", "normalize", "resolve", "compose", "sequence", "render"]);

  const spriteDoc = createAssetDocument("sprite-editor", "sprite.player", createLayer("sprite", "layer.sprite", 40, "", [5, 1]));
  const validSingle = runRenderContractRuntimePath({ entryDocument: spriteDoc });
  assert.equal(validSingle.status, "ready");
  assert.equal(validSingle.errors.length, 0);
  assert.equal(validSingle.output.layers.length, 1);
  assert.deepEqual(validSingle.output.layers[0].items.map((item) => item.order), [1, 5]);
  assert.equal(summarizeRenderContractRuntimePath(validSingle), "Render contract runtime path ready with 1 layers and 1 assets.");

  const invalidDoc = {
    ...createAssetDocument("parallax-editor", "parallax.bad", createLayer("tilemap", "layer.bad", 1, "")),
    contractVersion: "2.0.0"
  };
  const invalidResult = runRenderContractRuntimePath({ entryDocument: invalidDoc });
  assert.equal(invalidResult.status, "failed");
  assert.equal(invalidResult.errors.some((error) => error.code === "UNSUPPORTED_CONTRACT_VERSION"), true);
  assert.equal(invalidResult.errors.some((error) => error.code === "TOOL_ENGINE_MAPPING_VIOLATION"), true);

  const compatibleDoc = {
    ...createAssetDocument("sprite-editor", "sprite.compat", createLayer("sprite", "layer.compat", 1, "")),
    contractVersion: "v1.0"
  };
  const compatibleResult = runRenderContractRuntimePath({ entryDocument: compatibleDoc });
  assert.equal(compatibleResult.status, "ready");

  const parallaxDoc = createAssetDocument("parallax-editor", "parallax.scene", createLayer("parallax", "layer.parallax", 5, ""));
  const tilemapDoc = createAssetDocument("tile-map-editor", "tilemap.scene", createLayer("tilemap", "layer.tilemap", 0, ""));
  const vectorDoc = createAssetDocument("vector-asset-studio", "vector.scene", createLayer("vector", "layer.vector", 0, ""));

  const compositionDoc = {
    documentType: COMPOSITION_DOCUMENT_TYPE,
    contractVersion: RENDER_CONTRACT_VERSION,
    producer: {
      tool: "composition-manifest",
      toolVersion: "1.0.0"
    },
    document: {
      id: "scene.level.01",
      name: "Scene Level 01",
      coordinateSpace: "2d",
      units: "pixels"
    },
    metadata: {},
    payload: {
      references: [
        { id: "ref.sprite", documentPath: "assets/contracts/sprite.json", role: "sprite" },
        { id: "ref.parallax", documentPath: "assets/contracts/parallax.json", role: "parallax" },
        { id: "ref.vector", documentPath: "assets/contracts/vector.json", role: "vector" },
        { id: "ref.tilemap", documentPath: "assets/contracts/tilemap.json", role: "tilemap" }
      ]
    }
  };

  const compositionResult = runRenderContractRuntimePath({
    entryDocument: compositionDoc,
    documentsByPath: {
      "assets/contracts/sprite.json": spriteDoc,
      "assets/contracts/parallax.json": parallaxDoc,
      "assets/contracts/vector.json": vectorDoc,
      "assets/contracts/tilemap.json": tilemapDoc
    }
  });

  assert.equal(compositionResult.status, "ready");
  assert.equal(compositionResult.output.assets.length, 4);
  assert.equal(compositionResult.output.layers.length, 4);
  assert.deepEqual(
    compositionResult.output.layers.map((layer) => layer.kind),
    ["parallax", "tilemap", "sprite", "vector"]
  );

  const missingReferenceResult = runRenderContractRuntimePath({
    entryDocument: compositionDoc,
    documentsByPath: {
      "assets/contracts/sprite.json": spriteDoc
    }
  });
  assert.equal(missingReferenceResult.status, "failed");
  assert.equal(
    missingReferenceResult.errors.some((error) => error.code === "MISSING_COMPOSITION_REFERENCE_DOCUMENT"),
    true
  );
}
