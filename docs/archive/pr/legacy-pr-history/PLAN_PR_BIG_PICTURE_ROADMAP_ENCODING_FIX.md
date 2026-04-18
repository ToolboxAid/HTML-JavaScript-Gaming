Toolbox Aid
David Quesenberry
04/06/2026
PLAN_PR_BIG_PICTURE_ROADMAP_ENCODING_FIX.md

# PLAN_PR_BIG_PICTURE_ROADMAP_ENCODING_FIX

## Goal
Normalize `docs/archive/dev-ops/BIG_PICTURE_ROADMAP.md` encoding so the file renders consistently across Windows tooling without changing roadmap content or bracket states.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## In Scope
- Encoding normalization for `docs/archive/dev-ops/BIG_PICTURE_ROADMAP.md`.
- Validation that bracket-state rows remain unchanged.
- Docs/dev control files and reports for this one PR purpose.

## Out Of Scope
- Any roadmap wording edits.
- Any roadmap structure edits.
- Any bracket state progress changes.
- Engine, runtime, sample, or tool implementation changes.

## Behavior Contract
1. Preserve text content exactly.
2. Preserve line ordering and list ordering.
3. Preserve every bracket token (`[ ]`, `[.]`, `[x]`) exactly.
4. Apply UTF-8 with BOM for robust Windows decoding.

## Acceptance Criteria
- Roadmap opens cleanly in Windows and browser tooling.
- No semantic roadmap changes.
- Bracket rows match pre-fix values exactly.
- No non-doc runtime/code files changed.
