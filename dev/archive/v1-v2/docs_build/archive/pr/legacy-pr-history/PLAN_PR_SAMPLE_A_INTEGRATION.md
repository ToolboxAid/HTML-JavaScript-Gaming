Toolbox Aid
David Quesenberry
04/06/2026
PLAN_PR_SAMPLE_A_INTEGRATION.md

# PLAN_PR_SAMPLE_A_INTEGRATION

## Goal
Make Sample A visible and directly accessible from the game/sample launcher without changing hub structure.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## In Scope
- Add `network_sample_a` card entry in `games/index.html`.
- Follow existing card structure exactly.
- Include `Debug Showcase` labeling.
- Ensure navigation targets `/games/network_sample_a/index.html`.

## Out Of Scope
- Server dashboard work.
- Server containerization work.
- Engine/runtime changes.
- Index layout or structure redesign.

## Constraints
- Preserve existing order of current cards.
- No layout breaking.
- No nested links/buttons.
- No unrelated edits.

## Acceptance Criteria
- New Sample A card appears in hub.
- Card uses current card pattern.
- Card links correctly to Sample A route.
- Existing card order remains intact.
