Toolbox Aid
David Quesenberry
03/25/2026
PLAN_PR_SPACE_DUEL.md

# PLAN_PR — Space Duel

## Goal
Build Space Duel as close to the original arcade as possible while staying aligned with repo engine rules and game-layer boundaries.

## Scope
- Arcade-accurate movement feel
- 1-player and 2-player support as appropriate to the original game
- Vector-style presentation adapted to the current engine/rendering approach
- Enemy/object patterns and stage flow aligned closely to arcade behavior
- Score, lives, progression, and game-over flow aligned closely to arcade behavior
- Generate placeholder WAV files for all needed sound effects during build
- Keep main scene lean by extracting game-local controllers where needed

## Research Assumption
- Target game: Space Duel (Atari, 1982), interpreted from “Space Dual”

## Engine Classes Used
- CanvasRenderer — rendering entry point only
- InputService — base input handling
- ActionInputService — action-mapped gameplay input
- Scene contract — constructor / init(engine) / update(dt, engine) / render(renderer, engine) / dispose(engine)
- SpriteAtlas — if game assets use atlas lookup
- ImageLoader — if raster assets are used alongside vector-style presentation
- Camera2D / CameraSystem — only if current implementation needs them
- World and engine systems — only where already consumed through public contracts
- baseLayout.css or shared engine UI layout assets — if game shell uses them

## Engine Boundary Rules
- Reuse existing engine contracts where available
- Do not duplicate engine behavior locally
- Do not add Space Duel-specific logic to engine unless reused beyond this game
- Only include engine source files in deltas if this game actually modifies them
- Keep Space Duel rules, tuning, stage flow, and sound triggers in the game layer

## Gameplay Planning Areas
- Ship movement, thrust, rotation, and firing feel
- Original mode and player-mode behavior
- Object/enemy wave composition
- Hazard behavior and collision fairness
- Score and life rules
- Stage reset and progression flow
- Start/select/game-over presentation
- Timing polish for arcade feel

## Sound Plan
- Generate placeholder WAV files during build for:
  - fire
  - thrust
  - explosion
  - player death
  - enemy/hazard events
  - bonus/score events
  - start/game-over cues
- Placeholder WAV files should be simple, valid, loadable, and easy to replace later
- User will replace final WAV assets after build

## Suggested Game-Local Controllers
- PlayerController / PlayerManager
- WaveController
- ScoreManager
- SoundController
- HudState or HudRenderer

## Risks
- Main scene getting too large if controllers are not extracted
- Over-generalizing Space Duel logic into engine too early
- Spending too much time on polish before core behavior matches the original

## Output Requirements
- Delta ZIP
- Match repo structure exactly
- Include docs/dev updates if changed
- Include CODEX_COMMANDS.md

## Commit Comment
Plan Space Duel with arcade-accurate scope, engine usage boundaries, and placeholder WAV generation

## Codex Command
MODEL: GPT-5.4-codex
REASONING: medium
COMMAND: PLAN_PR_SPACE_DUEL
