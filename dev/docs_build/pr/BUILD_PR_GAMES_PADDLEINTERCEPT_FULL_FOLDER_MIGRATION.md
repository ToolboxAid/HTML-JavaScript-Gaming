# BUILD PR — Games PaddleIntercept Full Folder Migration

## Purpose
Execute full template-based migration for `games/PaddleIntercept/**` in a single BUILD.

## Steps
1. Create `games/PaddleIntercept_next/**` from `games/_template/**`
2. Migrate gameplay from `games/PaddleIntercept/**` → `_next`
3. Validate `_next` (runs, canvas, no errors)
4. Clear `games/PaddleIntercept/**`
5. Copy `_next` → `games/PaddleIntercept/**`
6. Validate canonical
7. Remove `_next`

## Rules
- Do NOT modify other games
- Do NOT refactor engine/shared
- No guessing file destinations
- Fail fast on ambiguity

## Acceptance
- PaddleIntercept runs from canonical
- Canvas visible
- No console errors
- `_next` removed
