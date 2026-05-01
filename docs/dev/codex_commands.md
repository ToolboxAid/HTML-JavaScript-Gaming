# Codex Commands — PR 11.184

Model: GPT-5 high
Reasoning: high

Remove cross-tool aliasing.

Primary file:
- `tools/toolRegistry.js`

Steps:
1. Remove `TOOL_ID_ALIASES`.
2. Update `resolveToolIdAlias(toolId)` so it only trims and returns exact input.
3. Ensure `getToolById("vector-asset-studio")` does not resolve to SVG.
4. Do not add fallback aliases.
5. Create report:
   - `docs/dev/reports/pr_11_184_validation.md`

Validation:
- `node --check tools/toolRegistry.js`
- `node --check "tools/Workspace Manager/main.js"`

Manual:
- Open Workspace Manager sample 1902.
- Confirm SVG tile still renders as `svg-asset-studio`.
- Confirm no tool id aliases are used to launch SVG.

Full samples smoke:
- Skip.
- Reason: targeted registry alias cleanup.

Return ZIP artifact at:
`<project folder>/tmp/PR_11_184_20260430_01.zip`
