# BUILD PR — Games Space Invaders Clear Destination

## Purpose
Prepare `games/SpaceInvaders/**` for canonical replacement by clearing the destination completely before copy-in from `_next`.

## Context
`games/SpaceInvaders_next/**` now holds the migrated gameplay candidate.
This PR is ONLY the clear-destination step.

Note:
- `capture-preview.html` was reported missing from the prior migration result.
- This PR does NOT fix that omission.
- The omission must be handled in the later copy/promotion validation step.
- Do not guess at replacement content in this PR.

## Single PR Purpose
Clear the canonical destination so no legacy files remain before promotion from `_next`.

## Scope (STRICT)
- Delete all files and subfolders under:
  `games/SpaceInvaders/**`
- Leave the `games/SpaceInvaders/` folder itself present and empty

## Target Path (EXACT)
- `games/SpaceInvaders/**`

## Allowed Operations
- delete files under `games/SpaceInvaders/**`
- delete subfolders under `games/SpaceInvaders/**`
- leave `games/SpaceInvaders/` in place

## Explicit Non-Goals
- DO NOT touch `games/SpaceInvaders_next/**`
- DO NOT copy files
- DO NOT move files
- DO NOT recreate `capture-preview.html`
- DO NOT modify engine/shared code
- DO NOT change unrelated games

## Fail-Fast Conditions
STOP with no changes if any of the following are true:
- `games/SpaceInvaders/` does not exist
- deletion would affect any path outside `games/SpaceInvaders/**`
- the operation would also touch `games/SpaceInvaders_next/**`

## Acceptance Criteria
- `games/SpaceInvaders/` still exists
- `games/SpaceInvaders/` is empty
- `games/SpaceInvaders_next/**` remains unchanged

## Validation Steps
1. Inspect `games/SpaceInvaders/`
2. Confirm no files remain under it
3. Confirm `games/SpaceInvaders_next/**` was not modified

## Output Requirement
Codex must package:
`<project folder>/tmp/BUILD_PR_GAMES_SPACE_INVADERS_CLEAR_DESTINATION_delta.zip`
