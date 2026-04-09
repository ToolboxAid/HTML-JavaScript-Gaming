# BUILD PR — Games Template Engine Theme Bootstrap Alignment

## Purpose
Add the minimum shared engine/theme bootstrap required so `games/_template` presents the same consistent shell/theme view standard as canonical games after copy.

## Problem Statement
`games/_template` is structurally correct, but its current `index.html` is too isolated and does not establish the standard engine/theme view baseline.

This PR is ONLY to align the template shell with the existing canonical view/bootstrap pattern.

## Source Of Truth
Use `games/Asteroids/index.html` as the visual/bootstrap reference.

Only copy/adapt the minimum non-game-specific bootstrap needed to reproduce the standard shell/theme setup.

## Scope (STRICT)
- Update `games/_template/index.html`
- Add ONLY the minimal non-game-specific files directly required by that shell/theme bootstrap
- Reuse existing shared/engine/theme bootstrap already proven by canonical game wiring
- Keep `_template` non-playable and game-neutral

## Target Files (EXACT)
Primary edit:
- `games/_template/index.html`

Secondary allowed additions:
- only existing shared/bootstrap/theme files that are directly required by the new `_template/index.html`
- only under paths already used by canonical game bootstrap
- no new architecture files
- no new engine subsystems

## Required Behavior
`games/_template/index.html` MUST:
- render a visible canvas
- present the consistent engine/theme view baseline used by the canonical game shell
- draw or display this required template message in the shell view:

  Game Template
  Replace this entrypoint with your game-specific shell.

- remain non-playable
- not auto-boot gameplay
- not load Asteroids-specific entities, rules, levels, assets, or game flow

## Allowed Operations
- inspect `games/Asteroids/index.html` and its direct non-game-specific shell/bootstrap dependencies
- reuse/copy minimal shell/bootstrap/theme dependencies needed for consistent view
- update `_template/index.html` to use those dependencies
- keep placeholders and `.gitkeep` skeleton structure intact

## Explicit Non-Goals
- DO NOT modify `games/Asteroids`
- DO NOT copy Asteroids gameplay code
- DO NOT copy Asteroids assets
- DO NOT copy Asteroids flow/level/entity/rules implementation
- DO NOT refactor engine/shared broadly
- DO NOT introduce a new theming system
- DO NOT make `_template` runnable as a game

## Fail-Fast Conditions
STOP with no changes if any of the following are true:
- the required consistent shell/theme view cannot be obtained without copying game-specific Asteroids code
- the bootstrap dependency chain expands beyond direct shell/theme setup into gameplay/runtime systems
- more than one ambiguous bootstrap path exists and no single canonical path is already proven by `games/Asteroids/index.html`
- achieving the consistent shell requires repo-wide cleanup or restructuring

## Acceptance Criteria
- `games/_template/index.html` shows the standard consistent shell/theme view baseline
- template message is visible:
  - `Game Template`
  - `Replace this entrypoint with your game-specific shell.`
- canvas is visible
- no Asteroids gameplay boots
- no Asteroids-specific assets or game logic are present in `_template`
- changes remain minimal and limited to shell/bootstrap alignment

## Validation Steps
1. Open `games/Asteroids/index.html` and note the canonical shell/theme baseline
2. Open `games/_template/index.html`
3. Confirm:
   - canvas visible
   - consistent shell/theme view is present
   - required template message is visible
   - no gameplay starts
   - no console errors
4. Confirm only minimal bootstrap/theme files were added, if any

## Output Requirement
Codex must package:
`<project folder>/tmp/BUILD_PR_GAMES_TEMPLATE_ENGINE_THEME_BOOTSTRAP_ALIGNMENT_delta.zip`
