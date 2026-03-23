Toolbox Aid
David Quesenberry
03/23/2026
TASKS.md

# TASKS - Engine Boundary Cleanup Audit

## Audit Completion (This PR)
- [x] Inspect all major folders under `engine/`
- [x] Classify each major engine area with ownership buckets
- [x] Record renderer boundary leaks
- [x] Record all `ctx` usage outside renderer implementation
- [x] Record browser-global coupling in core/runtime-related modules
- [x] Record static/global shared-state debt
- [x] Record gameplay-policy leakage in `engine/`
- [x] Audit `tests/engine/` scope and identify blockers
- [x] Write full findings into `PLAN.md`
- [x] Propose smallest safe follow-up `BUILD_PR`
- [x] Keep this PR as docs-only (no runtime source edits)

## Verified Blockers
- [x] `tests/engine/` directory is missing (required scope path unavailable)
- [x] Test runner uses manual registration (`tests/run-tests.mjs`) with no discovery
- [x] Multiple engine areas have no direct test import coverage in current test tree

## Follow-Up BUILD_PR Work Queue
`BUILD_PR: PR-ENGINE-BOUNDARY-CLEANUP-STEP1-ADAPTER-SEAMS`
- [ ] Add renderer alpha seam and remove scene-level direct `ctx` dependency
- [ ] Add scheduler/time injection seam in `engine/core/Engine.js`
- [ ] Guard browser globals in `Theme` + `StorageService` using adapter-friendly defaults
- [ ] Create `tests/engine/` and add boundary-focused tests for the new seams
- [ ] Wire `tests/engine/` tests into `tests/run-tests.mjs`

## Guardrails For Follow-Up
- [ ] No gameplay behavior/tuning changes
- [ ] No prefab policy redesign in STEP1
- [ ] No release packaging ownership rewrite in STEP1
