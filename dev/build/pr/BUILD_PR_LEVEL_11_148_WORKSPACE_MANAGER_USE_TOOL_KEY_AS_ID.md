# BUILD_PR_LEVEL_11_148_WORKSPACE_MANAGER_USE_TOOL_KEY_AS_ID

## Purpose
Fix Workspace Manager so it uses the workspace manifest `tools` object key as the tool id instead of requiring each direct tool payload to repeat a `tool` field.

## Problem
After PR 11.147, Sample 1902 manifest uses direct tool payloads as intended. Workspace Manager now rejects every tool entry with:

`tool-entry-missing-tool-id`

This means Workspace Manager still expects old wrapper metadata inside each tool entry:

```json
"vector-map-editor": {
  "tool": "vector-map-editor",
  "version": "1",
  "payload": {}
}
```

But the locked contract now uses:

```json
"vector-map-editor": {
  "vectorMapDocument": {}
}
```

The tool id is the object key: `vector-map-editor`.

## STRICT SCOPE

### ALLOWED FILES
- toolbox/workspace-manager/main.js
- docs_build/dev/reports/workspace_tool_key_id_fix_11_148.txt

### ALLOWED CHANGES
- update Workspace Manager manifest parsing/diagnostics to use the `tools` object key as the tool id
- remove the requirement that direct tool payload entries contain `tool`
- keep validation against each referenced tool schema
- create report

## FORBIDDEN

Codex MUST NOT:
- modify schemas
- modify Sample 1902 manifest
- modify other samples
- re-add `tool/version/payload` wrappers
- add fallback/default/preset data
- add compatibility wrapper acceptance
- transform direct payloads
- normalize tool ids beyond using the existing object key

## Required Behavior

Given:

```json
"tools": {
  "vector-map-editor": {
    "vectorMapDocument": {}
  }
}
```

Workspace Manager must:
1. treat `vector-map-editor` as the tool id
2. validate the entry object against `vector-map-editor.schema.json`
3. pass the direct payload object to tool launch
4. not require `entry.tool`
5. not require `entry.payload`

## Required Fix

In `toolbox/workspace-manager/main.js`:

- find the logic producing `tool-entry-missing-tool-id`
- change it so the manifest key is the canonical tool id
- remove/disable the check that requires `entry.tool`
- keep validation that the key exists in active registry
- keep validation that entry payload matches the tool schema
- keep diagnostics clear when registry key is unavailable

## Validation

Run targeted validation only.

Required:
- Workspace Manager no longer reports `tool-entry-missing-tool-id` for Sample 1902 direct entries
- Sample 1902 manifest remains direct payload shape
- no schema files changed
- no sample files changed
- changed JS syntax passes
- `git diff --name-only` contains only ALLOWED FILES

## Report

Write:

- `docs_build/dev/reports/workspace_tool_key_id_fix_11_148.txt`

Report must include:
- file changed
- previous behavior
- new behavior
- validation command/result
- strict scope confirmation
- any remaining blocker, such as registry availability

## Full Samples Smoke Test

Skipped.

Reason:
- targeted Workspace Manager parsing fix only
- full samples smoke test takes approximately 20 minutes

## Acceptance

- Workspace Manager uses manifest `tools` object key as the tool id.
- Direct tool payload entries do not need `tool`.
- Sample 1902 is not forced back into wrapper shape.
- Schemas remain unchanged.
