import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));

function readRepoFile(relativePath) {
  return readFileSync(path.join(REPO_ROOT, relativePath), "utf8");
}

function assertIncludesAll(relativePath, patterns) {
  const text = readRepoFile(relativePath);
  patterns.forEach((pattern) => {
    assert.match(text, pattern, `${relativePath} missing ${pattern}`);
  });
}

export async function run() {
  assertIncludesAll("tools/shared/platformShell.css", [
    /\.tools-platform-layout-grid/,
    /\.tools-platform-control-cluster--primary/,
    /\.tools-platform-control-cluster--workflow/,
    /\.tools-platform-control-cluster--preview/,
    /\.tools-platform-control-row/,
    /\.tools-platform-resize-panel/,
    /\.tools-platform-dock-panel/
  ]);

  assertIncludesAll("tools/Asset Browser/index.html", [
    /asset-browser__layout tools-platform-layout-grid/,
    /tools-platform-resize-panel" data-panel-side="left"/,
    /tools-platform-resize-panel" data-panel-side="right"/
  ]);

  assertIncludesAll("tools/Palette Browser/index.html", [
    /palette-browser__layout tools-platform-layout-grid/,
    /tools-platform-resize-panel" data-panel-side="left"/,
    /tools-platform-resize-panel" data-panel-side="right"/
  ]);

  assertIncludesAll("tools/Parallax Scene Studio/index.html", [
    /tools-platform-control-cluster--primary/,
    /tools-platform-control-cluster--workflow/,
    /tools-platform-control-cluster--preview/,
    /workspace tools-platform-layout-grid/,
    /preview-panel tools-platform-dock-panel/
  ]);

  assertIncludesAll("tools/Sprite Editor/index.html", [
    /tools-platform-control-cluster--primary/,
    /tools-platform-control-cluster--workflow/,
    /tools-platform-control-cluster--preview/,
    /workspace tools-platform-layout-grid/,
    /left-panel tools-platform-resize-panel/,
    /right-panel tools-platform-resize-panel/
  ]);

  assertIncludesAll("tools/Tilemap Studio/index.html", [
    /tools-platform-control-cluster--primary/,
    /tools-platform-control-cluster--workflow/,
    /tools-platform-control-cluster--preview/,
    /workspace tools-platform-layout-grid/,
    /left-sidebar tools-platform-resize-panel/,
    /right-sidebar tools-platform-resize-panel/
  ]);

  assertIncludesAll("tools/Vector Asset Studio/index.html", [
    /tools-platform-control-cluster--primary/,
    /tools-platform-control-cluster--workflow/,
    /tools-platform-control-cluster--preview/,
    /workspace tools-platform-layout-grid/,
    /left-sidebar tools-platform-resize-panel/,
    /right-sidebar tools-platform-resize-panel/
  ]);

  assertIncludesAll("tools/Vector Map Editor/index.html", [
    /tools-platform-control-cluster--primary/,
    /tools-platform-control-cluster--workflow/,
    /tools-platform-control-cluster--preview/,
    /sidebar tools-platform-resize-panel/,
    /rightbar tools-platform-resize-panel/,
    /dock hidden tools-platform-dock-panel/
  ]);

  assertIncludesAll("tools/Tool Host/index.html", [
    /meta tools-platform-control-row/,
    /tools-platform-dock-panel/
  ]);
}
