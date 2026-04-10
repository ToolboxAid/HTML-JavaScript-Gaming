# BUILD PR — Games MultiBallChaos Full Folder Migration

## Purpose
Execute full template-based migration for `games/MultiBallChaos/**` in a single BUILD.

## Steps
1. Create `games/MultiBallChaos_next/**` from `games/_template/**`
2. Migrate gameplay from `games/MultiBallChaos/**` → `_next`
3. Validate `_next` (runs, canvas, no errors)
4. Clear `games/MultiBallChaos/**`
5. Copy `_next` → `games/MultiBallChaos/**`
6. Validate canonical
7. Remove `_next`

## Rules
- Do NOT modify other games
- Do NOT refactor engine/shared
- No guessing file destinations
- Fail fast on ambiguity

## Acceptance
- MultiBallChaos runs from canonical
- Canvas visible
- No console errors
- `_next` removed
