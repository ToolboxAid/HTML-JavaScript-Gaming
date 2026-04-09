# BUILD PR — Games Space Invaders Gameplay Migration To Next

## Purpose
Migrate Space Invaders gameplay into `games/SpaceInvaders_next/**` while preserving the existing playable game unchanged.

## Why This Is Next
- `games/_template` is accepted
- `games/SpaceInvaders_next/**` baseline now exists
- the next best step is to place gameplay into the correct destination without promotion or cleanup yet

## Single PR Purpose
Move the current Space Invaders gameplay implementation into the already-created `games/SpaceInvaders_next/**` destination and wire it into the accepted template-aligned shell.

## Source / Destination
Source of gameplay:
- `games/SpaceInvaders/**`

Destination for migrated gameplay:
- `games/SpaceInvaders_next/**`

## Scope (STRICT)
- Copy or adapt only the gameplay files needed from `games/SpaceInvaders/**`
- Place them into the correct corresponding destinations under `games/SpaceInvaders_next/**`
- Wire `games/SpaceInvaders_next/index.html` so `_next` runs the migrated gameplay instead of template-only status mode
- Preserve the existing `games/SpaceInvaders/**` implementation unchanged
- Keep this PR limited to migration into `_next` only

## Allowed Destination Areas
Place migrated files only into the appropriate existing `_next` structure areas, including as applicable:
- `games/SpaceInvaders_next/assets/**`
- `games/SpaceInvaders_next/config/**`
- `games/SpaceInvaders_next/debug/**`
- `games/SpaceInvaders_next/entities/**`
- `games/SpaceInvaders_next/flow/**`
- `games/SpaceInvaders_next/game/**`
- `games/SpaceInvaders_next/levels/**`
- `games/SpaceInvaders_next/platform/**`
- `games/SpaceInvaders_next/systems/**`
- `games/SpaceInvaders_next/ui/**`
- `games/SpaceInvaders_next/utils/**`

## Required Mapping Rule
- Put each migrated file into the correct destination by responsibility
- Do NOT dump unrelated files into the wrong folder just to make runtime work
- Preserve reasonable structure parity between the original game and `_next`
- If a source file has no clear destination inside `_next`, STOP rather than guessing

## Required Behavior After Migration
`games/SpaceInvaders_next/index.html` MUST:
- boot migrated Space Invaders gameplay
- preserve the aligned engine/theme shell baseline already established in `_next`
- preserve debug integration if the current Space Invaders implementation already has it
- no longer remain template-only once migration is complete

## Allowed Operations
- read from `games/SpaceInvaders/**`
- write only to `games/SpaceInvaders_next/**`
- adapt relative paths/import paths as required for the new destination
- remove template-only placeholder behavior from `_next/index.html` once gameplay is wired
- add only the source game files actually required for the migrated `_next` runtime

## Explicit Non-Goals
- DO NOT modify `games/SpaceInvaders/**`
- DO NOT delete `games/SpaceInvaders/**`
- DO NOT perform canonical replacement in this PR
- DO NOT remove `games/SpaceInvaders_next/**`
- DO NOT refactor engine/shared code broadly
- DO NOT change unrelated games
- DO NOT do repo-wide cleanup

## Fail-Fast Conditions
STOP with no changes if any of the following are true:
- a required source file has no clear destination inside `games/SpaceInvaders_next/**`
- migration would require editing `games/SpaceInvaders/**`
- migration depends on engine/shared refactor beyond path corrections strictly required by destination move
- `_next` runtime cannot be made playable without broad structural guessing
- gameplay files would need to be placed into obviously wrong destination folders

## Acceptance Criteria
- `games/SpaceInvaders_next/**` contains the migrated gameplay in correct destination folders
- `games/SpaceInvaders_next/index.html` boots Space Invaders gameplay
- no template-only status screen remains as the primary behavior
- `games/SpaceInvaders/**` remains unchanged
- no unrelated games changed
- no broad engine/shared refactor occurred
- runtime is testable in browser

## Validation Steps
1. Open `games/SpaceInvaders_next/index.html`
2. Confirm:
   - Space Invaders gameplay starts
   - canvas is visible
   - shell/theme baseline still looks correct
   - debug works if it existed in source
   - no console errors
3. Compare `games/SpaceInvaders/**` and confirm it was not modified
4. Spot-check migrated folders to confirm files landed in correct destinations

## Output Requirement
Codex must package:
`<project folder>/tmp/BUILD_PR_GAMES_SPACE_INVADERS_GAMEPLAY_MIGRATION_TO_NEXT_delta.zip`
