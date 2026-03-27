Toolbox Aid
David Quesenberry
03/27/2026
PLAN_PR_DEFENDER_LITE.md

# PLAN_PR - Defender (Lite)

## Goal
Build Defender (Lite) as the Level 7 world-systems game, staying as close to the original arcade feel as practical while prioritizing scrolling-world stability, deterministic simulation, and clean game-layer boundaries.

## Scope
- side-scrolling wraparound world with stable camera/world traversal
- player ship thrust, reversal, lift, descent, and firing feel aligned closely to classic Defender
- humanoid population placement and simple rescue/failure loop
- lander-led enemy pressure with a reduced but recognizable Defender-style threat mix
- score, lives, wave progression, and game-over loop
- radar/minimap style world awareness if needed for readable play
- keep main scene lean by extracting game-local controllers early

## Level 7 Focus
- prove larger scrolling-space handling before chasing full Defender feature parity
- preserve deterministic behavior across a broader playfield than prior arcade games
- validate world traversal, spawn management, and object tracking patterns that later Level 7 and Level 9 games can reuse

## Reuse Targets
- actual-import-only engine usage listing discipline from recent game PRs
- game-local controller extraction pattern used to reduce scene size in Space Duel and Space Invaders
- attract-mode integration via `engine/scenes/AttractModeController.js` only if idle/title/demo flow is included in the initial pass
- game-local high-score persistence pattern informed by Space Duel and Space Invaders only if score saving is included in the initial pass

## Suggested Game-Local Controllers
- DefenderPlayerController
- DefenderWorldController
- DefenderEnemyWaveController
- DefenderHumanoidController
- DefenderScoreManager
- DefenderRadarController
- DefenderSoundController
- DefenderAttractAdapter

## Engine Classes Used
- core / Engine
- render / CanvasRenderer
- input / InputService
- input / ActionInputService
- scenes / Scene
- camera / Camera2D or equivalent public camera contract only if actually imported and used
- persistence / storage service only if high-score persistence is included
- scenes / AttractModeController only if attract mode is included

## Engine Boundary Rules
- reuse existing engine contracts where available
- do not duplicate engine camera, input, or lifecycle behavior locally
- do not add Defender-specific enemy, rescue, radar, or scrolling rules to engine unless reused beyond this game
- only include engine file deltas if this plan later proves a real shared need
- keep Defender tuning, enemy rules, world population behavior, and presentation in the game layer

## Planning Areas
- scrolling world bounds, wrap logic, and camera behavior
- ship acceleration, reversal, and inertia tuning
- humanoid pickup, carry, drop, and loss rules
- lander behavior, spawn pacing, and escalation structure
- projectile cleanup and off-screen entity management across a wide world
- radar readability versus full-world camera constraints
- wave reset, player death, and state restoration flow
- attract mode and high-score persistence as same-pattern follow-ups if not in the first build

## Risks
- over-expanding into full Defender complexity before world traversal feels stable
- scene bloat if world, enemy, and rescue rules stay in one file
- premature engine abstraction for game-specific scrolling logic
- unstable off-screen simulation if entity ownership and cleanup rules are not defined early

## Non-Goals
- no attempt to ship the complete Defender enemy roster in the first pass
- no engine-wide scrolling framework redesign unless multiple games prove the need
- no forced attract-mode or high-score implementation in the core gameplay PR if world systems are the real milestone

## Output Requirements
- Delta ZIP
- Match repo structure exactly
- Include docs/dev updates if changed
- Include CODEX_COMMANDS.md
- Include COMMIT_COMMENT.txt

## Commit Comment
Plan Defender Lite with Level 7 world-systems scope and controlled arcade reuse

## Codex Command
MODEL: GPT-5.4-codex
REASONING: medium
COMMAND: PLAN_PR_DEFENDER_LITE
