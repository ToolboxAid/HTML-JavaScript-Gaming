# PR_26127_007-schema-alignment-preview-role-and-workspace-filtering

## Scope
- Reviewed `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- Reviewed attached schema bundle `tools/schemas.zip` entries for `schemas/workspace.manifest.schema.json` and `schemas/tools/asset-manager-v2.schema.json` without extracting or modifying the ZIP.
- Kept scope limited to Workspace Manager V2, Asset Manager V2, Preview Generator V2 launch hydration, manifests, schema, and dedicated Playwright coverage.
- Did not modify deprecated `tools/workspace-v2`.
- Did not modify sample JSON.

## Schema Alignment Notes
- `tools/schemas/workspace.manifest.schema.json` already required only `palette-manager-v2` and `asset-manager-v2`; that SSoT requirement remains unchanged.
- Removed `previewImagePath` from the Asset Manager V2 payload schema and from Asteroids manifest data.
- Changed image role naming to `preview`; removed `bezel` and `preview-image` from active Asset Manager V2 image roles.
- Moved stretch override allowance from `assets.image.bezel.*` to `assets.image.preview.*`.
- Updated Asteroids preview/bezel manifest data to a single `assets.image.preview.bezel` entry with role `preview` and `stretchOverride`.

## Workspace Launch Notes
- Preview Generator V2 now derives the preview target from Asset Manager V2 image assets with role `preview`.
- Workspace-launched Preview Generator V2 shows only Games as the visible Target Source; Samples and Tools are hidden and disabled.
- Workspace Manager V2 moves the template tile to Viewers and displays it as `Tool Starter V2`.
- UAT seeding now loads `games/_template/workspace-manager-v2-UAT.manifest.json` as a `_template` game context with `games/_template/` and `games/_template/assets`.
- The active game selector displays the explicit `Template UAT` context while UAT is active.
- No Asteroids-specific fallback was added for UAT.

## Validation
- `node --check` passed for changed runtime JS files and changed Playwright specs.
- JSON parse validation passed for changed schema/manifest JSON files.
- Workspace manifest service validation passed for:
  - `games/Asteroids/game.manifest.json`
  - `games/_template/workspace-manager-v2-UAT.manifest.json`
- `npm run test:workspace-v2` passed: 24 passed.
- Full samples smoke test skipped because this PR is Workspace V2/tool UAT scoped and sample JSON is out of scope.

## Manual Validation Notes
- Launch Workspace Manager V2, load Asteroids, confirm the exported manifest has no `previewImagePath` and includes `assets.image.preview.bezel`.
- Launch Asset Manager V2 from Workspace Manager V2 and confirm image roles are `sprite`, `background`, `preview`, and `ui`.
- Pick image files containing `preview` or `bezel` and confirm role/id use `preview`.
- Launch Preview Generator V2 from Workspace Manager V2 and confirm only Games is visible under Target Source.
- Open Workspace Manager V2 with `?workspace=uat`, seed UAT, and confirm the context uses `games/_template/`.
