# PLAN_PR_LEVEL_8_27_CODE_ASSET_EXTRACTION_TO_TOOL_JSON

## Purpose
Add code-defined colors, shapes, HUD primitives, vector primitives, and other asset constants to the Level 8 blocker list, then create an audit/extraction plan that moves those definitions into tool-owned JSON assets.

## Scope
- Audit code-defined colors/shapes/assets in games and samples.
- Classify each hardcoded asset by owning tool/schema.
- Create extraction plan and report.
- Wire extracted JSON as game/sample input where safe.
- Advance roadmap status only.

## Non-Goals
- No broad runtime rewrite.
- No destructive deletion.
- No validators.
- No `start_of_day` changes.
- No extraction without matching schema/tool ownership.
