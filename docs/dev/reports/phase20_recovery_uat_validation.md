# Phase 20 Recovery UAT Validation

## Status

BLOCKED

## Required Inputs Read

- `docs/dev/codex_rules.md`
- `docs/dev/reports/tool_launch_ssot_routing_validation.md`
- `docs/dev/reports/tool_launch_ssot_data_layer_validation.md`
- `docs/dev/reports/legacy_launch_fallback_residue_validation.md`

`docs/dev/specs/TOOL_LAUNCH_SSOT.md` is still not present at the requested path in this repository.

## Validation Scope

Validation-only pass. No runtime implementation changes were made.

## Samples Validation

Result: PASS

- Action label remains `Open <tool>` in `samples/index.render.js:104`.
- Sample launch resolves through SSoT resolver in `samples/index.render.js:92` and `tools/shared/toolLaunchSSoT.js:62`.
- Target path resolves to `tools/<tool>/index.html` via SSoT data (`tools/shared/toolLaunchSSoTData.js:53`, `tools/shared/toolLaunchSSoTData.js:57`).
- External launch memory clear remains in use through `launchWithExternalToolWorkspaceReset` (`samples/index.render.js:539`, `tools/shared/toolLaunchSSoT.js:121`, `tools/shared/toolLaunchSSoT.js:138`).
- Missing/invalid context fails visibly:
  - `sampleMissingContext { href: '', error: 'Tool "sprite-editor" launch is missing sampleId.' }`
  - `sampleMissingTarget { href: '', error: 'Tool "not-a-real-tool" is not available in launch SSoT.' }`
- No default/fallback route chosen in sample launch resolver path.

## Games Validation

Result: PASS

- Action label remains `Open with Workspace Manager` in `games/index.render.js:263`.
- Game launch resolves through SSoT resolver in `games/index.render.js:148` and `tools/shared/toolLaunchSSoT.js:95`.
- Target path resolves to `tools/Workspace Manager/index.html` via SSoT data (`tools/shared/toolLaunchSSoTData.js:67`).
- External launch memory clear remains in use through `launchWithExternalToolWorkspaceReset` (`games/index.render.js:419`, `tools/shared/toolLaunchSSoT.js:121`, `tools/shared/toolLaunchSSoT.js:138`).
- Missing/invalid context fails visibly:
  - invalid source/type returns no href in `gameInvalidContext`.
  - missing game metadata href yields visible `Workspace launch error` text (`games/index.render.js:268`, `games/index.render.js:334`).
- No default/fallback route chosen in game launch resolver path.

## Workspace Manager UAT Validation

Result: FAIL

Validated path:

`games/index.html -> Open with Workspace Manager -> /tools/Workspace%20Manager/index.html?gameId=2001&mount=game`

Observed/pass evidence:

- Route is correct from SSoT (`gameLaunch` output).
- Memory clear is executed before navigation (`assignCalls` output after clear).
- Explicit context load logic exists (`writeToolHostSharedContext` with `hostMode: "game"`, `gameId`) in `tools/Workspace Manager/main.js:381-388`.

Blocking evidence (fallback/default residue still present in this touched flow file):

- Default first-item selection remains in Workspace Manager:
  - `tools/Workspace Manager/main.js:270` (`return toolIds[0] || "";`)
  - `tools/Workspace Manager/main.js:463` and `tools/Workspace Manager/main.js:475` (tool select fallback to `toolIds[0]`).
- Legacy compatibility branch remains for query fallback:
  - `tools/Workspace Manager/main.js:153` (`gameId || game`)
  - `tools/Workspace Manager/main.js:284` (`searchParams.get("game") || searchParams.get("gameId")`).

These branches violate the gate requirement that validated launch flow should not depend on default/fallback behavior.

## Gate Outcome

- Workspace Manager UAT requirement is not fully satisfied.
- Recovery gate cannot be locked in this PR.
- Next required repair PR: `BUILD_PR_LEVEL_20_13_REMOVE_WORKSPACE_MANAGER_DEFAULT_AND_QUERY_FALLBACKS`.

## Validation Commands Run

- `node --check tools/shared/toolLaunchSSoTData.js`
- `node --check tools/shared/toolLaunchSSoT.js`
- `node --check samples/index.render.js`
- `node --check games/index.render.js`
- `node --check tools/Workspace Manager/main.js`
- module validation scripts for launch ids, route resolution, error behavior, and memory-clear behavior
