/*
Toolbox Aid
David Quesenberry
04/05/2026
RuntimeSceneLoaderHotReload.test.mjs
*/
import assert from "node:assert/strict";
import {
  createHotReloadCoordinator,
  createWatcherBridge,
  summarizeRuntimeSceneHotReload
} from "../../tools/shared/runtimeSceneLoaderHotReload.js";
import {
  ASSET_DOCUMENT_TYPE,
  COMPOSITION_DOCUMENT_TYPE,
  RENDER_CONTRACT_VERSION
} from "../../tools/shared/renderPipelineContract.js";

function createAssetDocument(tool, docId, kind, path, zIndex = 0, itemOrder = [0]) {
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
      assets: [
        {
          id: `${docId}.asset`,
          type: kind === "sprite" ? "spritesheet" : kind === "vector" ? "vector" : "image",
          path,
          source: "relative",
          preload: true,
          role: "render",
          metadata: {}
        }
      ],
      layers: [
        {
          id: `${docId}.layer`,
          name: `${docId}.layer`,
          kind,
          visible: true,
          opacity: 1,
          zIndex,
          runtimeInclusion: "gameplay",
          metadata: {},
          items: itemOrder.map((order, index) => ({
            id: `${docId}.item.${index + 1}`,
            type: "image-plane",
            assetId: `${docId}.asset`,
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
        }
      ],
      entities: []
    }
  };
}

function createCompositionDocument() {
  return {
    documentType: COMPOSITION_DOCUMENT_TYPE,
    contractVersion: RENDER_CONTRACT_VERSION,
    producer: {
      tool: "composition-manifest",
      toolVersion: "1.0.0"
    },
    document: {
      id: "scene.main",
      name: "scene.main",
      coordinateSpace: "2d",
      units: "pixels"
    },
    metadata: {},
    payload: {
      references: [
        { id: "ref.parallax", role: "parallax", documentPath: "scenes/parallax.asset.json" },
        { id: "ref.tilemap", role: "tilemap", documentPath: "scenes/tilemap.asset.json" },
        { id: "ref.sprite", role: "sprite", documentPath: "scenes/sprite.asset.json" },
        { id: "ref.vector", role: "vector", documentPath: "scenes/vector.asset.json" }
      ]
    }
  };
}

function createFixtureDocuments() {
  const composition = createCompositionDocument();
  return {
    composition,
    documentsByPath: {
      "scenes/parallax.asset.json": createAssetDocument("parallax-editor", "doc.parallax", "parallax", "assets/parallax/sky.png", 0),
      "scenes/tilemap.asset.json": createAssetDocument("tile-map-editor", "doc.tilemap", "tilemap", "assets/tilemap/level.png", 1),
      "scenes/sprite.asset.json": createAssetDocument("sprite-editor", "doc.sprite", "sprite", "assets/sprites/hero.png", 2, [2, 0, 1]),
      "scenes/vector.asset.json": createAssetDocument("vector-asset-studio", "doc.vector", "vector", "assets/vector/overlay.svg", 3)
    }
  };
}

function buildDomainLoaders(store) {
  return {
    parallax: async ({ domain, layers }) => {
      store.loads.push({ domain, layerIds: layers.map((layer) => layer.id) });
      return { domain, revision: `parallax.${store.loads.length}` };
    },
    tilemap: async ({ domain, layers }) => {
      store.loads.push({ domain, layerIds: layers.map((layer) => layer.id) });
      return { domain, revision: `tilemap.${store.loads.length}` };
    },
    sprite: async ({ domain, layers }) => {
      store.loads.push({ domain, layerIds: layers.map((layer) => layer.id) });
      return { domain, revision: `sprite.${store.loads.length}` };
    },
    vector: async ({ domain, layers }) => {
      store.loads.push({ domain, layerIds: layers.map((layer) => layer.id) });
      return { domain, revision: `vector.${store.loads.length}` };
    }
  };
}

export async function run() {
  const fixture = createFixtureDocuments();
  const store = { loads: [], disposals: [] };

  const coordinator = createHotReloadCoordinator({
    entryDocument: fixture.composition,
    entryDocumentPath: "scenes/main.composition.json",
    documentsByPath: fixture.documentsByPath,
    domainLoaders: buildDomainLoaders(store),
    domainDisposer: async ({ domain, handle, reason }) => {
      store.disposals.push({ domain, reason, revision: handle?.revision || "none" });
    },
    nowProvider: () => 1000
  });

  const initial = await coordinator.load();
  assert.equal(initial.status, "ready");
  assert.deepEqual(initial.runtime.domainLoadOrder, ["parallax", "tilemap", "sprite", "vector"]);
  assert.equal(summarizeRuntimeSceneHotReload(initial), "Runtime scene loader ready with 4 domains (initial).");
  assert.deepEqual(
    initial.runtime.layers.filter((layer) => layer.kind !== "collision" && layer.kind !== "guide").map((layer) => layer.kind),
    ["parallax", "tilemap", "sprite", "vector"]
  );

  const updatedDocuments = {
    ...fixture.documentsByPath,
    "scenes/sprite.asset.json": createAssetDocument("sprite-editor", "doc.sprite", "sprite", "assets/sprites/hero-v2.png", 2, [1, 0])
  };

  const spriteReload = await coordinator.reload({
    changes: [{ path: "./scenes/sprite.asset.json", eventType: "change" }],
    documentsByPath: updatedDocuments
  });

  assert.equal(spriteReload.status, "ready");
  assert.equal(spriteReload.reloadMode, "targeted");
  assert.deepEqual(spriteReload.affectedDomains, ["sprite"]);
  assert.deepEqual(spriteReload.runtime.domainLoadOrder, ["parallax", "tilemap", "sprite", "vector"]);
  assert.equal(store.disposals.filter((entry) => entry.domain === "sprite" && entry.reason === "replace").length, 1);

  const badDocuments = {
    ...updatedDocuments,
    "scenes/tilemap.asset.json": {
      ...updatedDocuments["scenes/tilemap.asset.json"],
      payload: {
        ...updatedDocuments["scenes/tilemap.asset.json"].payload,
        layers: [
          {
            ...updatedDocuments["scenes/tilemap.asset.json"].payload.layers[0],
            kind: "not-a-kind"
          }
        ]
      }
    }
  };

  const failedReload = await coordinator.reload({
    changes: [{ path: "scenes/tilemap.asset.json", eventType: "change" }],
    documentsByPath: badDocuments
  });

  assert.equal(failedReload.status, "failed");
  assert.equal(failedReload.activeRuntime.scene.id, "scene.main");
  assert.equal(failedReload.reports.some((report) => report.code === "RELOAD_REJECTED_KEEP_LAST_GOOD"), true);

  const bridge = createWatcherBridge({ nowProvider: () => 2000 });
  assert.equal(bridge.getState().pendingCount, 0);
  const accepted = bridge.publish({ path: "./scenes/sprite.asset.json", eventType: "change" });
  assert.equal(accepted.status, "accepted");
  bridge.publish({ path: "scenes/sprite.asset.json", eventType: "change", timestamp: 2001, hash: "hash-2" });
  bridge.publish({ path: "../../outside.txt", eventType: "change" });
  const flushed = bridge.flush();
  assert.equal(flushed.length, 1);
  assert.equal(flushed[0].path, "scenes/sprite.asset.json");

  for (let iteration = 0; iteration < 3; iteration += 1) {
    const repeatedDocuments = {
      ...updatedDocuments,
      "scenes/sprite.asset.json": createAssetDocument(
        "sprite-editor",
        "doc.sprite",
        "sprite",
        `assets/sprites/hero-r${iteration + 1}.png`,
        2,
        [iteration, 0]
      )
    };
    const repeated = await coordinator.reload({
      changes: [{ path: "scenes/sprite.asset.json", eventType: "change", timestamp: 3000 + iteration }],
      documentsByPath: repeatedDocuments
    });
    assert.equal(repeated.status, "ready");
    assert.equal(repeated.reloadMode, "targeted");
    assert.deepEqual(repeated.affectedDomains, ["sprite"]);
    assert.deepEqual(repeated.runtime.domainLoadOrder, ["parallax", "tilemap", "sprite", "vector"]);
    assert.equal(coordinator.getState().activeDomainOrder.length, 4);
  }

  const disposeResult = await coordinator.disposeActiveScene("test-finish");
  assert.equal(disposeResult.status, "ready");
  assert.equal(coordinator.getState().hasActiveRuntime, false);
  assert.equal(store.disposals.filter((entry) => entry.reason === "test-finish").length, 4);
  assert.equal(store.loads.filter((entry) => entry.domain === "sprite").length >= 4, true);
}
