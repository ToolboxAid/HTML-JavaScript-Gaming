Toolbox Aid
David Quesenberry
03/23/2026
TASKS.md

# TASKS - Gravity Well Validation Phase 1

- [x] Audit `games/GravityWell/main.js` boot composition and identify missing proof points.
- [x] Audit `games/GravityWell/game/GravityWellScene.js` for scene-flow and lifecycle validation targets.
- [x] Audit `games/GravityWell/game/GravityWellWorld.js` for thrust, gravity, pickup, loss, determinism, and timing-risk targets.
- [x] Audit `tests/games/GravityWell.test.mjs` for current validation coverage and blocker gaps.
- [x] Classify boot correctness as `REVIEW_REQUIRED` because runtime safeguards exist but no focused boot tests do.
- [x] Classify thrust-plus-gravity interaction as `REVIEW_REQUIRED` because only gravity-alone behavior is currently tested.
- [x] Classify win-zone detection as `REVIEW_REQUIRED` because overlap happy paths are covered but boundary and ordering cases are not.
- [x] Classify deterministic repeatability as `NEEDS_PROOF` because the code is deterministic by inspection but lacks replay validation.
- [x] Classify timing-condition stability as `HIGH_RISK_REVIEW_REQUIRED` because world integration is single-step and unproven under coarse dt.
- [x] Propose a small BUILD_PR ladder:
- [x] `BUILD_PR 1` boot and scene validation
- [x] `BUILD_PR 2` world mechanics validation
- [x] `BUILD_PR 3` determinism and timing stress
- [x] `BUILD_PR 4` minimal hardening only if earlier validation fails
- [x] Keep this PR docs-only with no runtime source edits.
