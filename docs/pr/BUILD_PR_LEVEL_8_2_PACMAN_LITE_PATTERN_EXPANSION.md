Toolbox Aid
David Quesenberry
03/29/2026
BUILD_PR_LEVEL_8_2_PACMAN_LITE_PATTERN_EXPANSION.md

# BUILD_PR - Level 8.2 Pacman Lite Pattern Expansion

## Source of Truth
- `docs/pr/PLAN_PR_LEVEL_8_2_THIRD_GAME_PATTERN_EXPANSION.md`

## Scope Confirmation
- Sample-based game implementation
- No `engine/` changes
- Reuse shared Level 7 world systems + Level 8 integration pattern without duplication

## Full Repo-Relative Paths (Touched for This BUILD)
- `samples/sample156-pacman-lite-world-systems/PacmanLiteWorldSystemsScene.js`
- `samples/sample156-pacman-lite-world-systems/main.js`
- `samples/sample156-pacman-lite-world-systems/index.js`
- `samples/sample156-pacman-lite-world-systems/index.html`
- `docs/pr/PLAN_PR_LEVEL_8_2_THIRD_GAME_PATTERN_EXPANSION.md`
- `docs/pr/BUILD_PR_LEVEL_8_2_PACMAN_LITE_PATTERN_EXPANSION.md`
- `docs/dev/CODEX_COMMANDS.md`
- `docs/dev/COMMIT_COMMENT.txt`
- `docs/dev/NEXT_COMMAND.txt`
- `docs/dev/README.md`

## Reuse Mapping
- Spawn System: pellet/power population by round.
- Lifecycle System: movement integration, bounds, and inactive cleanup.
- World State System: round phase and completion transitions.
- Events System: frightened window, bonus spawn, tempo escalation.

## Pacman-Specific Local Mechanics
- Maze bounds and wrap behavior.
- Player motion/chase loop.
- Ghost chase/frightened behavior.
- Collection rules (pellet/power/bonus), life loss, and score accounting.

## Config Ownership Rules
- Reused systems remain in shared module (`samples/shared/worldSystems.js`).
- Round/event tuning and Pacman mechanics are local to scene config.
- No game-specific rules moved into engine.

## Acceptance Check
- Uses existing systems stack where appropriate: pass.
- No engine architecture violations: pass.
- No duplicate world-system logic introduced: pass.
- Pacman-specific rules remain local: pass.
- Reuse value is clear and documented: pass.
