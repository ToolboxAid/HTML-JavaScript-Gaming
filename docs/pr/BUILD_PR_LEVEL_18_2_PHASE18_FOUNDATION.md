# BUILD_PR_LEVEL_18_2_PHASE18_FOUNDATION

## Purpose
Create the minimal runnable Phase 18 foundation structure and wiring, with no feature logic.

## Source of Truth
- `docs/pr/PLAN_PR_LEVEL_18_2_PHASE18_FOUNDATION.md`
- `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` (`## 18. Finalize engine`)

## Exact Build Target
1. Add a new Phase 18 sample scaffold directory:
   - `samples/phase-18/1801/`
2. Add minimal entry-point files for the scaffold:
   - `index.html`
   - `main.js`
   - one minimal scene class file
3. Wire Phase 18 into the sample launcher index:
   - add one Phase 18 section and one link for sample `1801`
4. Do not add feature implementation logic.

## Non-Goals
- no engine-core changes
- no gameplay systems
- no roadmap status updates
- no broad refactors

## Validation
- sample `1801` files exist and import cleanly
- `samples/index.html` contains the `phase-18/1801` link
- no additional phase 18 feature samples beyond this scaffold

## Packaging Rule
Package only this PR's created/modified files into:
`tmp/BUILD_PR_LEVEL_18_2_PHASE18_FOUNDATION.zip`
