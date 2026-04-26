# PLAN_PR_LEVEL_8_23_WORKSPACE_MANIFEST_GAMES_FIELD_ALIGNMENT

## Purpose
Fix the remaining Level 8 schema conformance blocker: workspace manifest documents are missing the root `games` field required by `tools/schemas/workspace.schema.json`.

## Scope
- Align workspace manifest documents with current workspace schema.
- Add or normalize the root `games` array where missing.
- Preserve existing manifest fields and ordering where practical.
- Advance roadmap status from `[ ]` to `[.]` or `[.]` to `[x]` only.

## Non-Goals
- No runtime behavior changes.
- No validators.
- No `start_of_day` changes.
- No broad schema redesign.
