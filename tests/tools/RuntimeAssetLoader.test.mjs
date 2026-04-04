import assert from "node:assert/strict";
import { loadPackagedProjectRuntime, summarizeRuntimeAssetLoader } from "../../tools/shared/runtimeAssetLoader.js";

export async function run() {
  const packageManifest = {
    package: {
      version: 1,
      projectId: "demo-project",
      createdFrom: {
        registryVersion: 1,
        graphVersion: 1
      },
      roots: [
        { id: "sprite.hero", type: "sprite" }
      ],
      assets: [
        { id: "palette.hero", type: "palette", path: "assets/palettes/hero.json", sourceTool: "sprite-editor" },
        { id: "sprite.hero", type: "sprite", path: "assets/sprites/hero.json", sourceTool: "sprite-editor" }
      ],
      dependencies: [
        { from: "sprite.hero", to: "palette.hero", type: "usesPalette" }
      ],
      reports: []
    }
  };

  const loadOrder = [];
  const readyResult = await loadPackagedProjectRuntime({
    packageManifest,
    loaders: {
      data: async (id, definition) => {
        loadOrder.push(id);
        return { id, path: definition.path, loaded: true };
      }
    },
    resolvePackagedAsset: (asset) => ({
      id: asset.id,
      path: asset.path
    })
  });

  assert.equal(readyResult.runtimeLoader.status, "ready");
  assert.deepEqual(loadOrder, ["palette.hero", "sprite.hero"]);
  assert.equal(readyResult.bootstrap.projectId, "demo-project");
  assert.deepEqual(readyResult.bootstrap.startupAssetIds, ["sprite.hero"]);
  assert.equal(summarizeRuntimeAssetLoader(readyResult), "Runtime loader ready with 2 assets.");

  const repeatedOrder = [];
  const repeatedResult = await loadPackagedProjectRuntime({
    packageManifest,
    loaders: {
      data: async (id, definition) => {
        repeatedOrder.push(id);
        return { id, path: definition.path, loaded: true };
      }
    },
    resolvePackagedAsset: (asset) => ({
      id: asset.id,
      path: asset.path
    })
  });
  assert.equal(repeatedResult.runtimeLoader.status, "ready");
  assert.deepEqual(repeatedOrder, loadOrder);

  const missingAssetResult = await loadPackagedProjectRuntime({
    packageManifest,
    loaders: {
      data: async (id, definition) => ({ id, path: definition.path, loaded: true })
    },
    resolvePackagedAsset: (asset) => asset.id === "sprite.hero" ? null : { id: asset.id, path: asset.path }
  });
  assert.equal(missingAssetResult.runtimeLoader.status, "failed");
  assert.equal(missingAssetResult.runtimeLoader.failedAt, "sprite.hero");
  assert.equal(missingAssetResult.runtimeLoader.reports.at(-1)?.code, "MISSING_PACKAGED_ASSET");

  const invalidManifestResult = await loadPackagedProjectRuntime({
    packageManifest: {
      package: {
        version: 1,
        projectId: "",
        roots: [],
        assets: [],
        dependencies: []
      }
    }
  });
  assert.equal(invalidManifestResult.runtimeLoader.status, "failed");
  assert.equal(invalidManifestResult.runtimeLoader.failedAt, "manifest");
  assert.equal(invalidManifestResult.runtimeLoader.reports[0]?.code, "INVALID_PACKAGE_MANIFEST");
}
