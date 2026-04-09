# BUILD PR — Games PacmanLite Next Template Baseline

## Purpose
Create a safe, non-destructive template-aligned baseline alongside the existing PacmanLite game.

## Why This Shape
We want less back-and-forth, but we still need one clear PR purpose.
This BUILD bundles all baseline setup work needed for the next migration lane while keeping the current playable game intact.

## Single PR Purpose
Establish `games/PacmanLite_next/**` as the accepted template-based migration baseline.

## Scope (STRICT)
- Create `games/PacmanLite_next/**`
- Use `games/_template/**` as the source of truth
- Preserve the current `games/PacmanLite/**` implementation unchanged
- Keep `games/PacmanLite_next/**` non-playable in this PR
- Make the new baseline immediately testable in browser

## Source Of Truth
- `games/_template/**`

## Target Paths (EXACT)
Source:
- `games/_template/**`

Destination:
- `games/PacmanLite_next/**`

## Bundled Tasks Included In This BUILD
1. Copy/adapt the accepted template baseline into `games/PacmanLite_next/**`
2. Preserve the minimal reusable folder skeleton
3. Preserve the aligned engine/theme shell baseline
4. Ensure `games/PacmanLite_next/index.html` is browser-openable and testable
5. Ensure the required status text renders on the canvas
6. Ensure no gameplay boots
7. Ensure no current PacmanLite files are modified

## Required Behavior
`games/PacmanLite_next/index.html` MUST:
- show the aligned shell/theme baseline from the accepted template
- render a visible canvas
- render this text on the canvas:

  HTML Says
  Template Status
  This template intentionally does not boot gameplay.

- not boot gameplay
- not load PacmanLite gameplay
- not load Asteroids gameplay
- not depend on copied game-specific assets

## Allowed Operations
- create `games/PacmanLite_next/**`
- copy/adapt files from `games/_template/**`
- keep `.gitkeep` placeholders
- adjust only what is required so the copied baseline works correctly at the new destination path

## Explicit Non-Goals
- DO NOT modify `games/PacmanLite/**`
- DO NOT migrate gameplay in this PR
- DO NOT perform canonical replacement in this PR
- DO NOT refactor engine/shared code
- DO NOT change other games
- DO NOT add PacmanLite assets, ghosts, maps, scoring, audio, or rules
- DO NOT expand `_next` beyond the accepted template baseline

## Fail-Fast Conditions
STOP with no changes if any of the following are true:
- creating `games/PacmanLite_next/**` would require modifying `games/PacmanLite/**`
- the baseline cannot work at the new destination without gameplay code
- any path outside `games/PacmanLite_next/**` must be changed, other than reading `games/_template/**`
- more than baseline/template alignment is required

## Acceptance Criteria
- `games/PacmanLite_next/**` exists
- it matches the accepted template baseline structure
- canvas is visible
- required status text renders on the canvas
- no gameplay boots
- no console errors
- `games/PacmanLite/**` remains unchanged

## Validation Steps
1. Open `games/PacmanLite_next/index.html`
2. Confirm:
   - canvas is visible
   - shell/theme baseline is present
   - the three required lines render on the canvas
   - no gameplay starts
   - no console errors
3. Confirm `games/PacmanLite/**` was not modified

## Output Requirement
Codex must package:
`<project folder>/tmp/BUILD_PR_GAMES_PACMANLITE_NEXT_TEMPLATE_BASELINE_delta.zip`
