# PR_11_191 — Vector Map Editor V2 Re-Engineer

## Purpose
Re-engineer Vector Map Editor V2 as the next tool in the V2 lane. This is not a copy/paste of legacy Vector Map Editor code.

## Scope
- Tool: Vector Map Editor V2 only.
- Single-file, single-class implementation target.
- Session-backed data only.
- Must use the shared `/index.html` theme header mount: `<div id="shared-theme-header"></div>`.
- Must keep V2 suffix in visible tool naming and tool identity.

## Out of Scope
- No schema changes.
- No sample changes.
- No game changes.
- No Workspace Manager v1 work.
- No platformShell usage.
- No assetUsageIntegration usage.
- No `toolbox/shared/*` dependency.
- No legacy helper copy/paste.

## Required Architecture
Data entry paths:
1. Workspace writes session, tool reads session.
2. Tool URL writes session, tool reads session.
3. Tool direct reads session via hostContextId.

Tool never fetches, guesses, defaults, or falls back.

## Required Logs
- `[VECTOR_MAP_V2_ENTRY]`
- `[SESSION_CONTEXT_READ]`
- `[VECTOR_MAP_V2_CONTRACT_LOADED]`

## Acceptance
- Vector Map Editor V2 loads from session.
- Vector map renders from session-backed contract.
- Empty and invalid states are explicit and actionable.
- Header uses `/index.html` shared header image/theme mount.
- No legacy v1 coupling.
- No fallback/default data.
- No schema/sample/game changes.
