# PR_11_196 — V2 Runtime Validation + Cleanup Pass

## Purpose
Validate and clean up the completed V2 re-engineer lane after PR_11_195.

This PR is a Codex-driven stabilization pass. ChatGPT does not write implementation code.

## Scope
Codex must inspect and correct V2 tool runtime structure only.

Target V2 tools:
- Palette Manager V2
- SVG Asset Studio V2
- Vector Map Editor V2
- Tilemap Studio V2
- Asset Browser V2

## Required outcomes
- Each V2 tool has a thin `tools/<tool>-v2/index.html` shell.
- Each V2 tool uses `<div id="shared-theme-header"></div>`.
- Each V2 tool loads the shared theme/header through HTML, not JS injection.
- Each V2 tool keeps runtime behavior in `index.js`.
- `index.js` does not build the full page shell with `document.body.innerHTML`.
- `index.js` does not inject large CSS blocks through `document.head.insertAdjacentHTML`.
- `index.js` does not dynamically append the shared header script.
- V2 tool IDs use explicit `*-v2` identifiers.
- V2 tools read session-backed data only.
- V2 tools show explicit empty/error states.
- No fallback data.
- No legacy v1 coupling.

## Hard exclusions
- No schema changes.
- No sample changes.
- No game changes.
- No Workspace Manager v1 work.
- No `platformShell` use.
- No `tools/shared/*` use.
- No repo-wide refactor.
- No helper classes.
- No abstraction layers.
- No alias variables.

## Validation required
Codex must run targeted validation only.

Required checks:
- Syntax check changed V2 JS files.
- Verify each target V2 HTML file contains `id="shared-theme-header"`.
- Verify each target V2 HTML file loads shared theme CSS.
- Verify each target V2 body/tool id uses `-v2`.
- Verify target V2 JS does not contain full-page body replacement.
- Verify target V2 JS does not contain dynamic CSS/header injection patterns.

Full samples smoke test must be skipped unless Codex changes shared sample loader/framework. Record skip reason in the report.

## Evidence
Codex must write findings to:

`docs/dev/reports/pr_11_196_v2_runtime_validation_cleanup_report.md`

The report must include:
- files changed
- checks run
- pass/fail result per target tool
- full samples smoke test skipped/run decision and reason
- confirmation that no schema/sample/game/workspace-v1 files changed

## Acceptance
- All target V2 tools pass the validation above.
- Any changes are limited to target V2 tool files and required docs/reports.
- Codex produces final ZIP at `<project folder>/tmp/PR_11_196.zip`.
