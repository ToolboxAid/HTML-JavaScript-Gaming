# BUILD_PR — LEVEL 08.08 REPO-WIDE GAME NORMALIZATION WAVE 1

## Purpose
Start Option A: normalize the remaining non-compliant games repo-wide in small, repeatable waves until
all in-scope games satisfy the Phase 08 boundary contract.

## Why this PR exists
The boundary scan confirmed:
- Compliant: `Asteroids`, `Pacman`, `SpaceInvaders`
- Non-compliant: multiple remaining games with placeholder-only `rules/` and missing
  `flow/{attract.js,intro.js,highscore.js}`

A single giant repo-wide rewrite is too broad for one PR. This PR defines Wave 1 only.

## Wave 1 target set
Normalize these games first:
- `Breakout`
- `Pong`
- `Bouncing-ball`
- `ProjectileLab`
- `Gravity`
- `GravityWell`

## Required structure per target game
games/<GameName>/
  assets/
  config/
  debug/
  entities/
  flow/
    attract.js
    intro.js
    highscore.js
  game/
  levels/
  rules/
    <at least one real .js file>
  systems/
  ui/
  utils/

## Acceptance criteria
For every Wave 1 target game:
1. Required directories exist
2. `rules/` is not placeholder-only
3. `flow/` contains:
   - `attract.js`
   - `intro.js`
   - `highscore.js`
4. No duplicate flow-rule constants between `flow/` and `game/`
5. No unexpected root files except:
   - `index.html`
   - `index.js`
   - `main.js`
   - `.gitkeep`

## Scope
Docs-first implementation request for Wave 1 only.

## Out of scope
- No engine changes
- No launcher/bootstrap standardization
- No repo-wide flow behavior redesign
- Do not touch already compliant games unless required for validation consistency
- Do not move folders or create experimental/legacy segmentation

## Completion rule
Do not mark repo-wide Section 8 items complete in this PR.
This PR only advances Wave 1 toward full repo-wide normalization.
