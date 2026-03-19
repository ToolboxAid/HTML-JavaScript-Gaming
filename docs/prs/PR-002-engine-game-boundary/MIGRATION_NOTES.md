PR-002 Migration Notes - engine/game

## Current PR Posture
This PR is docs-only and preserves full compatibility.

What this PR does:
- documents concrete public/internal/transitional classifications
- documents dependency direction rules
- reinforces `GameBase` as the public runtime entry point
- labels compatibility-only surfaces as transitional

What this PR does not do:
- no runtime behavior changes
- no file moves
- no import rewrites
- no API removals

## Transitional Surface Freeze
- Transitional modules remain usable for existing callers.
- No new responsibilities should be added to transitional modules.
- New work should prefer `GameBase` and public `engine/game` surfaces.

## Follow-up Migration Direction
Future PRs may:
- reduce direct caller dependence on transitional modules
- move mixed gameplay/UI helpers out of `engine/` when migration is safe
- tighten public export guidance around `GameBase` + stable game-facing facades

## Compatibility Guarantee
This PR intentionally changes only documentation and boundary policy language.
Existing runtime behavior and imports remain unchanged.
