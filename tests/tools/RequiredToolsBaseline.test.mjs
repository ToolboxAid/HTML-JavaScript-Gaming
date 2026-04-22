import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getToolById } from "../../tools/toolRegistry.js";

const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));

const REQUIRED_TOOLS = Object.freeze([
  { id: "physics-sandbox", folder: "Physics Sandbox" },
  { id: "state-inspector", folder: "State Inspector" },
  { id: "replay-visualizer", folder: "Replay Visualizer" },
  { id: "performance-profiler", folder: "Performance Profiler" },
  { id: "asset-pipeline-tool", folder: "Asset Pipeline Tool" },
  { id: "tile-model-converter", folder: "Tile Model Converter" },
  { id: "3d-json-payload-normalizer", folder: "3D JSON Payload Normalizer" },
  { id: "3d-asset-viewer", folder: "3D Asset Viewer" },
  { id: "3d-camera-path-editor", folder: "3D Camera Path Editor" }
]);

export async function run() {
  REQUIRED_TOOLS.forEach(({ id, folder }) => {
    const entry = getToolById(id);
    assert.ok(entry, `Tool registry entry missing: ${id}`);
    assert.equal(entry.active, true, `Tool must be active: ${id}`);
    assert.equal(entry.folderName, folder, `Tool folder must match: ${id}`);

    const indexPath = path.join(REPO_ROOT, "tools", folder, "index.html");
    const mainPath = path.join(REPO_ROOT, "tools", folder, "main.js");

    assert.equal(statSync(indexPath).isFile(), true, `${folder}/index.html missing`);
    assert.equal(statSync(mainPath).isFile(), true, `${folder}/main.js missing`);

    const html = readFileSync(indexPath, "utf8");
    const js = readFileSync(mainPath, "utf8");
    assert.match(html, new RegExp(`data-tool-id="${id}"`));
    assert.match(html, /<script type="module" src="\.\.\/shared\/platformShell\.js"><\/script>/);
    assert.match(js, new RegExp(`registerToolBootContract\\("${id}"`));
  });
}
