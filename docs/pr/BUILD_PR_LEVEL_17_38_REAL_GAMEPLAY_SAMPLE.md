# BUILD_PR_LEVEL_17_38_REAL_GAMEPLAY_SAMPLE

## Purpose
Build one real, playable Level 17 mini-game sample using existing engine systems only.

## Source of Truth
- `docs/pr/PLAN_PR_LEVEL_17_38_REAL_GAMEPLAY_SAMPLE.md`
- `docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md` (`## 17. 3D Activation, Validation, and Execution (Phase 16)`)

## Exact Build Target
1. Add new sample `samples/phase-17/1708/` with:
   - `index.html`
   - `main.js`
   - one scene file implementing a complete mini-game loop
2. Integrate sample `1708` into `samples/index.html`.
3. Implement gameplay using existing engine systems only:
   - rendering, input, scene/camera, and existing debug providers/panels
   - player movement in bounded 3D space
   - obstacle/enemy interaction
   - objective/score and end-state messaging
   - camera follow readability
4. Add targeted runtime validation for sample `1708` behavior and launcher link.

## Non-Goals
- no engine-core feature additions
- no new generic debug framework features
- no additional Level 17 samples beyond `1708`
- no roadmap status updates

## Validation
- sample `1708` link exists in `samples/index.html`
- sample scene updates/render path execute without runtime errors in targeted test
- gameplay loop is verifiably complete (movement + interaction + objective/end-state)
- debug panel/provider integration emits visible panel lines

## Packaging Rule
Package only this PR's created/modified files into:
`tmp/BUILD_PR_LEVEL_17_38_REAL_GAMEPLAY_SAMPLE.zip`
