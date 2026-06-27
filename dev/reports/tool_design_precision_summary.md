# Tool Design Precision Summary

Task: PR_26124_024

## Scope
- Documentation/design only.
- Runtime code, schemas, sample JSON, games, and start_of_day folders were not modified.
- Rebuilt every existing tool design doc with explicit control/action/JSON-effect rows and a `Published Output` section.

## Changes
- Replaced remaining generic publish wording with explicit `tools.<toolId>` shapes.
- Added the required ownership phrase: Tool receives validated payload and owns behavior.
- Kept Palette Browser first and limited its contract to global palette output.
- Kept transitional folders deferred and out of the core rebuild lane.

## Validation Targets
- Every `docs/design/tools/*/REENGINEERING_DESIGN.md` has `Published Output:` and a `tools.<toolId> =` shape.
- Every tool design doc has a `Control -> Action -> JSON Effect` table.
- No runtime, schema, sample JSON, game, or start_of_day files are part of the design reset delta.
