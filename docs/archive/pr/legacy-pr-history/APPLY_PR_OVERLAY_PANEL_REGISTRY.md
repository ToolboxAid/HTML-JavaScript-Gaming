Toolbox Aid
David Quesenberry
04/05/2026
APPLY_PR_OVERLAY_PANEL_REGISTRY.md

# APPLY PR
## Overlay Panel Registry

## Apply Objective
Provide the execution checklist for implementing the overlay panel registry contract in a way that preserves the Dev Console / Debug Overlay boundary and keeps all integration sample-level.

## Apply Checklist
### Pre-Apply
- confirm overlay boundary PR docs are accepted
- confirm registry scope remains limited to overlay panels
- confirm no engine-core API changes are required
- confirm sample integration target remains `MultiSystemDemoScene.js`

### Implementation
- add or formalize overlay panel registry module
- add descriptor validation on registration
- update overlay host to consume registry snapshots only
- introduce narrow panel context adapter
- register initial sample panels through approved bootstrap path
- add optional public console commands only through registry contract if already aligned with existing command system

### Validation
- validate registration success for known-good descriptors
- validate duplicate rejection
- validate deterministic panel ordering
- validate enable/disable behavior
- validate conditional visibility
- validate no direct panel-to-console coupling
- validate no overlay host hardcoded sample branches
- validate `node --check` or equivalent on touched JS files

### Docs / Reporting
- update `docs/dev/reports/change_summary.txt`
- update `docs/dev/reports/validation_checklist.txt`
- update `docs/dev/reports/file_tree.txt`
- keep all BUILD/APPLY notes scoped to this PR purpose only

## Commit Comment Guidance
Use a commit comment centered on:
`Add clean overlay panel registry contract and sample-level panel registration path`

## Expected Outcome
After apply:
- overlay panels are registered through a stable public contract
- panel ordering is deterministic
- console remains an optional caller, not a co-renderer
- sample-level panels can be added or removed without changing overlay host internals

## Exit Criteria
This PR is complete when:
- a minimal panel set renders through the registry
- the overlay host has no panel-specific special cases for those panels
- the contract is documented and validated
- no engine-core breakage is introduced

## Not In This Apply PR
- overlay presets
- layout themes
- graph widgets
- cross-session persistence
- broad debug framework redesign

## Recommended Next Command
Move to:
`BUILD_PR_OVERLAY_PANEL_PRESETS_AND_TOGGLES`
only after registry validation is stable.
