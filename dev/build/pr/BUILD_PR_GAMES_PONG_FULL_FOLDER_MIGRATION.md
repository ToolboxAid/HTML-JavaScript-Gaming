# BUILD PR — Games Pong Full Folder Migration

## Purpose
Execute full template-based migration for `games/Pong/**` in a single BUILD.

## Steps
1. Create `games/Pong_next/**` from `games/_template/**`
2. Migrate gameplay from `games/Pong/**` → `_next`
3. Validate `_next` (runs, canvas, no errors)
4. Clear `games/Pong/**`
5. Copy `_next` → `games/Pong/**`
6. Validate canonical
7. Remove `_next`

## Rules
- Do NOT modify other games
- Do NOT refactor engine/shared
- No guessing file destinations
- Fail fast on ambiguity

## Acceptance
- Pong runs from canonical
- Canvas visible
- No console errors
- `_next` removed
