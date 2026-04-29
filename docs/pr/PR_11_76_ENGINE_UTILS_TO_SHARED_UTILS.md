# PR 11.76 — Engine Utils to Shared Utils Consolidation

## Purpose
Move the complete utility layer currently under `src/engine/utils/*` into `src/shared/utils/*` because these files are utilities, not engine runtime code.

## Scope
- Inventory every file under `src/engine/utils/*`.
- Move all utility files to `src/shared/utils/*`.
- Preserve folder structure where it helps clarity.
- Merge only when the target shared file is the same utility contract.
- Update all imports across the repo.
- Remove emptied `src/engine/utils` files/folders after import updates.

## Important Correction
Do not cherry-pick only exact duplicates. The default action is move to shared.

Only keep a file under `src/engine/utils/*` if it is proven to be engine runtime code, meaning it directly depends on engine runtime systems such as:
- render loop ownership
- engine state lifecycle
- engine-specific service registry
- runtime scene/game object orchestration
- engine-only loader internals

Canvas helpers, math helpers, path helpers, DOM helpers, JSON helpers, color helpers, id helpers, validation helpers, formatting helpers, and similar utilities belong in `src/shared/utils/*`.

## Rules
- No pass-through aliases.
- No wrapper files that re-export moved utilities from the old path.
- No duplicate utility implementations left behind.
- No broad refactor beyond import path updates required by the move.
- No unrelated changes.
- If two files conflict, keep the shared destination as source of truth and merge useful exported functions into one shared file.
- If a file must remain in engine, document the exact engine runtime dependency in the report.

## Acceptance
- `src/engine/utils/*` is empty or contains only documented engine-runtime exceptions.
- All moved utilities live under `src/shared/utils/*`.
- All imports resolve to the new shared paths.
- No old `src/engine/utils/*` imports remain except documented exceptions.
- Workspace Manager and affected tools load without import errors.
