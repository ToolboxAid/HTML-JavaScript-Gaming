# PR 11.75 — Utils Consolidation

## Purpose
Consolidate duplicated utility code between `src/engine/utils/*` and `src/shared/utils/*` without introducing wrappers, aliases, pass-through shims, or broad refactors.

## Scope
- Inventory both utility trees before moving code.
- Move only shared-safe/pure utilities into `src/shared/utils/*`.
- Keep engine-bound utilities in `src/engine/utils/*`.
- Remove true duplicate engine utilities after imports are updated.
- Update imports to the final canonical path.
- Do not create bridge files, alias exports, or temporary compatibility layers.

## Shared vs Engine Rule
`src/shared/utils/*` is for pure reusable utilities only:
- no engine imports
- no canvas dependency
- no render loop dependency
- no game state dependency
- no sample-specific dependency
- no hidden fallback/default data

`src/engine/utils/*` keeps utilities that depend on:
- engine runtime
- canvas/rendering
- input systems
- physics/game state
- sample or tool loaders

## Required Codex Workflow
1. List files under `src/engine/utils` and `src/shared/utils`.
2. Identify exact duplicate or near-duplicate functions/classes/constants.
3. For each duplicate, decide canonical location using the shared-vs-engine rule.
4. Move shared-safe utilities to `src/shared/utils/*`.
5. Remove duplicate source from `src/engine/utils/*` only after imports are updated.
6. Update import paths across affected files.
7. Run targeted syntax/import validation.
8. Produce reports under `docs/dev/reports`.

## Non-goals
- No broad cleanup outside utility consolidation.
- No unrelated formatting.
- No roadmap rewrite.
- No standalone compatibility wrappers.
- No mass refactor.

## Acceptance
- Pure utilities live in `src/shared/utils/*`.
- Engine-only utilities remain in `src/engine/utils/*`.
- No duplicate utility implementation remains across both trees unless behavior differs and is documented.
- No alias/pass-through files are introduced.
- Targeted validation passes.
