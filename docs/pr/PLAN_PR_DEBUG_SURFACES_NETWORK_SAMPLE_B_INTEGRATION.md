Toolbox Aid
David Quesenberry
04/06/2026
PLAN_PR_DEBUG_SURFACES_NETWORK_SAMPLE_B_INTEGRATION.md

# PLAN_PR_DEBUG_SURFACES_NETWORK_SAMPLE_B_INTEGRATION

## Goal
Deliver a small integration PR for Network Sample B visibility in `games/index.html` Level 11 and keep network tracking docs aligned.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## In Scope
- `games/index.html` Level 11 Sample B Debug Showcase card presence and format
- Sample B card links:
  - Play
  - Debug Mode
  - Docs links
- `docs/dev/NETWORK_SAMPLES_PLAN.md` Track O checklist status
- docs/dev control/report updates for this PR bundle

## Out Of Scope
- server changes
- container changes
- engine changes

## Rules
- preserve existing page structure
- no top section additions
- match existing Debug Showcase card format

## Acceptance
- Sample B card is present under Level 11 in the existing card grid
- Play/Debug/docs links are present in the card meta line pattern
- Track O status is updated/verified as `[x]`
- `BIG_PICTURE_ROADMAP.md` remains unchanged unless explicit bracket-only justification exists
