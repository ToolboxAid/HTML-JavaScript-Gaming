# PLAN_PR: REPO_CLEANUP_PHASE_1_DEAD_CODE_AND_DUPLICATE_SCAN

## Scope
Phase 1 planning for safe cleanup with emphasis on dead code, duplicate code, structure drift, import-path inconsistencies, and engine-boundary review.

## Phase 1A execution included here
- Fix case-sensitive test imports that fail on Linux/macOS.
- Remove one dead re-export file whose engine equivalent is already the canonical implementation.

## Why these changes are safe
- Test import path fixes do not change runtime game behavior.
- `samples/sample028-asset-registry/assetRegistry.js` was only a pass-through re-export of `AssetRegistry` from `engine/assets/index.js` and was not used by the sample.

## Engine-boundary note
- The removed file is a good example of code that should not remain local when the engine already provides the canonical implementation.
