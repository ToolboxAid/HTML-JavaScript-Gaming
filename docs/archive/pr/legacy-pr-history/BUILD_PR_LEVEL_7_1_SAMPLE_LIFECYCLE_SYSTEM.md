Toolbox Aid
David Quesenberry
03/29/2026
BUILD_PR_LEVEL_7_1_SAMPLE_LIFECYCLE_SYSTEM.md

# BUILD_PR - Level 7.1 Sample Lifecycle System

## Source of Truth
- `docs/pr/PLAN_PR_LEVEL_7_1_WORLD_LIFECYCLE_SYSTEM.md`

## Scope Confirmation
- Sample-only implementation
- No `src/engine/` changes
- Minimal world lifecycle system aligned with existing sample patterns

## Full Repo-Relative Paths (Touched for This BUILD)
- `samples/sample105-spawn-system/SpawnSystemScene.js`
- `docs/pr/PLAN_PR_LEVEL_7_1_WORLD_LIFECYCLE_SYSTEM.md`
- `docs/pr/BUILD_PR_LEVEL_7_1_SAMPLE_LIFECYCLE_SYSTEM.md`
- `docs/dev/CODEX_COMMANDS.md`
- `docs/dev/COMMIT_COMMENT.txt`
- `docs/dev/NEXT_COMMAND.txt`
- `docs/dev/README.md`

## Implementation Summary
- Added local `SampleLifecycleSystem` to the sample scene.
- Lifecycle system responsibilities implemented deterministically:
  - enforce `maxEntities`
  - remove expired entities by `maxLifetime`
  - cleanup out-of-bounds entities using configured bounds
- Scene keeps orchestration role:
  - provides lifecycle config
  - runs spawn system then lifecycle cleanup in update loop

## Architecture Notes
- No rendering/input logic inside lifecycle system.
- No engine dependencies added or modified.
- Existing sample pattern preserved (local system classes inside scene file).

## Acceptance Check
- Sample-only delta: pass.
- Engine untouched: pass.
- Deterministic lifecycle cleanup: pass.
- Architecture constraints respected: pass.
