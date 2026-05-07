// Temporary UAT-only workspace session loader. Keep this isolated so
// ?workspace=UAT can be removed without touching normal Workspace V2 loading.
const TEMPORARY_UAT_GAME_ROOT = "games/Asteroids/";
const TEMPORARY_UAT_ASSETS_PATH = "games/Asteroids/assets";

const TEMPORARY_UAT_SAMPLE_PALETTE = Object.freeze({
  "$schema": "tools/schemas/tools/palette-browser.schema.json",
  schema: "html-js-gaming.palette",
  version: 1,
  id: "asset-manager-v2-uat-sample",
  name: "Asset Manager V2 UAT Sample Palette",
  source: "Asset Manager V2 temporary UAT sample",
  sourceId: "?workspace=UAT",
  locked: true,
  swatches: Object.freeze([
    Object.freeze({ symbol: "V", hex: "#7C3AED", name: "Signal Violet!", source: "UAT Sample", tags: Object.freeze(["ui", "accent"]) }),
    Object.freeze({ symbol: "G", hex: "#22C55E", name: "Success Green", source: "UAT Sample", tags: Object.freeze(["success", "hud"]) }),
    Object.freeze({ symbol: "A", hex: "#F59E0B", name: "Alert Amber", source: "UAT Sample", tags: Object.freeze(["warning", "hud"]) })
  ])
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function readTemporaryUatWorkspaceContext(locationRef = window.location) {
  const params = new URLSearchParams(locationRef.search || "");
  const workspace = params.get("workspace");
  if (workspace !== "UAT") {
    return {
      ok: false,
      isWorkspaceQuery: Boolean(workspace),
      message: workspace ? `Temporary workspace ${workspace} is not supported.` : ""
    };
  }
  return {
    ok: true,
    // Temporary UAT-only game root for Asset Manager V2 preview/path testing.
    assetsPath: TEMPORARY_UAT_ASSETS_PATH,
    gameRoot: TEMPORARY_UAT_GAME_ROOT,
    palette: clone(TEMPORARY_UAT_SAMPLE_PALETTE)
  };
}
