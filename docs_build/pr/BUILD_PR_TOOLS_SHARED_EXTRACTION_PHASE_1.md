# BUILD_PR_TOOLS_SHARED_EXTRACTION_PHASE_1

## PR Purpose
Conservative exact-cluster helper normalization for active tools, limited to shared helper reuse and import normalization.

## Scope
- Active tools only (shared helper surface consumed by active tools).
- Reuse existing `toolbox/shared/*` modules first.
- Target only:
  - project system helper normalization
  - runtime asset loader helper normalization
  - runtime asset validation helper normalization
  - safe vector helper normalization already represented in `toolbox/shared/vector/*`
- No style/theme work.
- No editor-state extraction.
- No render-pipeline rewrites.
- No tool-host work.
- Preserve `docs_build/archive/tools/SpriteEditor_old_keep`.
- Keep changed-file count minimal.
- Stop and report if helper semantics diverge too much.

## Exact Target Files
- `toolbox/shared/projectManifestContract.js`
- `toolbox/shared/runtimeAssetLoader.js`
- `toolbox/shared/runtimeAssetValidationUtils.js`
- `toolbox/shared/runtimeStreaming.js`
- `toolbox/shared/runtimeAssetSharedUtils.js`
- `toolbox/shared/vector/vectorAssetBridge.js`
- `toolbox/shared/vector/vectorAssetContract.js`
- `toolbox/shared/vector/vectorRenderPrep.js`
- `toolbox/shared/vector/vectorSafeValueUtils.js`

## Validation
- Run:
  - `npm run test:launch-smoke -- --tools`
- Report:
  - exact files changed
  - extracted vs normalized helpers
  - helpers intentionally left local and why

## Failure Conditions
Stop and report if:
- helper semantics differ enough to risk behavior change
- extraction requires editor-state or render-pipeline refactor
- `docs_build/archive/tools/SpriteEditor_old_keep` would need modification
- scope expands beyond exact target files

## Required Output
- Reports under `docs_build/dev/reports/`
- Repo-structured delta ZIP at exact path:
  - `tmp/BUILD_PR_TOOLS_SHARED_EXTRACTION_PHASE_1_delta.zip`

