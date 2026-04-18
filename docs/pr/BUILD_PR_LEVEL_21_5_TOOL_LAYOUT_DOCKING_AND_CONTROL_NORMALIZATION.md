# BUILD_PR_LEVEL_21_5_TOOL_LAYOUT_DOCKING_AND_CONTROL_NORMALIZATION

## Purpose
Execute the next combined safe tools polish lane by completing the remaining closely related UI/UX normalization work in one PR:

- normalize tool layout and spacing
- improve panel resizing and docking behavior
- ensure consistent control placement across tools

This PR should use the prior alignment/header pass as the baseline and finish the remaining shared polish work that belongs to the same interaction layer.

## Combined roadmap intent
This PR may advance the following items only if fully executed and validated:

### UI / UX Improvements
- `normalize tool layout and spacing` `[ ] -> [x]`
- `improve panel resizing and docking behavior` `[ ] -> [x]`
- `ensure consistent control placement across tools` `[ ] -> [x]`

If the repo contains a parent UI/UX track summary and this PR fully completes the remaining UI/UX items, update that parent only if validation proves completion.

## Scope
Included:
- normalize layout spacing across primary tools where shared shells/patterns exist
- improve or standardize panel resizing behavior where applicable
- improve or standardize panel docking behavior where applicable
- normalize placement of common controls across the in-scope tool set
- produce before/after validation evidence
- preserve unrelated working-tree changes

Excluded:
- no new feature work outside the layout/docking/control polish layer
- no broad redesign unrelated to shared tool UX
- no roadmap rewrites
- no `start_of_day` changes
- no speculative new tools

## Baseline inputs
Use:
- 21.2 UAT standardization outputs
- 21.3 automation / bugs / gaps baseline
- 21.4 header real-estate and alignment outputs

## Primary in-scope tool set
At minimum evaluate:
- Asset Browser
- Palette Browser
- Parallax Scene Studio
- Sprite Editor
- Tilemap Studio
- Vector Asset Studio
- Vector Map Editor
- Tool Host

Include additional tools where the same shell/layout model applies cleanly.

## Required outputs
Codex must create/update:

- `docs/dev/reports/BUILD_PR_LEVEL_21_5_TOOL_LAYOUT_DOCKING_AND_CONTROL_NORMALIZATION_LAYOUT_SPACING_AUDIT.md`
- `docs/dev/reports/BUILD_PR_LEVEL_21_5_TOOL_LAYOUT_DOCKING_AND_CONTROL_NORMALIZATION_DOCKING_RESIZING_MATRIX.md`
- `docs/dev/reports/BUILD_PR_LEVEL_21_5_TOOL_LAYOUT_DOCKING_AND_CONTROL_NORMALIZATION_CONTROL_PLACEMENT_MATRIX.md`
- `docs/dev/reports/BUILD_PR_LEVEL_21_5_TOOL_LAYOUT_DOCKING_AND_CONTROL_NORMALIZATION_VALIDATION.md`

If useful:
- before/after screenshots or references
- shared-shell normalization notes

## Layout and spacing requirements
For each in-scope tool:
- record current layout/spacing issues
- normalize major spacing inconsistencies
- preserve usability and clarity
- prefer shared shell conventions where available

## Docking and resizing requirements
For each in-scope tool:
- record current panel behavior
- normalize resize affordances where applicable
- normalize docking behavior where applicable
- explicitly record tools where docking/resizing is not applicable and why

## Control placement requirements
For common controls, document and align:
- open/load
- save/export
- project/sample actions
- preview/run actions
- settings/help/actions grouping

For each aligned control group, record:
- previous inconsistency
- new placement rule
- tools affected
- validation proof

## Acceptance
- spacing/layout is normalized for in-scope tools
- panel resizing/docking behavior is improved/normalized where applicable
- common control placement is consistent across the in-scope set
- before/after evidence is explicit
- no unrelated regressions introduced
- unrelated working-tree changes are preserved
- roadmap updates are status-only and execution-backed

## Validation requirements
Validation must confirm:
- layout/spacing audit completed
- docking/resizing matrix completed
- control placement matrix completed
- in-scope tools updated and validated
- no `start_of_day` changes
- unrelated working-tree changes preserved
- roadmap edits limited to items fully completed here

## Roadmap update rules
Only update status markers in:
- `docs/dev/roadmaps/MASTER_ROADMAP_TOOLS.md`

Allowed transitions only if fully executed and validated:
- `normalize tool layout and spacing` `[ ] -> [x]`
- `improve panel resizing and docking behavior` `[ ] -> [x]`
- `ensure consistent control placement across tools` `[ ] -> [x]`
