PR-002 BUILD - engine/game architecture boundary

## Purpose
Provide implementation guardrails for a docs-only PR that defines boundary policy.

## Required Outcomes
- classify current engine/game surfaces as public, internal, or transitional
- document dependency direction and anti-patterns
- reinforce `engine/core/gameBase.js` (`GameBase`) as the public entry point
- preserve compatibility and runtime behavior

## Non-Goals
- no runtime code changes
- no file moves
- no import rewrites
- no API removals

## Patch Scope
- `docs/pr/PR-002-engine-game-boundary/PLAN.md`
- `docs/pr/PR-002-engine-game-boundary/EXPORT_CLASSIFICATION.md`
- `docs/pr/PR-002-engine-game-boundary/DEPENDENCY_RULES.md`
- `docs/pr/PR-002-engine-game-boundary/MIGRATION_NOTES.md`
- `docs/pr/PR-002-engine-game-boundary/BUILD.md`

## Review Checklist
- `GameBase` is explicitly documented as the primary public entry point.
- `engine/game` modules are concretely classified, not just described at template level.
- dependency rules include both allowed and disallowed directions.
- transitional surfaces are marked compatibility-only and scope-frozen.
- no runtime source files were modified.
