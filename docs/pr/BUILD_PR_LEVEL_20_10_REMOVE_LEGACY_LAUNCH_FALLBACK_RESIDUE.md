# BUILD_PR_LEVEL_20_10_REMOVE_LEGACY_LAUNCH_FALLBACK_RESIDUE

## Purpose

Remove remaining legacy launch routing residue, duplicated launch paths, and default/fallback behavior after the 20_9 SSoT data-layer PR.

## Scope

One PR purpose only:

- inspect launch-related files touched by 20_8 and 20_9
- remove legacy routing residue only where superseded by the launch SSoT
- remove default/fallback launch behavior only where superseded by the launch SSoT
- preserve exact UI labels:
  - samples: `Open <tool>`
  - games: `Open with Workspace Manager`
- preserve external launch memory clear behavior

## Required Inputs

Codex must read:

- `docs/dev/specs/TOOL_LAUNCH_SSOT.md`
- `docs/dev/reports/tool_launch_ssot_routing_validation.md`
- `docs/dev/reports/tool_launch_ssot_data_layer_validation.md`

If a required report is missing, Codex must create a blocked report and stop without implementation changes.

## Hard Constraints

Codex must NOT:

- perform repo-wide cleanup
- rewrite unrelated files
- alter required launch labels
- introduce new routing abstractions
- create a second SSoT
- add default or fallback behavior
- silently redirect missing launch context
- preserve stale memory on external launches
- modify `start_of_day`
- rewrite roadmap text except status markers

## Legacy Residue to Remove

Only in touched launch flow files, remove or replace:

- duplicated hardcoded launch target paths
- default tool selection
- default Workspace Manager selection
- fallback route selection
- fallback launch type
- stale query-param fallback behavior
- stale localStorage/sessionStorage launch reuse
- first-tile or first-tool auto-selection
- label-text route guessing
- DOM-order route guessing
- compatibility branches that bypass SSoT

## Required Failure Behavior

If launch data is missing or invalid:

- fail visibly
- report the missing field or invalid value
- do not guess
- do not select first item
- do not reuse old memory
- do not silently redirect

## Required Validation

Codex must create:

- `docs/dev/reports/legacy_launch_fallback_residue_validation.md`

Validation must include:

- changed files
- exact residue removed
- proof sample labels remain `Open <tool>`
- proof game labels remain `Open with Workspace Manager`
- proof sample paths resolve from SSoT
- proof game Workspace Manager path resolves from SSoT
- proof external launch memory clear remains intact
- proof missing target/context fails visibly
- proof no default/fallback residue remains in touched launch flow
- anti-pattern self-check

## Acceptance

- No fallback/default behavior remains in touched launch flow.
- No duplicated launch paths remain in touched launch flow.
- SSoT is still the only routing authority.
- Required labels are preserved.
- UAT paths remain intact.
- Validation report exists.
