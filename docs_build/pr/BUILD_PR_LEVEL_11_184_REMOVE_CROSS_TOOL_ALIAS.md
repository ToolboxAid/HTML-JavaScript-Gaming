# BUILD_PR_LEVEL_11_184_REMOVE_CROSS_TOOL_ALIAS

## Purpose
Remove the cross-tool alias that maps `vector-asset-studio` to `svg-asset-studio`.

## Decision
A tool id must not silently map to a different tool.

This violates the current architecture rule:

```text
One concept = one name.
```

Even if the alias did not directly cause the observed `vector-map-editor` launch bug, it keeps the tool-id path ambiguous and should be removed before continuing Workspace Manager launch fixes.

## Scope
One PR purpose only:
- Remove cross-tool aliasing from `tools/toolRegistry.js`.

Do not modify schemas.
Do not modify sample 1902 JSON.
Do not modify Workspace Manager click dispatch except validation/reporting.
Do not add replacement aliases.
Do not add fallback logic.

## Implementation Requirements

### 1. Remove alias map
In:

`tools/toolRegistry.js`

Remove:

```js
const TOOL_ID_ALIASES = Object.freeze({
  "vector-asset-studio": "svg-asset-studio"
});
```

### 2. Replace alias resolver
Update `resolveToolIdAlias(toolId)` so it only:
- trims string input
- returns the exact normalized tool id
- does not map one tool id to another

Expected behavior:

```js
export function resolveToolIdAlias(toolId) {
  return typeof toolId === "string" ? toolId.trim() : "";
}
```

### 3. Unknown IDs must stay unknown
If `getToolById("vector-asset-studio")` is called, it must return `null`.

Do not silently route it to SVG.

### 4. Add validation report
Create:

`docs_build/dev/reports/pr_11_184_validation.md`

Include:
- alias removed
- exact-id registry behavior
- validation commands
- note that Workspace Manager click dispatch still must use clicked `data-tool-id`

## Acceptance
- `getToolById("svg-asset-studio")` returns SVG Asset Studio.
- `getToolById("vector-asset-studio")` returns `null`.
- No registry alias maps one tool to another.
- Workspace Manager still renders SVG tile with `data-tool-id="svg-asset-studio"`.
- No fallback tool launch behavior is introduced.

## Validation
Run:
- `node --check tools/toolRegistry.js`
- `node --check "tools/Workspace Manager/main.js"`

Full samples smoke:
- Skip.
- Reason: targeted registry alias cleanup; full samples smoke takes about 20 minutes and is not required.
