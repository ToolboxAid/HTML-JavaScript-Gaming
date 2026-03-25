Toolbox Aid
David Quesenberry
03/25/2026
PLAN_PR_AI_TARGET_DUMMY.md

# PLAN_PR - AI Target Dummy

## Goal
Build a reusable AI target-dummy sample that validates enemy sensing, pursuit, attack cadence, and disengage behavior without introducing game-specific rules into engine.

## Scope
- implement a focused `/samples` scene for AI target-dummy behavior
- validate core AI loop:
  - detect target in range
  - move toward target
  - attack on cooldown when in range
  - disengage/idle when target exits range
- include visual debug readouts for state, timers, and distances
- keep logic deterministic and testable
- keep scene lean by extracting sample-local controllers if needed

## Placement
- this is a sample-track build, not a `/games` title
- target location:
  - `/samples/sample190-ai-target-dummy/`

## Reuse Targets
- existing engine scene contract
- existing input and render services
- existing debug overlay/sample drawing patterns
- existing AI behavior test pattern in `tests/ai/AIBehaviors.test.mjs`

## Suggested Files
- `/samples/sample190-ai-target-dummy/index.html`
- `/samples/sample190-ai-target-dummy/main.js`
- `/samples/sample190-ai-target-dummy/AITargetDummyScene.js`
- `/samples/sample190-ai-target-dummy/AITargetDummyModel.js`
- `/tests/samples/AITargetDummyScene.test.mjs`
- `/tests/samples/AITargetDummyModel.test.mjs`
- `/samples/index.html` (enable sample link)

## Engine Classes Used
- core / Engine
- render / CanvasRenderer
- input / InputService
- scenes / Scene
- theme / Theme
- input / GamepadInputAdapter (only if actually imported and used)

## Engine Boundary Rules
- do not add sample-specific AI state labels or dummy rules to engine
- do not add game-specific behavior to engine AI utilities unless reused broadly
- keep target-dummy tuning and state machine in sample-local files
- only include engine source files if this PR truly needs engine changes

## Planning Areas
- state machine shape (`idle`, `chase`, `attack`, `cooldown`, `recover`)
- sensing radius and hysteresis to reduce jitter
- attack interval/cooldown timing behavior
- deterministic update order and frame-step handling
- readable debug panel and on-screen state cues

## Risks
- over-engineering AI framework for a single sample
- jittery transitions at distance threshold boundaries
- scene bloat from mixing model/sim/render/input logic

## Output Requirements
- Delta ZIP
- Match repo structure exactly
- Include docs/dev updates if changed
- Include CODEX_COMMANDS.md
- Include COMMIT_COMMENT.txt

## Commit Comment
Plan AI Target Dummy sample with deterministic AI state flow and debug validation

## Codex Command
MODEL: GPT-5.4-codex
REASONING: medium
COMMAND: PLAN_PR_AI_TARGET_DUMMY
