# BUILD PR — Games PacmanFullAI Full Folder Migration

## Purpose
Execute full template-based migration for `games/PacmanFullAI/**` in a single BUILD.

## Single PR Purpose
Perform the full validated migration pipeline for PacmanFullAI:
1. Create `games/PacmanFullAI_next/**` from `games/_template/**`
2. Migrate gameplay from `games/PacmanFullAI/**` into `_next`
3. Validate `_next` runtime
4. Clear canonical `games/PacmanFullAI/**`
5. Copy `_next` back into canonical
6. Validate canonical runtime
7. Remove `_next`

## Rules
- Do NOT modify other games
- Do NOT refactor engine/shared broadly
- Do NOT redesign `games/_template`
- Put files into correct destination folders by responsibility
- Do NOT guess ambiguous destinations
- Fail fast on ambiguity

## Acceptance Criteria
- `games/PacmanFullAI/**` runs from canonical path
- canvas is visible
- no console errors
- `games/PacmanFullAI_next/**` is removed at the end
- no unrelated games changed

## Output
<project folder>/tmp/BUILD_PR_GAMES_PACMANFULLAI_FULL_FOLDER_MIGRATION_delta.zip
