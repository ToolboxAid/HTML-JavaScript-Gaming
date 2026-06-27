# BUILD PR — Games Space Invaders Remove Next

## Purpose
Remove the temporary migration scaffold `games/SpaceInvaders_next/**` now that canonical `games/SpaceInvaders/**` is in place and validated.

## Context
- `games/SpaceInvaders/**` is the canonical running version
- `games/SpaceInvaders_next/**` is now redundant migration scaffolding
- preview restoration is NOT part of this PR

## Single PR Purpose
Delete `games/SpaceInvaders_next/**` and nothing else.

## Scope (STRICT)
- Delete all files and subfolders under:
  `games/SpaceInvaders_next/**`
- Remove the `games/SpaceInvaders_next/` folder when empty

## Target Path (EXACT)
- `games/SpaceInvaders_next/**`

## Allowed Operations
- delete files under `games/SpaceInvaders_next/**`
- delete subfolders under `games/SpaceInvaders_next/**`
- delete the top-level `games/SpaceInvaders_next/` folder after contents are removed

## Explicit Non-Goals
- DO NOT modify `games/SpaceInvaders/**`
- DO NOT add or restore preview files
- DO NOT modify engine/shared code
- DO NOT change unrelated games
- DO NOT perform any runtime fixes in this PR

## Fail-Fast Conditions
STOP with no changes if any of the following are true:
- `games/SpaceInvaders_next/` does not exist
- deletion would affect any path outside `games/SpaceInvaders_next/**`
- any change to canonical `games/SpaceInvaders/**` is required

## Acceptance Criteria
- `games/SpaceInvaders_next/` is removed
- `games/SpaceInvaders/**` remains unchanged
- no unrelated paths are changed

## Validation Steps
1. Confirm `games/SpaceInvaders_next/` no longer exists
2. Confirm `games/SpaceInvaders/**` still runs unchanged
3. Confirm no unrelated files were modified

## Output Requirement
Codex must package:
`<project folder>/tmp/BUILD_PR_GAMES_SPACE_INVADERS_REMOVE_NEXT_delta.zip`
