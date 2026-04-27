# BUILD_PR_LEVEL_10_6R_TOOL_UI_CONTROL_INVENTORY_COMPLETION

## Purpose
Produce the complete tool UI control inventory and gap analysis needed to finish the Tool UI Readiness Definition of Done.

## Scope
- Docs/report generation only.
- No implementation code changes.
- No runtime behavior changes.
- No roadmap rewrite.
- Do not modify start_of_day folders.

## Required Codex Outputs
Create or update these repo-relative files:

- docs/dev/reports/PR_10_6R_tool_ui_control_inventory.md
- docs/dev/reports/PR_10_6R_tool_ui_control_gaps.md

## Required Inventory Format
For every tool, every required visible control must be listed with this exact structure:

```text
TOOL: <tool-id>

CONTROL: <control-id>
REQUIRES: <data field/path required by this control>
BINDING: <how the UI consumes the loaded data>
DEFAULT_ALLOWED: false
LIFECYCLE: <when this control may initialize/update/reset>
FAIL_IF:
  - <failure condition>
  - <failure condition>
```

## Required Coverage
Inventory must cover all sample/game-launched tools, including at minimum:

- sprite-editor
- palette-browser
- asset-browser / import hub
- tilemap-studio
- vector-asset-studio
- vector-map-editor
- replay/event tools if present
- manifest/data-flow inspector if present
- workspace manager / launcher tool if present
- game/sample launch tile flow

Codex must add any additional tools it finds.

## Required DoD Rules
A tool is not considered ready because a file loaded. A tool is ready only when all required controls prove they consumed loaded data.

For every required control, Codex must map:

```text
control -> required data -> binding -> lifecycle -> failure states
```

## Lifecycle / Timer Rules
Codex must explicitly check for and document lifecycle risks:

- no auto-close timers unless explicitly defined
- no UI reset after load unless user-triggered
- no re-initialization after successful load
- no delayed state overwrite from setTimeout/debounce/async completion
- accordions must not close automatically after being opened by the user

## No Default Data Rule
The following must not use fallback/demo/default data:

- palette
- sprite project
- tilemap
- tileset
- vector map
- vector asset
- events/replay data
- approved asset list

## Palette SSoT Rule
Codex must assert:

- one canonical palette per sample
- canonical file is `*.palette.json`
- all tools use the same canonical palette
- no duplicated palette data in `*.palette-browser.json`
- if `*.palette-browser.json` exists, it must be reported as a gap unless it contains no duplicated palette payload

## Gap Report Requirements
`docs/dev/reports/PR_10_6R_tool_ui_control_gaps.md` must list:

- missing controls
- controls without required data
- controls using defaults/fallbacks
- controls with lifecycle/timer risks
- controls not mapped to manifest-declared inputs
- any tool where Codex is uncertain about required controls or fields

## Acceptance
Codex is done only when it can report:

```text
0 missing controls OR every missing control is listed as a gap
0 unknown bindings OR every unknown binding is listed as a gap
0 default usage OR every default usage is listed as a gap
0 lifecycle violations OR every lifecycle violation is listed as a gap
```

This PR does not require user UAT. It prepares the DoD checklist that will make UAT systematic.
