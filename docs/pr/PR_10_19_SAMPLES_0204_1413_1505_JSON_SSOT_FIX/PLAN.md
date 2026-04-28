# PLAN_PR_10_19_SAMPLES_0204_1413_1505_JSON_SSOT_FIX

## Purpose
Make Samples 0204, 1413, and 1505 use JSON as the source of truth for tool/sample asset data.

## Problem
Sample/tool data is currently split between JSON files and code-local definitions. This causes Asset Browser / Import Hub and related tools to show empty or mismatched data even when the sample preview has data.

## Scope
- Sample 0204 only where it relates to asset registry / Asset Browser input.
- Sample 1413 only where it relates to tool-visible sample data.
- Sample 1505 only where it relates to tool-visible sample data.
- Move or normalize canonical sample/tool data into JSON files.
- Update sample code to consume explicit JSON data.
- Update tool input handoff so tools consume the same JSON data.
- Preserve empty-state behavior when no explicit JSON data exists.
- Do not modify start_of_day folders.

## Non-Goals
- No broad engine refactor.
- No schema rewrite unless a minimal schema-compatible field is required.
- No fallback/demo/default data.
- No JS source scraping.
- No unrelated UI polish.

## Acceptance
- 0204, 1413, and 1505 each have JSON as canonical source of truth.
- Sample previews and matching tools consume the same JSON data.
- Asset Browser / Import Hub does not show `No assets loaded` when valid explicit JSON data exists.
- Empty state still appears when explicit JSON is absent or empty.
- No duplicate competing source-of-truth arrays remain in sample classes/modules.
