# PR_11_193C — V2 HTML-First Batch Correction

## Purpose
Correct the active Tool V2 migration lane by requiring Codex to implement testable HTML-first V2 shells while preserving the docs-first repo workflow.

## Scope
Apply to these V2 tools only:
- Palette Manager V2
- SVG Asset Studio V2
- Vector Map Editor V2
- Tilemap Studio V2
- Asset Browser V2

## Required Implementation Direction for Codex
Codex must make the implementation changes. ChatGPT does not author implementation code.

For each scoped V2 tool, Codex must ensure:
- `tools/<tool>-v2/index.html` owns the static shell.
- `index.html` contains the shared header mount: `<div id="shared-theme-header"></div>`.
- `index.html` owns CSS links, page shell, static markup, and module script loading.
- `index.js` is behavior-only.
- `index.js` must not inject page CSS, replace `document.body.innerHTML`, dynamically add the header script, or construct static layout strings.
- Tool name must end with `V2`.
- Tool id/path must use the V2 form, for example `palette-manager-v2`.
- Tool reads session-backed data only.
- No fallback data, default sample data, legacy copy/paste, or hidden test data.

## Hard Prohibitions
Do not change:
- schemas
- samples
- games
- Workspace Manager v1
- platformShell
- assetUsageIntegration
- tools/shared/*
- start_of_day folders

Do not add:
- helper classes
- abstraction layers
- alias variables
- repo-wide rewrites
- copied legacy implementations

## Required Runtime Logs
Codex must preserve or add scoped V2 logs where applicable:
- `[PALETTE_V2_ENTRY]`
- `[SVG_V2_ENTRY]`
- `[VECTOR_MAP_V2_ENTRY]`
- `[TILEMAP_V2_ENTRY]`
- `[ASSET_BROWSER_V2_ENTRY]`
- `[SESSION_CONTEXT_READ]`
- `[*_V2_CONTRACT_LOADED]`

## Acceptance Criteria
- Each scoped V2 tool opens directly from its own `tools/<tool>-v2/index.html`.
- Shared header/image area is mounted through `#shared-theme-header`.
- Static markup is testable in HTML without running layout-generating JS.
- JS only reads session, validates state, binds events, and renders dynamic data into existing nodes.
- Empty/error/valid states are visible and actionable.
- No legacy coupling is introduced.
- Targeted tests pass.
- Full samples smoke test is skipped with reason unless Codex changes shared sample loading/framework code.

## Roadmap Handling
If roadmap status is updated, only status marker transitions are allowed:
- `[ ]` to `[.]`
- `[.]` to `[x]`

Do not rewrite, delete, reflow, or paraphrase roadmap text.
