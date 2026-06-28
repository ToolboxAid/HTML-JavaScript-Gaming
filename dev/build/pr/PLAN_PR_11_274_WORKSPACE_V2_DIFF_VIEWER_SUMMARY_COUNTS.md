# PLAN_PR_11_274_WORKSPACE_V2_DIFF_VIEWER_SUMMARY_COUNTS

## Purpose
Add explicit Diff Viewer summary counts in Workspace V2 so results are understandable without parsing raw JSON.

## Scope
- toolbox/workspace-v2/index.html
- toolbox/workspace-v2/index.js
- tests/runtime/V2DiffViewerSummaryCounts.test.mjs
- tests/runtime/V2DiffViewerMessaging.test.mjs (validation run)
- docs/report only

## Goals
- Add summary line above Diff JSON output.
- Show exact count summary for no-diff and diff-exists outcomes.
- Keep JSON output unchanged.
- Clear stale summary on selection/state changes.
- Preserve existing diff computation behavior.

## Out of Scope
- No diff algorithm changes.
- No schema changes.
- No non-Diff Viewer Workspace V2 behavior changes.

## Validation
- node --check toolbox/workspace-v2/index.js
- node --check tests/runtime/V2DiffViewerSummaryCounts.test.mjs
- node --check tests/runtime/V2DiffViewerMessaging.test.mjs
- node tests/runtime/V2DiffViewerSummaryCounts.test.mjs
- node tests/runtime/V2DiffViewerMessaging.test.mjs
