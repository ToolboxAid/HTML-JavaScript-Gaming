# PLAN_PR_LEVEL_11_74_UTILS_CONSOLIDATION_INVENTORY

## Purpose
Inventory `src/shared/utils/*` and `src/shared/utils/*` at the folder, file, export, and method level so consolidation can happen in the next PR without stretching the work across many rounds.

## Scope
- Compare `src/shared/utils/*` and `src/shared/utils/*`.
- Identify duplicate and near-duplicate utilities.
- Classify each utility as `shared-safe`, `engine-only`, or `needs-review`.
- Produce reports only.
- Do not move files in this PR.
- Do not rewrite imports in this PR.

## Destination Rule
- `src/shared/utils/*`: generic utilities with no engine, renderer, sample, game-state, canvas, loader, or Workspace Manager dependency.
- `src/shared/utils/*`: utilities that depend on engine lifecycle, render/update loops, sample runtime, asset loading, canvas/game state, or engine-specific contracts.

## Acceptance
- Inventory report exists.
- CSV report exists.
- Follow-on consolidation plan exists and is limited to confirmed duplicates/shared-safe utilities.
- No code movement.
- No runtime behavior change.
