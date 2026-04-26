# Phase 20 Recovery UAT Validation

## Run Date

April 25, 2026

## Status

BLOCKED

## Inputs Read

- `docs/dev/codex_rules.md`
- `docs/dev/reports/tool_launch_ssot_routing_validation.md`
- `docs/dev/reports/tool_launch_ssot_data_layer_validation.md`
- `docs/dev/reports/legacy_launch_fallback_residue_validation.md`

`docs/dev/specs/TOOL_LAUNCH_SSOT.md` is not present at the requested path in this repository.

## 1. Samples Validation

Result: PASS

- Label is `Open <tool>` at `samples/index.render.js:104`.
- Launch uses SSoT resolver at `samples/index.render.js:92` -> `tools/shared/toolLaunchSSoT.js:62`.
- Resolved target path format is `tools/<tool>/index.html`:
  - `sampleLaunch.href = /tools/Sprite%20Editor/index.html?...`
- External launch memory clear remains intact via:
  - `samples/index.render.js:539`
  - `tools/shared/toolLaunchSSoT.js:121`
  - `tools/shared/toolLaunchSSoT.js:138`
- Missing/invalid context fails visibly:
  - `sampleMissingContext => href: ''`
  - `sampleMissingTarget => href: ''`
- No fallback/default route selection in sample launch resolver path.

## 2. Games Validation

Result: PASS

- Label is `Open with Workspace Manager` at `games/index.render.js:263`.
- Launch uses SSoT resolver at `games/index.render.js:148` -> `tools/shared/toolLaunchSSoT.js:95`.
- Resolved target path format is `tools/Workspace Manager/index.html`:
  - `gameLaunch.href = /tools/Workspace%20Manager/index.html?gameId=2001&mount=game`
- External launch memory clear remains intact via:
  - `games/index.render.js:419`
  - `tools/shared/toolLaunchSSoT.js:121`
  - `tools/shared/toolLaunchSSoT.js:138`
- Missing/invalid context fails visibly:
  - `gameInvalidContext => href: ''`
  - visible UI error path: `Workspace launch error` in `games/index.render.js:268`
- No fallback/default route selection in game launch resolver path.

## 3. Workspace Manager UAT

Result: FAIL

Validated route path:

`games/index.html -> Open with Workspace Manager -> /tools/Workspace%20Manager/index.html?gameId=2001&mount=game`

Pass evidence:

- Route resolves correctly from SSoT (`gameLaunch` output).
- Memory clear occurs before navigation (`assignCalls` output after clear).
- Explicit context load exists in Workspace Manager:
  - `writeToolHostSharedContext(...)` at `tools/Workspace Manager/main.js:381`
  - `hostMode: "game"` / `gameId: gameEntry.id` at `tools/Workspace Manager/main.js:386-387`

Fail evidence (fallback/default behavior still present):

- First-item default selection remains:
  - `tools/Workspace Manager/main.js:270` -> `return toolIds[0] || "";`
  - `tools/Workspace Manager/main.js:463`
  - `tools/Workspace Manager/main.js:475`
- Legacy compatibility query fallback remains:
  - `tools/Workspace Manager/main.js:153` (`searchParams.get("gameId") || searchParams.get("game")`)
  - `tools/Workspace Manager/main.js:284` (`url.searchParams.get("game") || url.searchParams.get("gameId")`)

## 4. Codex Rules Recheck (Summary)

- no alias variables: PASS
- no pass-through variables: PASS
- no duplicate launch state: PASS
- no duplicated launch paths: PASS
- no silent redirects: PASS
- no stale memory reuse: PASS
- no label-text/DOM-order guessing: PASS
- no fallback/default behavior in Workspace Manager gate path: FAIL

## Gate Result

Recovery gate cannot be locked in this run.

Next required BUILD_PR:

`BUILD_PR_LEVEL_20_13_REMOVE_WORKSPACE_MANAGER_DEFAULT_AND_QUERY_FALLBACKS`

## Validation Commands Executed

- `node --check tools/shared/toolLaunchSSoTData.js`
- `node --check tools/shared/toolLaunchSSoT.js`
- `node --check samples/index.render.js`
- `node --check games/index.render.js`
- `node --check tools/Workspace Manager/main.js`
- module scripts validating launch resolution, error behavior, and memory-clear behavior
