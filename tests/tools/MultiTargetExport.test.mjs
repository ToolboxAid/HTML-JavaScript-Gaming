import assert from "node:assert/strict";
import { buildMultiTargetExport, summarizeMultiTargetExport } from "../../tools/shared/multiTargetExport.js";

export async function run() {
  const registry = {
    version: 1,
    projectId: "export-demo",
    palettes: [{ id: "palette.hero", name: "Hero Palette", path: "assets/palettes/hero.json", colors: ["#112233FF"] }],
    sprites: [{ id: "sprite.hero", name: "Hero", path: "assets/sprites/hero.json", paletteId: "palette.hero" }],
    tilesets: [],
    tilemaps: [],
    images: [],
    parallaxSources: []
  };
  const spriteProject = { assetRefs: { spriteId: "sprite.hero", paletteId: "palette.hero" } };
  const result = buildMultiTargetExport({ registry, spriteProject });
  assert.equal(result.multiTargetExport.status, "ready");
  assert.equal(result.multiTargetExport.targets.length, 3);
  assert.equal(summarizeMultiTargetExport(result), "Multi-target export ready for 3 targets.");
  assert.deepEqual(result.multiTargetExport.targets.map((target) => target.targetId), ["archive", "desktop", "web"]);
}
