import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  SHARED_ACTION_LABELS,
  getSharedShellActions
} from "../../tools/shared/assetUsageIntegration.js";

const FIRST_CLASS_TOOL_INDEXES = Object.freeze([
  { toolId: "sprite-editor", indexPath: "../../tools/Sprite Editor/index.html" },
  { toolId: "vector-map-editor", indexPath: "../../tools/Vector Map Editor/index.html" },
  { toolId: "svg-asset-studio", indexPath: "../../tools/SVG Asset Studio/index.html" },
  { toolId: "tile-map-editor", indexPath: "../../tools/Tilemap Studio/index.html" },
  { toolId: "parallax-editor", indexPath: "../../tools/Parallax Scene Studio/index.html" },
  { toolId: "palette-manager-v2", indexPath: "../../tools/palette-manager-v2/index.html" },
  { toolId: "state-inspector", indexPath: "../../tools/State Inspector/index.html" },
  { toolId: "replay-visualizer", indexPath: "../../tools/Replay Visualizer/index.html" },
  { toolId: "performance-profiler", indexPath: "../../tools/Performance Profiler/index.html" },
  { toolId: "physics-sandbox", indexPath: "../../tools/Physics Sandbox/index.html" },
  { toolId: "asset-pipeline", indexPath: "../../tools/Asset Pipeline/index.html" },
  { toolId: "3d-json-payload", indexPath: "../../tools/3D JSON Payload/index.html" },
  { toolId: "3d-asset-viewer", indexPath: "../../tools/3D Asset Viewer/index.html" },
  { toolId: "3d-camera-path-editor", indexPath: "../../tools/3D Camera Path Editor/index.html" }
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
      assert.equal(actions.length, 2);
      assert.deepEqual(
        actions.map((action) => action.label),
        [
          SHARED_ACTION_LABELS.browsePalettes,
          SHARED_ACTION_LABELS.managePalettes
        ]
      );
      assert.equal(
        actions[0].href,
        `../palette-manager-v2/index.html?view=browse&sourceToolId=${toolId}`
      );
      assert.equal(
        actions[1].href,
        `../palette-manager-v2/index.html?view=manage&sourceToolId=${toolId}`
      );
    });
  } finally {
    globalThis.window = previousWindow;
  }

  FIRST_CLASS_TOOL_INDEXES.forEach(({ toolId, indexPath }) => {
    const fileUrl = new URL(indexPath, import.meta.url);
    const html = readFileSync(fileUrl, "utf8");
    assert.match(html, new RegExp(`data-tool-id="${toolId}"`));
    assert.match(html, /<script type="module" src="\.\.\/shared\/platformShell\.js"><\/script>|import\("\.\.\/shared\/platformShell\.js"\)/);
  });
}
