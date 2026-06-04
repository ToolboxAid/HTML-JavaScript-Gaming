# BUILD_PR_TOOLS_SHARED_EXTRACTION_PHASE_1

## PR Purpose
Conservative exact-cluster helper normalization for active tools, limited to shared helper reuse and import normalization.

## Scope
- Active tools only (shared helper surface consumed by active tools).
- Reuse existing `src/shared/toolbox/*` modules first.
- Target only:
  - project system helper normalization
  - runtime asset loader helper normalization
  - runtime asset validation helper normalization
  - safe vector helper normalization already represented in `src/shared/toolbox/vector/*`
- No style/theme work.
- No editor-state extraction.
- No render-pipeline rewrites.
- No tool-host work.
- Preserve `archive/v1-v2/docs_build/archive/tools/SpriteEditor_old_keep`.
- Keep changed-file count minimal.
- Stop and report if helper semantics diverge too much.

## Exact Target Files
- `src/shared/toolbox/projectManifestContract.js`
- `src/shared/toolbox/runtimeAssetLoader.js`
- `src/shared/toolbox/runtimeAssetValidationUtils.js`
- `src/shared/toolbox/runtimeStreaming.js`
- `src/shared/toolbox/runtimeAssetSharedUtils.js`
- `src/shared/toolbox/vector/vectorAssetBridge.js`
- `src/shared/toolbox/vector/vectorAssetContract.js`
- `src/shared/toolbox/vector/vectorRenderPrep.js`
- `src/shared/toolbox/vector/vectorSafeValueUtils.js`

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
- `archive/v1-v2/docs_build/archive/tools/SpriteEditor_old_keep` would need modification
- scope expands beyond exact target files

## Required Output
- Reports under `docs_build/dev/reports/`
- Repo-structured delta ZIP at exact path:
  - `tmp/BUILD_PR_TOOLS_SHARED_EXTRACTION_PHASE_1_delta.zip`

