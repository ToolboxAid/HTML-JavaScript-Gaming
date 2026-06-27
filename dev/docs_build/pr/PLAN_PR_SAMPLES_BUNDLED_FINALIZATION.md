# PLAN_PR_SAMPLES_BUNDLED_FINALIZATION

## Objective
Bundle the remaining samples PRs into the fewest rule-safe BUILD/APPLY waves while preserving one-purpose-per-PR, testability, canonical paths, and Windows-safe zero-dependency execution.

## Scope
Docs-only planning.
No implementation code changes.
No gameplay scope.
No engine-core scope.
No start_of_day directory changes.

## Remaining 7 Sample Objectives
1. Preview assets and thumbnails
2. Metadata validation hardening
3. Index performance pass
4. Tag standardization
5. Navigation polish
6. Hover preview
7. Favorites/pinning

## Bundling Decision
Minimum safe wave count: **3 BUILD/APPLY waves**.

Why not 1 wave:
- mixes incompatible concerns and violates one-purpose intent.

Why not 2 waves:
- still forces data-quality and performance/personalization concerns into the same BUILD.

Why 3 waves works:
- each wave keeps a singular execution purpose,
- each wave has a clear test surface,
- each wave can fail fast cleanly.

## Wave Plan
### Wave 1
BUILD: `BUILD_PR_SAMPLES_BROWSE_VISUALS_AND_NAVIGATION`
APPLY: `APPLY_PR_SAMPLES_BROWSE_VISUALS_AND_NAVIGATION`

Purpose:
- browse-time UX enhancements.

Includes:
- preview assets and thumbnails
- hover preview
- navigation polish

Testability gates:
- index/detail render previews with deterministic fallback
- next/previous/related navigation links resolve
- representative links still load (first sample, last sample, 1316-1318)
- no console errors on tested pages

### Wave 2
BUILD: `BUILD_PR_SAMPLES_DISCOVERY_DATA_AND_FINDABILITY`
APPLY: `APPLY_PR_SAMPLES_DISCOVERY_DATA_AND_FINDABILITY`

Purpose:
- discovery data correctness.

Includes:
- metadata validation hardening
- tag standardization

Testability gates:
- malformed metadata fails fast
- duplicates/mismatch conditions fail fast
- filter/search consistency improves with standardized tags
- canonical paths unchanged

### Wave 3
BUILD: `BUILD_PR_SAMPLES_INDEX_PERFORMANCE_AND_PERSONALIZATION`
APPLY: `APPLY_PR_SAMPLES_INDEX_PERFORMANCE_AND_PERSONALIZATION`

Purpose:
- index responsiveness and optional user personalization.

Includes:
- index performance pass
- favorites/pinning

Testability gates:
- filter/search interactions remain responsive
- favorites persist locally without external dependencies
- no path contract changes
- no gameplay or engine-core changes

## Compatibility Guardrails
Do not combine in one BUILD:
- discovery-data hardening with personalization features
- performance optimizations with metadata schema policy changes
- preview asset wiring with broad non-sample refactors

## Execution Order
1. BUILD_PR_SAMPLES_BROWSE_VISUALS_AND_NAVIGATION
2. APPLY_PR_SAMPLES_BROWSE_VISUALS_AND_NAVIGATION
3. BUILD_PR_SAMPLES_DISCOVERY_DATA_AND_FINDABILITY
4. APPLY_PR_SAMPLES_DISCOVERY_DATA_AND_FINDABILITY
5. BUILD_PR_SAMPLES_INDEX_PERFORMANCE_AND_PERSONALIZATION
6. APPLY_PR_SAMPLES_INDEX_PERFORMANCE_AND_PERSONALIZATION

## Windows-Safe Assumptions
- zero dependency execution only
- no npm install / no node_modules requirements
- Node.js/vanilla JS-first scripts
- deterministic local validation scripts

## Canonical Path Contract
Must remain unchanged:
- `samples/phaseXX/XXYY/index.html`

## Acceptance Criteria
- all 7 remaining sample objectives are covered
- bundling is minimized to the fewest safe waves
- no incompatible purpose mixing per BUILD
- each future BUILD remains testable
- canonical path contract is preserved
- Windows-safe zero-dependency assumptions are preserved
