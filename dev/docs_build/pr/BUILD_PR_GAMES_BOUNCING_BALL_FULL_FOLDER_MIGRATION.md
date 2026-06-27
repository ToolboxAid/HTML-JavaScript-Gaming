# BUILD PR — Games Bouncing-ball Full Folder Migration

## Purpose
Execute full template-based migration for `games/Bouncing-ball/**` in a single BUILD.

## Steps
1. Create `games/Bouncing-ball_next/**` from `games/_template/**`
2. Migrate gameplay from `games/Bouncing-ball/**` → `_next`
3. Validate `_next` (runs, canvas, no errors)
4. Clear `games/Bouncing-ball/**`
5. Copy `_next` → `games/Bouncing-ball/**`
6. Validate canonical
7. Remove `_next`

## Rules
- Do NOT modify other games
- Do NOT refactor engine/shared
- No guessing file destinations
- Fail fast on ambiguity

## Acceptance
- Bouncing-ball runs from canonical
- Canvas visible
- No console errors
- `_next` removed
