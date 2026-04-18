Toolbox Aid
David Quesenberry
04/06/2026
PLAN_PR_DEBUG_SURFACES_NETWORK_SAMPLE_C_FULL.md

# PLAN_PR_DEBUG_SURFACES_NETWORK_SAMPLE_C_FULL

## Goal
Deliver the next docs-first PR bundle for Level 11 by adding the complete implementation plan for **Network Sample C - Divergence / Trace Validation** and aligning the tracking docs that feed the games hub progression.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## In Scope
- `games/index.html`
  - add **Network Sample C** as a Level 11 card in the existing card grid only
  - preserve existing page structure
  - no new top showcase sections
  - include Play, Debug Mode, and Docs links in the same debug-showcase card pattern already used for Sample A and Sample B
- `docs/dev/NETWORK_SAMPLES_PLAN.md`
  - advance Track P to in-progress for Sample C planning
  - keep Track T and Track U visible as upcoming tracks, not falsely marked complete unless code is actually delivered
- `docs/operations/dev/BIG_PICTURE_ROADMAP.md`
  - remove broken icon usage in the relevant network/debug roadmap area
  - keep text-only headings for Track T and Track U
  - align Level 11 / Phase 13 wording with the network sample sequence
- docs/dev control/report files for this PR bundle

## Out Of Scope
- src/engine/runtime code changes
- server dashboard implementation
- docker/container implementation
- destructive layout changes in `games/index.html`

## Required Sample C Acceptance
- Sample C card appears under **Level 11 - Network Games** in the existing grid
- card title: `Network Sample C - Divergence / Trace Validation`
- card links include:
  - Play: `/games/network_sample_c/index.html`
  - Debug Mode: `/games/network_sample_c/index.html?debug=1`
  - Docs: `debug_showcase_tour.md`, `debug_showcase_getting_started.md`
- card copy emphasizes deterministic mismatch reproduction, event sequencing, divergence explanation, and validation flow
- `NETWORK_SAMPLES_PLAN.md` shows Track P as actively planned/in progress
- `BIG_PICTURE_ROADMAP.md` uses plain text section labels for the network/debug tracks with no broken icons

## Notes
- This is a **docs-only** planning bundle. Codex writes the code.
- Preserve the exact repo-relative structure in the implementation PR.
- Match the existing Sample A / Sample B card style instead of creating a new presentation pattern.
