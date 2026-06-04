# BUILD_PR_11_189 — SVG Asset Studio v2

## Codex Objective
Implement the smallest valid SVG Asset Studio v2 replacement that satisfies PLAN_PR_11_189.

## Absolute Constraints
Do not edit schemas, samples, games, Workspace Manager v1, legacy tools, or shared v1 systems.

Banned imports/references:
- `platformShell`
- `assetUsageIntegration`
- `src/shared/toolbox/`
- Workspace Manager v1 wiring
- tool aliases
- fallback/default/demo data logic

Implementation constraints:
- one tool at a time,
- single file,
- single class,
- no helper classes,
- no alias variables,
- no pass-through variable chains,
- no abstraction layers,
- no unrelated file edits.

## Required Work
1. Create or replace the SVG Asset Studio v2 entry as a single-file, single-class implementation.
2. Read all operational data from session-backed context only.
3. Support these paths:
   - Workspace writes session, tool reads session.
   - Tool URL writes session, tool reads session.
   - Tool direct reads session via `hostContextId`.
4. Render SVG only after a valid v2 session contract is loaded.
5. Show an actionable empty state when session context is missing.
6. Show an actionable error state when session context is invalid.
7. Add required logs:
   - `[SVG_V2_ENTRY]`
   - `[SESSION_CONTEXT_READ]`
   - `[SVG_V2_CONTRACT_LOADED]`
8. Reuse `/index.html` header pattern and the existing accordion.
9. Reuse `src/engine/theme` only as needed.
10. Keep `menuTool` and `menuWorkspace` separate.
11. Update the master roadmap status only if there is an execution-backed marker transition. Do not rewrite roadmap text.
12. Write validation findings to `docs_build/dev/reports/PR_11_189_validation_report.md`.

## Validation Required
Run targeted validation only. Do not run the full samples smoke test.

Required checks:
- Syntax check for the changed SVG v2 file.
- Banned import/reference grep for the changed SVG v2 file.
- Manual or scripted launch check confirming expected logs.
- Manual validation of valid, empty, and invalid session states.

Full samples smoke test:
- Skip by default.
- Reason: scope is one isolated v2 tool entry and does not change shared loaders, samples, schemas, games, or broad framework code.

## Output Required From Codex
Create repo ZIP at:
`C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\tmp\PR_11_189.zip`

The ZIP must preserve repo-relative paths and include:
- implementation changes,
- `docs_build/dev/reports/PR_11_189_validation_report.md`,
- any status-only roadmap marker update if execution-backed.
