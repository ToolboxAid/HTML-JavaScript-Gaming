import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  SHARED_ACTION_LABELS,
  getSharedShellActions
} from "../../tools/shared/assetUsageIntegration.js";

const FIRST_CLASS_TOOL_INDEXES = Object.freeze([
  { toolId: "asset-browser", indexPath: "../../tools/Asset Browser/index.html" },
  { toolId: "sprite-editor", indexPath: "../../tools/Sprite Editor/index.html" },
  { toolId: "vector-map-editor", indexPath: "../../tools/Vector Map Editor/index.html" },
  { toolId: "vector-asset-studio", indexPath: "../../tools/Vector Asset Studio/index.html" },
  { toolId: "tile-map-editor", indexPath: "../../tools/Tilemap Studio/index.html" },
  { toolId: "parallax-editor", indexPath: "../../tools/Parallax Scene Studio/index.html" },
  { toolId: "palette-browser", indexPath: "../../tools/Palette Browser/index.html" },
  { toolId: "state-inspector", indexPath: "../../tools/State Inspector/index.html" },
  { toolId: "replay-visualizer", indexPath: "../../tools/Replay Visualizer/index.html" },
  { toolId: "performance-profiler", indexPath: "../../tools/Performance Profiler/index.html" },
  { toolId: "physics-sandbox", indexPath: "../../tools/Physics Sandbox/index.html" },
  { toolId: "asset-pipeline-tool", indexPath: "../../tools/Asset Pipeline Tool/index.html" },
  { toolId: "tile-model-converter", indexPath: "../../tools/Tile Model Converter/index.html" }
]);

export async function run() {
  const previousWindow = globalThis.window;
  globalThis.window = {
    location: {
      search: ""
    }
  };

  try {
    FIRST_CLASS_TOOL_INDEXES.forEach(({ toolId }) => {
      const actions = getSharedShellActions(toolId, "tool");
      assert.equal(actions.length, 4);
      assert.deepEqual(
        actions.map((action) => action.label),
        [
          SHARED_ACTION_LABELS.browseAssets,
          SHARED_ACTION_LABELS.importAssets,
          SHARED_ACTION_LABELS.browsePalettes,
          SHARED_ACTION_LABELS.managePalettes
        ]
      );
      assert.equal(
        actions[0].href,
        `../Asset Browser/index.html?view=browse&sourceToolId=${toolId}`
      );
      assert.equal(
        actions[1].href,
        `../Asset Browser/index.html?view=import&sourceToolId=${toolId}`
      );
      assert.equal(
        actions[2].href,
        `../Palette Browser/index.html?view=browse&sourceToolId=${toolId}`
      );
      assert.equal(
        actions[3].href,
        `../Palette Browser/index.html?view=manage&sourceToolId=${toolId}`
      );
    });
  } finally {
    globalThis.window = previousWindow;
  }

  FIRST_CLASS_TOOL_INDEXES.forEach(({ toolId, indexPath }) => {
    const fileUrl = new URL(indexPath, import.meta.url);
    const html = readFileSync(fileUrl, "utf8");
    assert.match(html, new RegExp(`data-tool-id="${toolId}"`));
    assert.match(html, /<script type="module" src="\.\.\/shared\/platformShell\.js"><\/script>/);
  });
}
