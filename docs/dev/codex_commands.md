# Codex Commands — PR_11_197B

Model: GPT-5.4-codex
Reasoning: high

## Execute

Use this PR as a Codex implementation task. Do not ask questions. Make the smallest scoped valid change.

### Required Task
Complete Asset Browser V2 as the testable implementation target and bundle it with V2 validation hardening.

### Scope Lock
Only edit files required for:
- `tools/asset-browser-v2/index.html`
- `tools/asset-browser-v2/index.js`
- narrowly scoped V2 validation/test files if needed
- docs/dev/reports evidence
- docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md status-only marker change if execution-backed

Do not edit schemas, samples, games, Workspace Manager v1, platformShell, or `tools/shared/*`.

### Implementation Rules
- Re-engineer the tool. Do not copy/paste legacy Asset Browser code.
- `index.html` owns static shell, CSS links, header mount, layout, and DOM nodes.
- `index.js` owns behavior only.
- Use `data-tool-id="asset-browser-v2"`.
- Header mount must be `<div id="shared-theme-header"></div>`.
- Use existing `src/engine/theme` and existing accordion styling where applicable.
- Use two menu areas only if needed: `menuTool` and `menuWorkspace`.
- Read session data only, using the established V2 hostContextId/session pattern.
- Do not fetch, guess, synthesize, default, or fallback data.
- Empty state and invalid state must be explicit and actionable.
- No helper classes. Single class only.
- No alias/pass-through variables.
- No abstraction layers.

### Banned Patterns
Reject your own diff if it includes:
- `document.body.innerHTML` for page construction
- `document.head.insertAdjacentHTML` for CSS/style injection
- dynamic header script injection from JS
- `platformShell`
- `assetUsageIntegration`
- `tools/shared/`
- Workspace Manager v1 wiring
- fallback/default/sample data
- copied legacy code blocks

### Validation Commands
Run targeted validation only:

1. Syntax checks for changed JS files.
2. Static checks for V2 shell compliance:
   - Asset Browser V2 `index.html` includes `shared-theme-header`.
   - Asset Browser V2 `index.js` does not include `document.body.innerHTML`.
   - Asset Browser V2 `index.js` does not include `document.head.insertAdjacentHTML`.
   - Asset Browser V2 references `asset-browser-v2`.
3. Manual/UAT or lightweight browser validation evidence for:
   - direct open empty state
   - invalid session state
   - valid session state render
   - shared header visible

Do not run full samples smoke unless a broad shared sample loader/framework file is changed. If skipped, document why.

### Evidence
Write results to:

`docs/dev/reports/PR_11_197B_v2_asset_browser_validation.md`

Include:
- files changed
- validation commands run
- pass/fail results
- full samples smoke skipped/running decision and reason
- screenshots/log snippets if available

### Final Artifact
Create final ZIP at:

`tmp/PR_11_197B.zip`

The ZIP must preserve repo-relative structure and include implementation changes and evidence.
