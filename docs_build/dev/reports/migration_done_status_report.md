# PR_26154_048-050 Migration Done Status

## Status
- Active toolbox registry cleanup: DONE.
- Archive policy alignment for `SpriteEditor_old_keep`: DONE.
- Active legacy alias removal for `old_games` and `old_samples`: DONE.
- Retired root path checks: DONE.

## Active Structure Confirmed
- Active toolbox tools live under `toolbox/[toolname]/index.html`.
- Active toolbox index behavior lives in `toolbox/tools-page-accordions.js`.
- Active toolbox registry entries point only to live toolbox folders.
- Archived V1/V2 reference material lives under `archive/v1-v2/`.
- `archive/v1-v2/games/` and `archive/v1-v2/samples/` remain deprecated references and were not tested.

## Not Run
- Full samples smoke test: SKIP, deprecated archive samples/games are out of scope.
- Archive runtime tests: SKIP, archive material is reference-only.

## Validation Summary
- PASS: `node scripts/validate-tool-registry.mjs`
- PASS: `npm run test:workspace-v2` with 2 Playwright tests passing.
- PASS: `git diff --check` with line-ending warnings only.
- PASS: `node --check` for changed active JS/MJS files.
- PASS: JSON parse for changed active JSON files.

## Remaining Cleanup Candidates
- Historical generated duplicate-method outputs still mention retired `tools/` names.
- Old historical reports under `docs_build/reports/` still describe earlier archive paths.
- These were left intact because they are historical evidence, not active app/runtime expectations.
