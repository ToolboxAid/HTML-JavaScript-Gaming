# BUILD_PR_LEVEL_11_169_NEW_WORKSPACE_SHELL_CONTRACT_FIRST

## Purpose
Create a new clean `workspaceShell.js` path for Workspace Manager-hosted tools instead of continuing to patch or depend on legacy `platformShell.js`.

## Hard Architecture Rule
`workspaceShell.js` must be fully independent from `platformShell.js`.

Codex must not:
- import `platformShell.js` into `workspaceShell.js`
- import `workspaceShell.js` into `platformShell.js`
- copy code from `platformShell.js` into `workspaceShell.js`
- export platform shell helpers for workspace shell use
- share platform shell mutable state with workspace shell
- route hosted Workspace Manager badge/tile state through platform shell
- layer workspace shell on top of platform shell
- make platform shell the parent of workspace shell

These are parallel shells:

```text
platformShell.js   = standalone / legacy direct-open tools
workspaceShell.js  = Workspace Manager-hosted tools only
```

## Problem
The SVG Asset Studio tile/badge has remained stuck at `Asset: none` through repeated PRs from PR 11.154 onward. That proves the existing shared/platform shell path is too tangled with legacy global handoff behavior.

The correct fix is not another SVG-specific patch and not another `platformShell.js` dependency.

## Correct Direction
Workspace-hosted tools need their own contract-first shell layer:

`toolbox/shared/workspaceShell.js`

This shell must:
1. Load hosted session context.
2. Validate/extract the tool contract payload.
3. Confirm the tool has data.
4. Expose normalized loaded-state to Workspace Manager.
5. Only then wire/update Workspace tiles.

## Scope
One PR purpose only:
- Add a new Workspace-hosted shell path and wire SVG Asset Studio through it first as the proof case.

This is not a full cleanup PR.
This is not a repo-wide migration.
This is not a schema rewrite.
This is not a sample rewrite.

## Required New File
Create:

`toolbox/shared/workspaceShell.js`

## Required Behavior

### Hosted detection
Use URL/context facts:
- `hosted=1`
- `hostToolId`
- `hostContextId`

### Source of truth
Use hosted session context only:
- `readToolHostSharedContextFromLocation(window.location)`
- `payloadJson`
- `paletteJson` when present

Do not use:
- shared asset handoff
- legacy fallback data
- guessed sample names
- platformShell badge readers
- platformShell state
- platformShell helper exports
- copied platformShell logic

### Contract-first normalized state
`workspaceShell.js` must expose a small normalized state object with:

- `hosted`
- `toolId`
- `hostContextId`
- `payloadJson`
- `paletteJson`
- `loaded`
- `assetLabel`
- `paletteLabel`
- `statusLabel`
- `contractType`
- `errors`

### SVG Asset Studio first contract
For `svg-asset-studio`:

Contract:
- `payloadJson.vectorAssetDocument`

Loaded is true when:
- `vectorAssetDocument.svgText` exists and is a non-empty string

Asset label:
1. `vectorAssetDocument.sourceName` when present
2. `Inline SVG` when `svgText` exists but `sourceName` is missing
3. `none` only when not loaded

Status label:
- `Loaded` when loaded
- actionable error when missing/incomplete

### Workspace tile wiring
Do not wire/update a tile until the normalized shell state says `loaded=true`.

For this PR, wire only SVG Asset Studio through the new shell path.

### Legacy isolation
`platformShell.js` should remain in place for existing standalone/non-hosted paths.

Do not gut `platformShell.js` in this PR.
Do not import either shell into the other.

## Implementation Guardrails
- Do not modify schemas.
- Do not modify sample 1902 JSON.
- Do not modify unrelated tools.
- Do not create fallback data.
- Do not rely on `window.__TOOLS_HOST_SHARED_CONTEXT__` as a primary contract unless that is already the host context utility's documented storage.
- Do not migrate all 17 tools in this PR.
- Do not delete legacy code yet.
- Do not use platform shell code as a dependency, source, copy source, or parent layer.

## Dead Code Tracking
Create/update:

`docs_build/dev/reports/pr_11_169_legacy_shell_replacement_ledger.md`

Classify legacy paths found during implementation:

- KEEP_STANDALONE
- REPLACE_WITH_WORKSPACE_SHELL
- DELETE_LATER
- UNKNOWN

Do not delete `UNKNOWN`.

## Acceptance
- Sample 1902 Workspace Manager opens.
- SVG Asset Studio receives hosted contract.
- SVG Asset Studio data loads.
- SVG workspace tile/badge shows `Asset: sample-0901-ship.svg` or actual `sourceName`.
- `Asset: none` is not shown when `vectorAssetDocument.svgText` exists.
- `workspaceShell.js` does not import or copy from `platformShell.js`.
- `platformShell.js` does not import or call `workspaceShell.js`.
- Vector Map Editor remains unaffected.
- No new console errors.
- Targeted syntax checks pass.
- Full samples smoke skipped with documented reason.

## Validation
Run:
- `node --check toolbox/shared/workspaceShell.js`
- `node --check toolbox/shared/platformShell.js`
- `node --check "toolbox/Workspace Manager/main.js"`
- `node --check "toolbox/SVG Asset Studio/main.js"`

Manual:
- open sample 1902
- launch Workspace Manager
- mount SVG Asset Studio
- verify badge/tile label
