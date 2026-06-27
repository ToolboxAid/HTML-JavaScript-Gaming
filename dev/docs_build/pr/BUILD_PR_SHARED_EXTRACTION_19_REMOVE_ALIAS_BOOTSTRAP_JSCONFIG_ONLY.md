# BUILD_PR_SHARED_EXTRACTION_19_REMOVE_ALIAS_BOOTSTRAP_JSCONFIG_ONLY

## Purpose
Remove the temporary alias bootstrap config now that shared imports have been standardized back to approved relative paths.

## Single PR Purpose
Delete the temporary alias bootstrap file only if it is still the minimal alias-only bootstrap introduced for the abandoned `@shared/*` proof point.

This BUILD does **not** change any source file.

## Exact Files Allowed
Edit only this file:

1. `jsconfig.json`

Do not edit any other file.

## Fail-Fast Gate
Before making changes, confirm all of the following:

1. `jsconfig.json` exists
2. its content is exactly:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["src/shared/*"]
    }
  }
}
```
3. the current normalized slices no longer use `@shared/` imports:
   - `src/advanced/promotion/createPromotionGate.js`
   - `src/advanced/state/createWorldGameStateSystem.js`
   - `games/network_sample_c/game/ReconciliationLayerAdapter.js`
   - `games/network_sample_c/game/StateTimelineBuffer.js`

If any condition is false:
- stop
- report blocker
- make no changes
- do not create a delta ZIP

## Exact Change
Delete:

- `jsconfig.json`

That is the only allowed repo change in this PR.

## Hard Constraints
- do not edit any source file
- do not edit guard script
- do not edit package.json
- do not edit start_of_day files
- do not touch engine files
- do not touch sample files
- do not perform repo-wide cleanup
- keep one PR purpose only

## Validation Checklist
1. Confirm only `jsconfig.json` changed
2. Confirm `jsconfig.json` was deleted
3. Confirm no `@shared/` imports remain in:
   - `src/advanced/promotion/createPromotionGate.js`
   - `src/advanced/state/createWorldGameStateSystem.js`
   - `games/network_sample_c/game/ReconciliationLayerAdapter.js`
   - `games/network_sample_c/game/StateTimelineBuffer.js`
4. Confirm no source/runtime logic changed

## Non-Goals
- no source edits
- no guard changes
- no repo-wide alias cleanup
- no import normalization beyond the already-completed slices
