# BUILD_PR_LEVEL_21_4_TOOL_ALIGNMENT_AND_HEADER_REAL_ESTATE

## Purpose
Execute the next combined safe tools lane by using the 21.3 tool-quality baseline to drive two adjacent, compatible work streams in one PR:

- reduce real estate used by headers
- align functionality across tools where applicable

This PR should convert the cross-tool gaps and shared UI inconsistencies found in the baseline into a concrete, validated alignment pass.

## Combined roadmap intent
This PR may advance the following items only if fully executed and validated:

### UI / UX Improvements
- `reduce screen real estate used by headers` `[ ] -> [x]`

### Missing Functionality
- `align functionality across tools where applicable` `[ ] -> [x]`

### Optional additional advancement
If this PR also fully completes all remaining UI/UX items through real execution and validation, it may additionally advance:
- `normalize tool layout and spacing` `[ ] -> [x]`
- `improve panel resizing and docking behavior` `[ ] -> [x]`
- `ensure consistent control placement across tools` `[ ] -> [x]`

Do **not** update those optional items unless they are truly completed and validated in this same PR.

## Scope
Included:
- use the 21.3 bug/gap baseline as the source of truth for shared tool inconsistencies
- reduce header height, spacing, and vertical waste across primary tools where feasible
- standardize shared header behavior/patterns across tools
- align common tool capabilities where those capabilities should behave consistently
- normalize obvious shared control placement differences where tied directly to the header/alignment pass
- produce before/after validation evidence
- preserve unrelated working-tree changes

Excluded:
- no speculative new tools
- no unrelated feature expansion
- no broad design rewrite beyond the aligned header/capability pass
- no roadmap rewrites
- no `start_of_day` changes

## Baseline inputs
Use:
- tool UAT inventory from 21.2
- automation / bugs / missing functionality outputs from 21.3

If the 21.3 baseline identifies a subset of tools as highest-value for alignment, prioritize those first and record the prioritization rationale.

## Primary tool set
At minimum evaluate:
- Asset Browser
- Palette Browser
- Parallax Scene Studio
- Sprite Editor
- Tilemap Studio
- Vector Asset Studio
- Vector Map Editor
- Tool Host

Also include additional tools where the shared header/layout system applies cleanly.

## Required outputs
Codex must create/update:

- `docs/dev/reports/BUILD_PR_LEVEL_21_4_TOOL_ALIGNMENT_AND_HEADER_REAL_ESTATE_HEADER_REAL_ESTATE_AUDIT.md`
- `docs/dev/reports/BUILD_PR_LEVEL_21_4_TOOL_ALIGNMENT_AND_HEADER_REAL_ESTATE_TOOL_ALIGNMENT_MATRIX.md`
- `docs/dev/reports/BUILD_PR_LEVEL_21_4_TOOL_ALIGNMENT_AND_HEADER_REAL_ESTATE_VALIDATION.md`

If useful for validation evidence:
- before/after screenshots or report references
- shared pattern notes describing the normalized header/control model

## Header real-estate requirements
For each in-scope tool:
- record current header structure
- reduce unnecessary vertical usage where possible
- preserve usability and discoverability
- avoid hiding critical controls unless replaced with a clearly better compact pattern

Examples of valid changes:
- compact header rows
- accordion/collapsible secondary sections
- reduced padding/margins
- merged redundant labels/containers
- shared toolbar patterns

## Alignment requirements
For each aligned cross-tool capability, document:
- capability name
- tools affected
- previous inconsistency
- new aligned behavior
- validation proof

Examples of likely alignment candidates:
- load/open controls
- save/export controls
- project/sample picker placement
- preview/run controls
- header action grouping
- compact toolbar behavior

## Acceptance
- header real estate is reduced for in-scope tools
- aligned cross-tool behaviors are documented and validated
- before/after differences are explicit
- no unrelated regressions introduced
- unrelated working-tree changes are preserved
- roadmap updates are status-only and execution-backed

## Validation requirements
Validation must confirm:
- header audit completed
- alignment matrix completed
- in-scope tools updated and validated
- no `start_of_day` changes
- unrelated working-tree changes preserved
- roadmap edits limited to items fully completed here

## Roadmap update rules
Only update status markers in:
- `docs/dev/roadmaps/MASTER_ROADMAP_TOOLS.md`

Allowed transitions only if fully executed and validated:
- `reduce screen real estate used by headers` `[ ] -> [x]`
- `align functionality across tools where applicable` `[ ] -> [x]`

Optional additional transitions only if fully completed and validated in this PR:
- `normalize tool layout and spacing` `[ ] -> [x]`
- `improve panel resizing and docking behavior` `[ ] -> [x]`
- `ensure consistent control placement across tools` `[ ] -> [x]`
