# PR_26132_009-object-vector-studio-v2-schema-trim

## Purpose

Trim Object Vector Studio V2 saved JSON to durable asset data only and keep palette/startup state out of object exports.

## Scope

- Updated `tools/schemas/tools/object-vector-studio-v2.schema.json` per the repo schema location rule.
- Root object payload now allows only `version`, `toolId`, `name`, and `objects`.
- Removed root `palette`, `selection`, `viewport`, and `export` from the object schema.
- Removed object/shape metadata drift fields from saved object and shape mutation paths.
- Runtime now loads palette data separately from `paletteSourcePath`, `object-vector-studio-v2.runtimePalette`, or `workspace.tools.palette-manager-v2.data`.
- Import/Copy JSON/Export JSON validate through the trimmed object schema and do not include palette or startup state.
- Missing runtime palette is logged as a visible render-only `FAIL` instead of being accepted as object JSON.

## Validation

Commands run:

```powershell
node --check tools/object-vector-studio-v2/js/ToolStarterApp.js
node --check tools/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js
node -e "JSON.parse(require('fs').readFileSync('tools/schemas/tools/object-vector-studio-v2.schema.json','utf8')); console.log('schema json ok')"
npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "shows Object Vector Studio V2 layout shell"
npm run test:workspace-v2
```

Result:

```text
39 passed
```

## Coverage

Updated `docs/dev/reports/playwright_v8_coverage.txt` from the Workspace Manager V2 Playwright run.

Changed runtime JS coverage includes:

```text
(90%) tools/object-vector-studio-v2/js/ToolStarterApp.js
(92%) tools/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js
```

## Playwright Coverage

The Workspace Manager V2 suite now covers:

- Valid trimmed schema import.
- Palette rejection from object JSON.
- Startup state rejection for `selection`, `viewport`, and `export`.
- Missing session/runtime palette visible render failure.
- Copy/export JSON excluding palette and startup state.

## Full Samples Smoke Test

Skipped. This PR is limited to Object Vector Studio V2 schema/runtime JSON trimming and targeted Workspace Manager V2 Playwright coverage.

## Out Of Scope

- World Vector Studio V2 runtime changes.
- Deprecated SVG Asset Studio, Primitive Skin Editor, or Vector Map Editor changes.
- Workspace Manager schema contract changes.
- Full samples smoke test.
