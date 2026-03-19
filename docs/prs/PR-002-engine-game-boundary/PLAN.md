PR-002 - engine/game boundary plan

## Objective
Define PR-scoped architecture boundaries for engine/game surfaces and preserve existing runtime behavior.

## Scope
This PR is docs-only.

In scope:
- classify current `engine/game` surfaces as public, internal, or transitional
- document import/dependency direction rules
- reinforce `engine/core/gameBase.js` as the public runtime entry point
- preserve compatibility for current callers

Out of scope:
- runtime behavior changes
- file moves
- import rewrites
- API removals
- changes to games/samples code

## Decisions
1. `GameBase` remains the primary public runtime entry point (`engine/core/gameBase.js`).
2. `engine/game` keeps a narrow public surface for reusable game-facing object/collision/system abstractions.
3. `engine/game` infrastructure helpers are internal by boundary policy, even if still physically importable.
4. gameplay/UI helper modules currently under `engine/game` are transitional and compatibility-only.
5. this PR records boundaries and rules only; it does not change behavior or imports.

## Current Surface Snapshot
Observed in current imports:
- `GameBase` is imported broadly by games and samples.
- `gameObject.js`, `gameCollision.js`, and `gameObjectSystem.js` are active game-facing imports.
- `gameObjectManager.js`, `gameObjectRegistry.js`, and `gameObjectUtils.js` are not imported directly by games/samples.
- `gameUtils.js` and `gamePlayerSelectUi.js` are used by current callers, but are mixed gameplay/UI helpers and treated as transitional.

## Deliverables
- `EXPORT_CLASSIFICATION.md`: concrete per-module boundary labels and usage guidance.
- `DEPENDENCY_RULES.md`: allowed/disallowed dependency directions.
- `MIGRATION_NOTES.md`: compatibility and deprecation posture for transitional surfaces.
- `BUILD.md`: implementation guardrails and review checklist for a docs-only PR.

## Acceptance Criteria
- boundaries are explicit and module-specific
- dependency rules are explicit and enforceable in review
- `GameBase` is called out as the public entry point
- transitional surfaces are documented as temporary and frozen
- no runtime code or behavior changes are introduced
