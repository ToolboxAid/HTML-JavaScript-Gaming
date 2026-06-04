# PR_11_198 — Tilemap Studio V2 Completion + Validation

## Purpose
Complete Tilemap Studio V2 as a testable V2 re-engineered tool while enforcing HTML-first shell, session-only runtime behavior, and shared-theme header compliance.

## Scope
- Tilemap Studio V2 only.
- Codex writes implementation code.
- ChatGPT bundle supplies PR docs, Codex commands, commit comment, and report requirements only.
- No schema changes.
- No sample changes.
- No game changes.
- No Workspace Manager v1 work.
- No legacy tool patching.
- No platformShell or toolbox/shared coupling.

## Required Architecture
- `toolbox/tilemap-studio-v2/index.html` owns the static shell.
- `toolbox/tilemap-studio-v2/index.js` owns behavior only.
- Tool reads session-backed data only.
- Tool does not fetch, guess, default, or fallback.
- Tool name and visible title must end with `V2`.
- Header must mount through `<div id="shared-theme-header"></div>`.

## HTML-First Requirements
`index.html` must contain:
- theme CSS links
- shared header mount
- static app shell
- static menuTool area
- static menuWorkspace area
- script includes for shared header mount and local `index.js`

`index.js` must not contain:
- full-page `document.body.innerHTML` construction
- `document.head.insertAdjacentHTML` stylesheet injection
- inline `<style>` injection
- dynamic header script injection
- legacy imports
- helper classes
- alias/pass-through variables

## Testable Completion Criteria
- Tilemap Studio V2 loads standalone.
- Missing session shows a clear actionable empty/error state.
- Valid session renders tilemap content.
- Header renders from shared theme mount.
- Browser console has no errors during load.
- `node --check toolbox/tilemap-studio-v2/index.js` passes.

## Full Samples Smoke Test Decision
Do not run full samples smoke by default. This PR is scoped to one V2 tool. Run targeted syntax and manual Tilemap Studio V2 checks only unless Codex changes shared loaders/frameworks.
