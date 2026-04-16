# BUILD_PR_LEVEL_17_40_SAMPLE_1710_REAL_GAMEPLAY_POLISH

## Purpose
Polish Sample `1708` into a complete mini-game experience using existing systems only.

## Source of Truth
- `docs/pr/PLAN_PR_LEVEL_17_40_SAMPLE_1710_REAL_GAMEPLAY_POLISH.md`
- existing sample implementation in `samples/phase-17/1708/`

## Exact Build Target
1. Polish `samples/phase-17/1708/RealGameplayMiniGameScene.js` with:
   - stronger visual feedback for player events (hit/collect/match state)
   - complete state flow (`ready` -> `running` -> `won|lost`)
   - restart path and clear instructions
   - improved HUD/readability while preserving existing controls
2. Keep standard 3D debug camera/collision panel integration working.
3. Update targeted runtime validation to verify the full loop and debug-panel output.

## Constraints
- use existing engine systems only
- no engine-core changes
- keep scope to sample `1708` polish and targeted validation only

## Validation
- polished sample state flow is testable end-to-end
- debug panels still emit visible lines
- no runtime errors in targeted test execution

## Packaging Rule
Package only this PR's created/modified files into:
`tmp/BUILD_PR_LEVEL_17_40_SAMPLE_1710_REAL_GAMEPLAY_POLISH.zip`
