# PR_26128_005 Workspace Repo Destination Control

## Changes
- Copied the Preview Generator V2 Repo Destination control UI into the top-left Workspace Manager V2 column.
- Added `tools/workspace-manager-v2/js/controls/RepoDestinationControl.js` with the same display/visibility/pick-handler control pattern used by Preview Generator V2.
- Wired the Workspace Manager V2 control locally through `bootstrap.js` and `WorkspaceManagerV2App.js`.
- The Workspace Manager V2 picker updates only the visible Repo selected value and status log.

## Guardrails
- No sessionStorage, toolState, launch payload, schema, or runtime contract behavior was changed.
- No cross-tool communication was added.
- No repo write behavior was added or changed.
- No sample JSON was modified.
- No roadmap content was modified.

## Validation
- `npm run test:workspace-v2` -> PASS, 10 tests.
- Targeted Workspace Manager V2 launch validation -> PASS.
- Verified Repo Destination is the first accordion in the Workspace Manager V2 left column.
- Verified Workspace Manager V2 Repo Destination pick updates only the local display value.
- Verified Workspace Manager V2 Workspace JSON and sessionStorage remain unchanged after Repo Destination pick.
- Verified no `toolState` session keys are created by the Repo Destination pick.
- Verified existing Preview Generator V2 Repo Destination picker still updates the Preview Generator V2 selected repo display.
- Verified no direct-write/tool-communication endpoint identifiers were introduced in Workspace Manager V2 or Preview Generator V2 runtime files.

## Skipped
- Full samples smoke test was skipped by request. This PR changes only the Workspace Manager V2 Repo Destination UI/control surface, and the targeted Workspace Manager V2 plus Preview Generator V2 checks cover the affected behavior.
