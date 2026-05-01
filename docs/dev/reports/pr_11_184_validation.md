# PR 11.184 Validation

## Scope
Removed cross-tool aliasing from `tools/toolRegistry.js`.

## Files changed
- `tools/toolRegistry.js`
- `docs/dev/reports/pr_11_184_validation.md`

## Alias removed
Removed the `TOOL_ID_ALIASES` map that routed:

```text
vector-asset-studio -> svg-asset-studio
```

`resolveToolIdAlias(toolId)` now only returns trimmed string input and does not map one tool id to another.

## Exact-id registry behavior
Verified with a module import check:

```json
{"svg":"svg-asset-studio","vectorAsset":null,"alias":"vector-asset-studio"}
```

This confirms:
- `getToolById("svg-asset-studio")` returns SVG Asset Studio.
- `getToolById("vector-asset-studio")` returns `null`.
- `resolveToolIdAlias(" vector-asset-studio ")` returns `vector-asset-studio`, not SVG.

## Workspace Manager note
Workspace Manager click dispatch must continue to use clicked `data-tool-id` values directly. No fallback alias was added.

## Validation
- PASS: `node --check tools/toolRegistry.js`
- PASS: `node --check "tools/Workspace Manager/main.js"`
- PASS: exact-id module behavior check with `node --input-type=module`

## Manual UAT
Not run in this terminal session. Required browser UAT remains:
- Open Workspace Manager sample 1902.
- Confirm SVG tile still renders as `svg-asset-studio`.
- Confirm no alias is used to launch SVG.

## Full samples smoke
Skipped. Reason: targeted registry alias cleanup.
