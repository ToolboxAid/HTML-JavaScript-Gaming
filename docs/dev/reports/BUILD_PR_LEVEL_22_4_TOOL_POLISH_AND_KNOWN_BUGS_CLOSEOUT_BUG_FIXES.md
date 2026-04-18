# BUILD_PR_LEVEL_22_4_TOOL_POLISH_AND_KNOWN_BUGS_CLOSEOUT — Bug Fixes

## Source Reports Reviewed
- `docs/dev/reports/tool_known_bugs.md`
- `docs/dev/reports/tool_missing_functionality.md`
- `docs/dev/reports/BUILD_PR_LEVEL_21_3_TOOL_AUTOMATION_AND_TOOL_QUALITY_BASELINE_AUTOMATION_RESULTS.md`

## High-Impact Bugs Closed

### TB-001 (Resolved)
- Surface: Tools Index / Registry validation surface
- Prior issue: `validate-tool-registry` false positives for utility folders and preserved legacy entries.
- Fix state: validator now passes against active contract.
- Evidence: `node ./scripts/validate-tool-registry.mjs` => `TOOL_REGISTRY_VALID`.

### TB-002 (Resolved)
- Surface: Tools Index / Registry validation surface
- Prior issue: `validate-active-tools-surface` hard-failed on missing historical PR doc.
- Fix state: validator treats historical-doc checks as optional and validates active surface contract.
- Evidence: `node ./scripts/validate-active-tools-surface.mjs` => `ACTIVE_TOOLS_SURFACE_VALID`.

## Supporting Code/Test Updates in This PR
- `tools/Tool Host/main.js`
  - added control-state synchronization (`syncControlState`) for consistent enabled/disabled behavior.
  - added accessible standalone-link disabled state handling (`aria-disabled`, tab/pointer safeguards).
- `tools/Tool Host/index.html`
  - added `aria-live="polite"` to status/meta live regions.
- `tests/tools/ToolHostDispatchContract.test.mjs`
  - expanded assertions to lock UX control-state and accessibility contract behavior.
- `docs/dev/reports/tool_known_bugs.md`
  - updated TB-001/TB-002 statuses to Resolved and updated tool-surface summary row.

## Scope Guard Confirmation
- No broad redesign.
- No start_of_day changes.
- No feature expansion beyond bug fixes and minor polish.
