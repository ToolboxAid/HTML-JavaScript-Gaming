# PR 11.78 — Engine Utils Reference Closure

## Scope
Rewrote remaining literal references from `src/engine/utils/` and `/src/engine/utils/` to shared-utils equivalents.

## Rewrite Rule Applied
- `src/engine/utils/` -> `src/shared/utils/`
- `/src/engine/utils/` -> `/src/shared/utils/`

## Baseline
- Baseline scan (repo-wide, excluding `.git`, `tmp`, `docs/dev/reports`) found `63` hits.

## Verification
- Runtime/source verification (`src`, `samples`, `games`, `tools`, `tests`): `0` hits for either pattern.
- BUILD verification gate equivalent (with documented exclusions): passed with `0` remaining.
- `FixedTicker.js` import confirms shared invariant path:
  - `src/engine/core/FixedTicker.js` imports `../../shared/utils/invariantUtils.js`.
- No source reference can request `/src/engine/utils/invariant.js`.

## Files Updated
- `docs/archive/pr/legacy-pr-history/BUILD_PR_REPO_CLEANUP_PHASE_1B_ENGINE_BOUNDARY_AND_DUPLICATE_HELPER_SCAN.md`
- `docs/archive/pr/legacy-pr-history/BUILD_PR_REPO_CLEANUP_PHASE_1G_ENGINE_PROMOTION_FROM_STRONG_CANDIDATES.md`
- `docs/archive/pr/legacy-pr-history/BUILD_PR_REPO_CLEANUP_PHASE_1H_ENGINE_CONSOLIDATION_AND_EXPANSION.md`
- `docs/archive/tools/SpriteEditor_old_keep/modules/appCommands.js`
- `docs/archive/tools/SpriteEditor_old_keep/modules/appPopups.js`
- `docs/archive/tools/SpriteEditor_old_keep/modules/appShell.js`
- `docs/archive/tools/SpriteEditor_old_keep/modules/controlSurfaceCommandPalette.js`
- `docs/archive/tools/SpriteEditor_old_keep/modules/controlSurfaceInput.js`
- `docs/archive/tools/SpriteEditor_old_keep/shared/scoreCommandItem.js`
- `docs/pr/BUILD_PR_LEVEL_11_74_UTILS_CONSOLIDATION_INVENTORY.md`
- `docs/pr/BUILD_PR_LEVEL_11_78_ENGINE_UTILS_REFERENCE_CLOSURE.md`
- `docs/pr/BUILD_PR_SHARED_EXTRACTION_28_CLAMP_CORE_BATCH.md`
- `docs/pr/PLAN_PR_LEVEL_11_74_UTILS_CONSOLIDATION_INVENTORY.md`
- `docs/pr/PR_11_75_UTILS_CONSOLIDATION.md`
- `docs/pr/PR_11_76_ENGINE_UTILS_TO_SHARED_UTILS.md`
- `docs/pr/PR_11_77_ENGINE_UTILS_IMPORT_REWIRE.md`
- `tests/validation/samples.shared.boundaries.report.json`
- `docs/dev/reports/BUILD_PR_LEVEL_23_4_SAMPLE_SYSTEM_VALIDATION_AND_FIXES_FIXES_APPLIED.md`
- `docs/dev/reports/PR_11_75_expected_report.md`
- `docs/dev/reports/PR_11_75_utils_consolidation_report.md`
- `docs/dev/reports/PR_11_75_utils_inventory.csv`
- `docs/dev/reports/PR_11_76_ACCEPTANCE_CHECKLIST.md`
- `docs/dev/reports/PR_11_76_ENGINE_UTILS_TO_SHARED_UTILS_report.md`
- `docs/dev/reports/PR_11_78_validation_requirements.md`
- `docs/dev/reports/pr_11_77_engine_utils_search_after.txt`
- `docs/dev/reports/pr_11_77_import_rewire_report.md`
- `docs/dev/reports/utils_consolidation_inventory.csv`
- `docs/dev/reports/utils_consolidation_inventory.md`
- `docs/dev/reports/PR_11_78_ENGINE_UTILS_REFERENCE_CLOSURE_report.md`

## Targeted Validation
- `node --check src/engine/core/FixedTicker.js`
- `node --check src/engine/core/FrameClock.js`
- `node --check src/engine/scene/SceneManager.js`
- `node tests/core/FixedTicker.test.mjs`

All targeted checks passed.
