import assert from "node:assert/strict";
import {
  SHARED_ACTION_LABELS,
  SHARED_ASSET_HANDOFF_KEY,
  SHARED_PALETTE_HANDOFF_KEY,
  createAssetHandoff,
  createPaletteHandoff,
  getSharedShellActions,
  readSharedAssetHandoff,
  readSharedPaletteHandoff,
  writeSharedAssetHandoff,
  writeSharedPaletteHandoff
} from "../../tools/shared/assetUsageIntegration.js";

function createLocalStorageHarness() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(String(key), String(value));
    },
    removeItem(key) {
      store.delete(String(key));
    }
  };
}

export async function run() {
  const previousWindow = globalThis.window;
  const localStorage = createLocalStorageHarness();
  globalThis.window = {
    localStorage,
    location: {
      search: ""
    }
  };

  try {
    const actions = getSharedShellActions("sprite-editor", "tool");
    assert.equal(actions.length, 4);
    assert.deepEqual(
      actions.map((entry) => entry.label),
      [
        SHARED_ACTION_LABELS.browseAssets,
        SHARED_ACTION_LABELS.importAssets,
        SHARED_ACTION_LABELS.browsePalettes,
        SHARED_ACTION_LABELS.managePalettes
      ]
    );
    assert.equal(
      actions[0].href,
      "../Asset Browser/index.html?view=browse&sourceToolId=sprite-editor"
    );
    assert.equal(
      actions[3].href,
      "../Palette Browser/index.html?view=manage&sourceToolId=sprite-editor"
    );

    const validAsset = createAssetHandoff({
      assetId: "asset-vector-player",
      assetType: "vector",
      sourcePath: "../../games/Asteroids/assets/vectors/asteroids-ship.vector.json",
      displayName: "Asteroids Ship Vector",
      metadata: { category: "Vector Assets" },
      sourceToolId: "tile-map-editor"
    });
    assert.equal(writeSharedAssetHandoff(validAsset), true);
    const storedAsset = readSharedAssetHandoff();
    assert.equal(storedAsset.assetId, "asset-vector-player");
    assert.equal(storedAsset.assetType, "vector");
    assert.equal(storedAsset.sourcePath, "../../games/Asteroids/assets/vectors/asteroids-ship.vector.json");
    assert.equal(storedAsset.displayName, "Asteroids Ship Vector");
    assert.equal(storedAsset.sourceToolId, "tile-map-editor");
    assert.equal(typeof storedAsset.selectedAt, "string");
    assert.equal(storedAsset.metadata.category, "Vector Assets");

    assert.equal(writeSharedAssetHandoff({ assetId: "broken-only-id" }), false);
    const stillStoredAsset = readSharedAssetHandoff();
    assert.equal(stillStoredAsset.assetId, "asset-vector-player");

    const validPalette = createPaletteHandoff({
      paletteId: "builtin:crayola032",
      displayName: "crayola032",
      colors: [{ symbol: "!", hex: "#232323", name: "Black" }],
      metadata: { source: "engine" },
      sourceToolId: "sprite-editor"
    });
    assert.equal(writeSharedPaletteHandoff(validPalette), true);
    const storedPalette = readSharedPaletteHandoff();
    assert.equal(storedPalette.paletteId, "builtin:crayola032");
    assert.equal(storedPalette.displayName, "crayola032");
    assert.equal(storedPalette.colors[0].hex, "#232323");
    assert.equal(storedPalette.sourceToolId, "sprite-editor");
    assert.equal(typeof storedPalette.selectedAt, "string");
    assert.equal(storedPalette.metadata.source, "engine");

    assert.equal(writeSharedPaletteHandoff({ displayName: "missing-id" }), false);
    const stillStoredPalette = readSharedPaletteHandoff();
    assert.equal(stillStoredPalette.paletteId, "builtin:crayola032");

    localStorage.setItem(SHARED_ASSET_HANDOFF_KEY, '{"assetId":"only-id"}');
    localStorage.setItem(SHARED_PALETTE_HANDOFF_KEY, '{"paletteId":"only-id"}');
    assert.equal(readSharedAssetHandoff(), null);
    assert.equal(readSharedPaletteHandoff().paletteId, "only-id");
  } finally {
    globalThis.window = previousWindow;
  }
}
