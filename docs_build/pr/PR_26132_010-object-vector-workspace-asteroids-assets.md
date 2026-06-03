# PR_26132_010-object-vector-workspace-asteroids-assets

## Purpose

Wire Object Vector Studio V2 into Workspace Manager V2 launch/session flow and seed Asteroids with schema-valid object vector assets.

## Scope

- Added Object Vector Studio V2 to Workspace Manager V2 launchable tool tiles.
- Added Object Vector Studio V2 schema validation to Workspace Manager V2 tool payload validation.
- Added Asteroids `root.tools.object-vector-studio-v2` durable object asset data for:
  - Asteroids Ship
  - Large Asteroid
  - Medium Asteroid
  - Small Asteroid
  - Large UFO
  - Small UFO
- Kept palette data out of the Object Vector Studio V2 object payload.
- Prefer the active workspace palette session on workspace launch before runtime palette cache.
- Added tile detail/count display for Object Vector Studio V2 object assets.
- Added workspace launch logging that names the object payload source and separate palette session source.

## Validation

Commands run:

```powershell
node -e "const fs=require('fs'); for (const p of ['games/Asteroids/game.manifest.json','toolbox/schemas/workspace.manifest.schema.json']) { JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'')); } console.log('json ok')"
@'
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
(async () => {
  const root = process.cwd();
  const { ObjectVectorStudioV2SchemaService } = await import(pathToFileURL(path.join(root, 'toolbox/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js')).href);
  const service = new ObjectVectorStudioV2SchemaService({
    fetchRef: async (url) => ({
      ok: true,
      json: async () => JSON.parse(fs.readFileSync(new URL(url), 'utf8').replace(/^\uFEFF/, ''))
    })
  });
  await service.loadSchema();
  const manifest = JSON.parse(fs.readFileSync('games/Asteroids/game.manifest.json', 'utf8').replace(/^\uFEFF/, ''));
  const result = service.validatePayload(manifest.game.workspace.tools['object-vector-studio-v2']);
  console.log(JSON.stringify({ ok: result.ok, errors: result.errors, objects: result.payload?.objects?.length }, null, 2));
})();
'@ | node -
npm run test:workspace-v2
```

Result:

```text
39 passed
```

## Playwright Coverage

Workspace Manager V2 coverage now verifies:

- Object Vector Studio V2 is listed as a Workspace Manager V2 tile.
- Asteroids enables the Object Vector Studio V2 tile after repo/game selection.
- Workspace Manager V2 launches Object Vector Studio V2 with `launch=workspace`, `fromTool=workspace-manager-v2`, and `hostContextId`.
- Asteroids manifest/session exposes ship, asteroid, and UFO object vector assets.
- Object Vector Studio V2 loads palette data from `workspace.tools.palette-manager-v2.data`, not the object schema payload.
- Object Vector Studio V2 object JSON does not include `palette`.

## Coverage Report

Runtime JavaScript changed, so `docs_build/dev/reports/playwright_v8_coverage.txt` was refreshed from the Workspace Manager V2 Playwright run.

## Known Issue

All games fullscreen currently fullscreen the page but not the game canvas. This PR documents the issue only and does not change fullscreen game behavior.

Recommended follow-up PR:

```text
PR_26132_FOLLOWUP-fullscreen-canvas-behavior
- Audit shared game fullscreen behavior.
- Ensure each game fullscreen action expands the canvas/render surface, not only the page shell.
- Add targeted Playwright coverage for canvas dimensions before/after fullscreen.
```

## Full Samples Smoke Test

Skipped. This PR is limited to Workspace Manager V2 Object Vector Studio V2 launch wiring, Asteroids object-vector payload data, and targeted Workspace Manager V2 Playwright coverage.

## Out Of Scope

- World Vector Studio V2 changes.
- Deprecated Primitive Skin Editor or Vector Map Editor deletion/rename.
- Fullscreen canvas behavior fix.
- Full samples smoke test.

## Commit Comment

```text
PR_26132_010 wires Object Vector Studio V2 into Workspace Manager V2, adds strict Asteroids object vector assets for ship/asteroids/UFOs without embedded palette data, validates workspace launch/session palette sourcing, and documents the fullscreen canvas follow-up.
```
