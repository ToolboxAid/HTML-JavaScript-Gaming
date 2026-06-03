import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  SHARED_ACTION_LABELS,
  getSharedShellActions
} from "../../toolbox/shared/assetUsageIntegration.js";

const FIRST_CLASS_TOOL_INDEXES = Object.freeze([
  { toolId: "sprite-editor", indexPath: "../../toolbox/Sprite Editor/index.html" },
  { toolId: "tile-map-editor", indexPath: "../../toolbox/Tilemap Studio/index.html" },
  { toolId: "parallax-editor", indexPath: "../../toolbox/Parallax Scene Studio/index.html" },
  { toolId: "palette-manager-v2", indexPath: "../../toolbox/palette-manager-v2/index.html" },
  { toolId: "state-inspector", indexPath: "../../toolbox/State Inspector/index.html" },
  { toolId: "replay-visualizer", indexPath: "../../toolbox/Replay Visualizer/index.html" },
  { toolId: "performance-profiler", indexPath: "../../toolbox/Performance Profiler/index.html" },
  { toolId: "physics-sandbox", indexPath: "../../toolbox/Physics Sandbox/index.html" },
  { toolId: "asset-pipeline", indexPath: "../../toolbox/Asset Pipeline/index.html" },
  { toolId: "3d-json-payload", indexPath: "../../toolbox/3D JSON Payload/index.html" },
  { toolId: "3d-asset-viewer", indexPath: "../../toolbox/3D Asset Viewer/index.html" },
  { toolId: "3d-camera-path-editor", indexPath: "../../toolbox/3D Camera Path Editor/index.html" }
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
      assert.equal(actions.length, 1);
      assert.deepEqual(
        actions.map((action) => action.label),
        [
          SHARED_ACTION_LABELS.paletteManager
        ]
      );
      assert.equal(
        actions[0].href,
        `../palette-manager-v2/index.html?sourceToolId=${toolId}`
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
