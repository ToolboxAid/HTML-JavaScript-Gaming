# BUILD PR — Games Orbit Full Folder Migration

## Purpose
Execute full template-based migration for `games/Orbit/**` in a single BUILD.

## Steps
1. Create `games/Orbit_next/**` from `games/_template/**`
2. Migrate gameplay from `games/Orbit/**` → `_next`
3. Validate `_next` (runs, canvas, no errors)
4. Clear `games/Orbit/**`
5. Copy `_next` → `games/Orbit/**`
6. Validate canonical
7. Remove `_next`

## Rules
- Do NOT modify other games
- Do NOT refactor engine/shared
- No guessing file destinations
- Fail fast on ambiguity

## Acceptance
- Orbit runs from canonical
- Canvas visible
- No console errors
- `_next` removed
