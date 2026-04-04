import assert from "node:assert/strict";
import { runHotReloadSystem, summarizeHotReloadSystem } from "../../tools/shared/hotReloadSystem.js";

export async function run() {
  const registry = {
    version: 1,
    projectId: "reload-demo",
    palettes: [{ id: "palette.hero", name: "Hero Palette", path: "assets/palettes/hero.json", colors: ["#112233FF"] }],
    sprites: [{ id: "sprite.hero", name: "Hero", path: "assets/sprites/hero.json", paletteId: "palette.hero" }],
    tilesets: [],
    tilemaps: [],
    images: [],
    parallaxSources: []
  };
  const spriteProject = { assetRefs: { spriteId: "sprite.hero", paletteId: "palette.hero" } };
  const ready = await runHotReloadSystem({
    registry,
    spriteProject,
    loaders: { data: async (id) => ({ id, loaded: true }) }
  });
  assert.equal(ready.hotReload.status, "ready");
  assert.equal(ready.hotReload.reloadMode, "reload-runtime");
  assert.equal(summarizeHotReloadSystem(ready), "Hot reload ready with mode reload-runtime.");

  const blocked = await runHotReloadSystem({
    registry,
    spriteProject: { assetRefs: { spriteId: "sprite.hero", paletteId: "palette.missing" } }
  });
  assert.equal(blocked.hotReload.status, "blocked");
  assert.equal(blocked.hotReload.blockedAt, "validation");
}
