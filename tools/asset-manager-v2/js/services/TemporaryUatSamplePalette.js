// Temporary UAT-only sample palette loader. Keep this isolated so ?palette=sample
// can be removed without touching normal Workspace V2 palette loading.
const TEMPORARY_UAT_SAMPLE_PALETTE = Object.freeze({
  "$schema": "tools/schemas/tools/palette-browser.schema.json",
  schema: "html-js-gaming.palette",
  version: 1,
  id: "asset-manager-v2-uat-sample",
  name: "Asset Manager V2 UAT Sample Palette",
  source: "Asset Manager V2 temporary UAT sample",
  sourceId: "?palette=sample",
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

export function readTemporaryUatSamplePalette(locationRef = window.location) {
  const params = new URLSearchParams(locationRef.search || "");
  if (params.get("palette") !== "sample") {
    return { ok: false, palette: null };
  }
  return {
    ok: true,
    palette: clone(TEMPORARY_UAT_SAMPLE_PALETTE)
  };
}
