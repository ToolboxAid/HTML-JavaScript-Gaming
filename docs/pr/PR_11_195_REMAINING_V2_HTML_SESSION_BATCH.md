# PR_11_195 — Remaining V2 HTML-First + Session-Only Batch

## Purpose
Continue the V2 re-engineer lane with a larger, testable Codex batch. This PR must convert the next remaining V2 tools to the approved architecture without copying legacy implementation patterns.

## Scope
Codex must identify the next remaining V2 tools that still violate the V2 rules and update only those tools.

Required architecture:
- `tools/<tool>-v2/index.html` owns static shell, CSS links, shared header mount, menu regions, and app root markup.
- `tools/<tool>-v2/index.js` owns behavior only: session read, validation, DOM population, rendering into existing nodes, and empty/error state updates.
- V2 tool names shown to users must end with `V2`.
- Body tool id must use the V2 id, for example `palette-manager-v2`.
- Header mount must be literal: `<div id="shared-theme-header"></div>`.
- Header/theme script belongs in `index.html`, not dynamically inserted by JS.

## Hard No
- No schema changes.
- No sample changes.
- No game changes.
- No Workspace Manager v1 work.
- No `platformShell`.
- No `tools/shared/*`.
- No `assetUsageIntegration`.
- No tool aliases.
- No fallback/default/sample data.
- No helper classes.
- No abstraction layers.
- No copy/paste from legacy tools.
- No repo-wide cleanup.

## Codex Implementation Requirements
For each touched V2 tool:
1. Move all static HTML structure to `index.html`.
2. Move all static CSS links and page styles to `index.html` or an existing tool-local stylesheet if one already exists.
3. Remove JS-driven shell creation, including:
   - `document.body.innerHTML = ...`
   - `document.head.insertAdjacentHTML(...)`
   - dynamic creation of the shared header script
   - generated static menus or generated static shell markup
4. Keep `index.js` behavior-only.
5. Ensure empty/error state is visible and actionable without using fallback data.
6. Ensure valid session data renders the tool surface.
7. Ensure no legacy route or v1 dependency is introduced.

## Validation
Run targeted validation only. Do not run the full samples smoke test unless Codex changes shared sample loader/framework code.

Required checks:
- `node --check` for every changed `.js` file.
- Static grep/report proving changed V2 JS files do not contain:
  - `document.body.innerHTML`
  - `document.head.insertAdjacentHTML`
  - `platformShell`
  - `assetUsageIntegration`
  - `tools/shared/`
- Confirm each changed V2 `index.html` contains:
  - `id="shared-theme-header"`
  - module script for `../../src/engine/theme/mount-shared-header.js`
  - module script for `./index.js`
- Record validation results in `docs/dev/reports/PR_11_195_validation.md`.

## Roadmap
Only update the master roadmap status marker if the execution directly completes or advances an existing matching V2 re-engineer roadmap line.
Do not rewrite roadmap text.
Do not delete roadmap text.
Do not add unrelated roadmap content.

## Acceptance
- Larger batch than the previous micro-PRs.
- Codex writes implementation code.
- ChatGPT bundle contains no implementation code.
- Changes are testable.
- Evidence exists under `docs/dev/reports/`.
- Final Codex output ZIP is placed at `<project folder>/tmp/PR_11_195.zip`.
