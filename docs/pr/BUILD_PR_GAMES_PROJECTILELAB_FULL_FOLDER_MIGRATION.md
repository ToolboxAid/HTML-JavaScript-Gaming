# BUILD PR — Games ProjectileLab Full Folder Migration

## Purpose
Execute full template-based migration for `games/ProjectileLab/**` in a single BUILD.

## Steps
1. Create `games/ProjectileLab_next/**` from `games/_template/**`
2. Migrate gameplay from `games/ProjectileLab/**` → `_next`
3. Validate `_next` (runs, canvas, no errors)
4. Clear `games/ProjectileLab/**`
5. Copy `_next` → `games/ProjectileLab/**`
6. Validate canonical
7. Remove `_next`

## Rules
- Do NOT modify other games
- Do NOT refactor engine/shared
- No guessing file destinations
- Fail fast on ambiguity

## Acceptance
- ProjectileLab runs from canonical
- Canvas visible
- No console errors
- `_next` removed
