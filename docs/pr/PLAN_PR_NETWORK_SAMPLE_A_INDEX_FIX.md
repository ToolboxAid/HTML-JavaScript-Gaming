Toolbox Aid
David Quesenberry
04/06/2026
PLAN_PR_NETWORK_SAMPLE_A_INDEX_FIX.md

# PLAN_PR_NETWORK_SAMPLE_A_INDEX_FIX

## Goal
Repair and finalize Network Sample A visibility in the launcher index while preserving the current page structure and ordering.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## In Scope
- `games/index.html` update/fix for Network Sample A integration.
- Keep card structure aligned with existing index conventions.
- Keep `Debug Showcase` labeling on Sample A entry.
- Ensure navigation to `/games/network_sample_a/index.html`.
- Update docs/dev control and report artifacts for this PR bundle.

## Out Of Scope
- Server dashboard/containerization tracks.
- Engine/runtime changes.
- Broad layout redesign of index pages.

## Constraints
- Preserve existing order of existing cards/sections.
- No top-level showcase block insertion.
- No destructive edits.
- No unrelated file changes.

## Acceptance Criteria
- Sample A is visible in `games/index.html`.
- Sample A navigation path is reachable.
- Existing index structure/order is preserved.
- Bundle packages only PR-relevant files.
