# BUILD PR — Games Space Invaders Copy From Next

## Purpose
Copy the validated `_next` candidate into the canonical destination `games/SpaceInvaders/**`.

## Context
- `games/SpaceInvaders/**` has been cleared
- `games/SpaceInvaders_next/**` contains the migrated, runnable candidate

## Single PR Purpose
Perform a clean copy from `_next` to canonical, preserving structure and ensuring required files are present.

## Source / Destination
Source:
- `games/SpaceInvaders_next/**`

Destination:
- `games/SpaceInvaders/**`

## Scope (STRICT)
- Copy all files and folders from `_next` into canonical destination
- Preserve exact structure
- Ensure runtime works from canonical path
- Validate presence of required files (including capture-preview.html if present in source)

## Required Validation Rule
- If `capture-preview.html` exists in source:
  → it MUST exist in destination
- If it does NOT exist in source:
  → DO NOT create it
  → DO NOT guess content
  → proceed without it

## Allowed Operations
- copy files/folders
- adjust relative paths ONLY if required for canonical runtime
- ensure index.html boots correctly

## Explicit Non-Goals
- DO NOT modify `_next`
- DO NOT recreate missing files
- DO NOT refactor engine/shared
- DO NOT change other games

## Fail-Fast Conditions
STOP if:
- source `_next` is missing required runtime files
- copy would require guessing missing files
- runtime cannot work post-copy without structural changes

## Acceptance Criteria
- `games/SpaceInvaders/**` matches `_next`
- game boots from canonical path
- no console errors
- `_next` remains unchanged
- capture-preview.html rule respected

## Validation Steps
1. Open `games/SpaceInvaders/index.html`
2. Confirm gameplay runs
3. Confirm no console errors
4. Compare structure with `_next`
5. Verify capture-preview.html handling

## Output Requirement
Codex must package:
`<project folder>/tmp/BUILD_PR_GAMES_SPACE_INVADERS_COPY_FROM_NEXT_delta.zip`
