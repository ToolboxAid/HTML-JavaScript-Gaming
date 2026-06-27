# BUILD PR — Games Breakout Full Folder Migration

## Purpose
Execute the full validated game-folder migration pipeline for `games/Breakout/**` in one testable BUILD, while keeping scope limited to this single game.

## Single PR Purpose
Migrate the Breakout game folder end-to-end using the established template contract and migration workflow:
- create `_next` from template
- migrate gameplay into `_next`
- validate `_next`
- clear canonical destination
- copy `_next` into canonical
- validate canonical
- remove `_next`

## Why This Is Allowed Now
This repo now has:
- an accepted reusable `games/_template`
- enforced template contract rules
- multiple validated migrations proving the workflow

This BUILD bundles the already-proven steps for one game folder only.

## Source / Destination
Canonical source game:
- `games/Breakout/**`

Template source:
- `games/_template/**`

Temporary migration target:
- `games/Breakout_next/**`

Canonical destination after promotion:
- `games/Breakout/**`

## Scope (STRICT)
Perform the following steps in order:

### Step 1 — Create `_next` baseline from template
- create `games/Breakout_next/**` from `games/_template/**`
- keep baseline non-playable only until gameplay migration is wired
- preserve required shell/theme baseline
- ensure canvas is visible during baseline

Required baseline text before gameplay wiring:
- `HTML Says`
- `Template Status`
- `This template intentionally does not boot gameplay.`

### Step 2 — Migrate Breakout gameplay into `_next`
- read gameplay from `games/Breakout/**`
- write gameplay into correct responsibility-based destinations under `games/Breakout_next/**`
- adapt relative paths/imports only as required by the new destination
- wire `games/Breakout_next/index.html` so `_next` boots gameplay
- preserve debug integration if present in source

### Step 3 — Validate `_next`
- open `games/Breakout_next/index.html`
- confirm gameplay starts
- confirm canvas visible
- confirm no console errors
- confirm source `games/Breakout/**` was not modified during `_next` creation/migration

### Step 4 — Clear canonical destination
- delete all contents under `games/Breakout/**`
- leave `games/Breakout/` folder itself present and empty

### Step 5 — Copy `_next` into canonical
- copy all files/folders from `games/Breakout_next/**` into `games/Breakout/**`
- preserve exact structure
- ensure canonical path boots gameplay correctly

### Step 6 — Validate canonical
- open `games/Breakout/index.html`
- confirm gameplay starts from canonical path
- confirm canvas visible
- confirm no console errors
- confirm structure matches `_next`

### Step 7 — Remove `_next`
- delete `games/Breakout_next/**`
- remove `games/Breakout_next/` folder once empty

## Allowed Destination Areas During Migration
Place migrated files only into the correct corresponding areas under `games/Breakout_next/**`, including as applicable:
- `games/Breakout_next/assets/**`
- `games/Breakout_next/config/**`
- `games/Breakout_next/debug/**`
- `games/Breakout_next/entities/**`
- `games/Breakout_next/flow/**`
- `games/Breakout_next/game/**`
- `games/Breakout_next/levels/**`
- `games/Breakout_next/platform/**`
- `games/Breakout_next/systems/**`
- `games/Breakout_next/ui/**`
- `games/Breakout_next/utils/**`

## Required Mapping Rule
- Put each migrated file into the correct destination by responsibility
- Do NOT dump unrelated files into the wrong folder just to make runtime work
- Preserve reasonable structure parity between the original game and `_next`
- If a source file has no clear destination inside `_next`, STOP rather than guessing

## Explicit Non-Goals
- DO NOT modify any game other than Breakout
- DO NOT refactor engine/shared broadly
- DO NOT redesign `games/_template`
- DO NOT change contract rules in this PR
- DO NOT perform repo-wide cleanup
- DO NOT invent missing files
- DO NOT guess ambiguous destinations
- DO NOT mix in unrelated fixes

## Fail-Fast Conditions
STOP with no changes if any of the following are true:
- a required source file has no clear destination inside `games/Breakout_next/**`
- migration would require broad engine/shared refactor beyond strict path adjustments
- canonical runtime cannot be made to work without structural guessing
- any unrelated game folder must be changed
- required runtime files are missing and would need invented content

## Acceptance Criteria
- `games/Breakout/**` is the canonical running version after copy-back
- `games/Breakout_next/**` is removed at the end
- gameplay runs from canonical path
- canvas is visible
- no console errors
- no unrelated games changed
- no broad engine/shared refactor occurred

## Validation Steps
1. Create and inspect `games/Breakout_next/**`
2. Open `games/Breakout_next/index.html`
3. Confirm:
   - gameplay starts
   - canvas visible
   - no console errors
4. Confirm original `games/Breakout/**` was unchanged before clear step
5. Clear canonical destination
6. Copy `_next` back into canonical
7. Open `games/Breakout/index.html`
8. Confirm:
   - gameplay starts from canonical
   - canvas visible
   - no console errors
9. Remove `_next`
10. Confirm no unrelated game folders changed

## Output Requirement
Codex must package:
`<project folder>/tmp/BUILD_PR_GAMES_BREAKOUT_FULL_FOLDER_MIGRATION_delta.zip`
