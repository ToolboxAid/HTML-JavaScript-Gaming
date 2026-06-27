# PR 11.61 — Bulk Metadata-Aware JSON Cleanup 64

## Purpose
Remove 64 additional audit-confirmed unused sample JSON files and remove stale references from `samples/metadata/samples.index.metadata.json` so the audit NO/missing-reference count actually decreases.

## Scope
- Batch size: 64 audit `NO` JSON entries.
- Delete unused JSON files only when not protected by guardrails.
- Remove stale metadata/index references for every deleted JSON file.
- Do not modify roadmap content except status-only if an execution-backed marker is required.
- Do not refactor loader/framework/tool code.

## Protected Files / Areas
Do not delete or modify:
- `palette.json`
- `tile-map-editor-document.json`
- anything under sample `1902`
- shared assets or ambiguous files
- roadmap text content

## Critical Metadata Rule
A reference only from `samples/metadata/samples.index.metadata.json` is not a keep reason.
If the JSON is otherwise audit-confirmed unused:
1. Delete the JSON file.
2. Remove its stale entry/reference from `samples/metadata/samples.index.metadata.json`.
3. Re-run audit and prove NO count drops.

## Acceptance Criteria
- Baseline audit count recorded before changes.
- 64 eligible unused JSON files removed, or fewer only if protected/ambiguous candidates remain.
- Matching stale metadata references removed.
- Final audit count recorded after changes.
- Report explains before/after counts and any skipped candidates.
- Full samples smoke test skipped unless shared loader/framework code changes.
