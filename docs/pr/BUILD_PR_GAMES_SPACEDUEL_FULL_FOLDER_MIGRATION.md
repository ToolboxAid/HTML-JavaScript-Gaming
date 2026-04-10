# BUILD PR — Games SpaceDuel Full Folder Migration

## Purpose
Execute full template-based migration for `games/SpaceDuel/**` in a single BUILD.

## Steps
1. Create `games/SpaceDuel_next/**` from `games/_template/**`
2. Migrate gameplay from `games/SpaceDuel/**` → `_next`
3. Validate `_next` (runs, canvas, no errors)
4. Clear `games/SpaceDuel/**`
5. Copy `_next` → `games/SpaceDuel/**`
6. Validate canonical
7. Remove `_next`

## Rules
- Do NOT modify other games
- Do NOT refactor engine/shared
- No guessing file destinations
- Fail fast on ambiguity

## Acceptance
- SpaceDuel runs from canonical
- Canvas visible
- No console errors
- `_next` removed
