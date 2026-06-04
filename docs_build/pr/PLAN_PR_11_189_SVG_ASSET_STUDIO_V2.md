# PLAN_PR_11_189 — SVG Asset Studio v2

## Purpose
Replace SVG Asset Studio with a v2-only, session-backed tool entry that is hard-separated from legacy v1 systems.

## Scope
- Tool: SVG Asset Studio v2 only.
- Single implementation file.
- Single class.
- No helper classes.
- No alias/pass-through variable chains.
- No abstraction layers.
- No schema changes.
- No sample changes.
- No game changes.
- No Workspace Manager v1 work.
- No legacy tool patching.
- No copying old code.

## Required Architecture
Data entry paths:
1. Workspace writes session; tool reads session.
2. Tool URL writes session; tool reads session.
3. Tool direct reads session via `hostContextId`.

The tool must never:
- fetch data directly,
- guess data,
- use fallback/default/demo data,
- wire into Workspace Manager v1,
- import `platformShell`, `assetUsageIntegration`, or anything under `src/shared/toolbox/*`.

## UI Requirements
- Header must match `/index.html`.
- Use the existing accordion system.
- Reuse `src/engine/theme` without creating a new theme system.
- Provide two separate menus:
  - `menuTool` for SVG Asset Studio actions only.
  - `menuWorkspace` for workspace-only actions only.
- Do not mix tool and workspace responsibilities.

## Expected Logs
- `[SVG_V2_ENTRY]`
- `[SESSION_CONTEXT_READ]`
- `[SVG_V2_CONTRACT_LOADED]`

## Acceptance
- SVG Asset Studio v2 loads SVG data only from session-backed context.
- Valid SVG contract renders correctly.
- Empty state is visible and actionable when no session context exists.
- Error state is visible and actionable when session data is invalid.
- No legacy coupling remains in the SVG v2 entry.
- No banned imports or legacy v1 references are introduced.
- Targeted validation is documented in `docs_build/dev/reports/PR_11_189_validation_report.md`.
